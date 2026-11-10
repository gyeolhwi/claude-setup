// herdr 창 → Claude Code 대화 기록(jsonl) → 카드 요약 (내 지시 · 지금 하는 일 · 결과/질문)
// 짝짓기: 창의 foreground `claude` pid → ~/.claude/sessions/<pid>.json 의 sessionId → ~/.claude/projects/<cwd 슬러그>/<sessionId>.jsonl
import { open, stat, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join } from "node:path";

const CLAUDE = join(homedir(), ".claude");
const TAIL = 2 * 1024 * 1024; // 기록 끝 2MB만 읽는다. 지시가 그 안에 없으면 20MB까지는 통째로
const FULL_MAX = 20 * 1024 * 1024;

export interface AgentSummary {
  prompt: string | null;      // 내가 마지막에 보낸 지시
  promptAt: number | null;
  doing: string | null;       // 지금 하는 일 한 줄 (마지막 도구 호출을 사람 말로)
  lastAt: number | null;      // 마지막 활동 시각
  result: string | null;      // 지시 이후 에이전트의 마지막 답변 (Markdown)
  question: { header?: string; question: string; options: string[] }[] | null; // 답을 기다리는 질문
  pending: string | null;     // 승인 대기 중인 도구 (질문이 아닌 경우)
  todos: { done: number; total: number; current: string | null } | null;
}

type Sh = (cmd: string[], cwd: string) => Promise<string>;

const pidCache = new Map<string, { pid: number | null; at: number }>();
async function claudePid(pane: string, sh: Sh, cwd: string): Promise<number | null> {
  const c = pidCache.get(pane);
  if (c && Date.now() - c.at < 30_000) return c.pid;
  let pid: number | null = null;
  try {
    const info = JSON.parse(await sh(["herdr", "pane", "process-info", "--pane", pane], cwd))?.result?.process_info;
    pid = info?.foreground_processes?.find((p: any) => p.name === "claude")?.pid ?? info?.foreground_process_group_id ?? null;
  } catch {}
  pidCache.set(pane, { pid, at: Date.now() });
  return pid;
}

async function transcriptOf(pid: number): Promise<string | null> {
  try {
    const s = JSON.parse(await readFile(join(CLAUDE, "sessions", `${pid}.json`), "utf8"));
    if (!s.sessionId || !s.cwd) return null;
    return join(CLAUDE, "projects", String(s.cwd).replace(/[^A-Za-z0-9]/g, "-"), `${s.sessionId}.jsonl`);
  } catch { return null; }
}

async function readRecords(file: string, size: number, whole: boolean): Promise<any[]> {
  const start = whole ? 0 : Math.max(0, size - TAIL);
  const fh = await open(file, "r");
  try {
    const buf = Buffer.alloc(size - start);
    await fh.read(buf, 0, buf.length, start);
    const lines = buf.toString("utf8").split("\n");
    if (start > 0) lines.shift(); // 잘린 첫 줄
    const out: any[] = [];
    for (const l of lines) { if (l) try { out.push(JSON.parse(l)); } catch {} }
    return out;
  } finally { await fh.close(); }
}

const ts = (r: any) => (r?.timestamp ? Date.parse(r.timestamp) : null);
const short = (s: string, n = 80) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const file = (p: unknown) => (typeof p === "string" ? basename(p) : "");

// 사람이 직접 보낸 지시인가 (도구 결과·스킬 본문·시스템 주입 제외)
function promptText(r: any): string | null {
  if (r.type !== "user" || r.isMeta || r.isCompactSummary) return null;
  const c = r.message?.content;
  const t = typeof c === "string" ? c : Array.isArray(c) && !c.some((b: any) => b.type === "tool_result")
    ? c.filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n") : "";
  const s = t.trim();
  if (!s || s.startsWith("<") || s.startsWith("[Request interrupted") || s.startsWith("Base directory for this skill")) return null;
  return s;
}

function describe(tool: any): string {
  const i = tool.input ?? {};
  switch (tool.name) {
    case "Bash": return i.description ? short(i.description) : "명령 실행";
    case "Edit": case "MultiEdit": return `${file(i.file_path)} 수정`;
    case "Write": return `${file(i.file_path)} 작성`;
    case "Read": return `${file(i.file_path)} 읽기`;
    case "Grep": case "Glob": return "코드 검색";
    case "WebSearch": return `웹 검색: ${short(String(i.query ?? ""), 50)}`;
    case "WebFetch": return "웹 페이지 읽기";
    case "Agent": case "Task": return `하위 에이전트: ${short(String(i.description ?? ""), 50)}`;
    case "Skill": return `스킬 ${i.skill ?? ""} 실행`;
    case "AskUserQuestion": return "질문하는 중";
    case "TodoWrite": return "할 일 정리";
    default: return tool.name?.startsWith("mcp__") ? `${tool.name.split("__").pop()} 도구 사용` : `${tool.name} 사용`;
  }
}

function summarize(recs: any[]): AgentSummary | null {
  let pi = -1;
  for (let i = recs.length - 1; i >= 0; i--) if (promptText(recs[i])) { pi = i; break; }
  if (pi < 0) return null;
  const sum: AgentSummary = { prompt: promptText(recs[pi]), promptAt: ts(recs[pi]), doing: null, lastAt: ts(recs[pi]),
    result: null, question: null, pending: null, todos: null };
  const answered = new Set<string>();
  let lastTool: any = null;
  let lastText: string | null = null;
  for (let i = pi + 1; i < recs.length; i++) {
    const r = recs[i];
    if (r.type !== "assistant" && r.type !== "user") continue;
    sum.lastAt = ts(r) ?? sum.lastAt;
    const c = r.message?.content;
    if (!Array.isArray(c)) continue;
    for (const b of c) {
      if (b.type === "tool_result") answered.add(b.tool_use_id);
      else if (b.type === "tool_use") { lastTool = b; if (b.name === "TodoWrite") sum.todos = todosOf(b.input?.todos); }
      else if (b.type === "text" && r.type === "assistant" && b.text?.trim()) { lastText = b.text.trim(); lastTool = null; }
    }
  }
  sum.result = lastText;
  if (lastTool) {
    sum.doing = describe(lastTool);
    if (!answered.has(lastTool.id)) {
      if (lastTool.name === "AskUserQuestion") {
        sum.question = (lastTool.input?.questions ?? []).map((q: any) => ({
          header: q.header, question: String(q.question ?? ""), options: (q.options ?? []).map((o: any) => String(o.label ?? "")),
        }));
      } else sum.pending = sum.doing;
    }
  }
  return sum;
}

function todosOf(list: any): AgentSummary["todos"] {
  if (!Array.isArray(list) || !list.length) return null;
  return { done: list.filter((t) => t.status === "completed").length, total: list.length,
    current: list.find((t) => t.status === "in_progress")?.activeForm ?? null };
}

const cache = new Map<string, { key: string; sum: AgentSummary | null }>();
export async function agentSummary(pane: string, agent: string, sh: Sh, cwd: string): Promise<AgentSummary | null> {
  if (agent !== "claude") return null; // Codex 기록 형식은 아직 지원하지 않음
  const pid = await claudePid(pane, sh, cwd);
  if (!pid) return null;
  const f = await transcriptOf(pid);
  if (!f) return null;
  let st;
  try { st = await stat(f); } catch { return null; }
  const key = `${f}:${st.size}:${st.mtimeMs}`;
  const hit = cache.get(pane);
  if (hit?.key === key) return hit.sum;
  let sum = summarize(await readRecords(f, st.size, false));
  if (!sum && st.size > TAIL && st.size <= FULL_MAX) sum = summarize(await readRecords(f, st.size, true));
  cache.set(pane, { key, sum });
  return sum;
}
