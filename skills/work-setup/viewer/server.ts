// Work Viewer — ~/Work 폴더·문서·에이전트를 브라우저에서 실시간으로 보는 읽기 전용 서버.
import { watch, realpathSync, statSync, existsSync } from "node:fs";
import { readdir, stat, realpath } from "node:fs/promises";
import { join, resolve, relative, basename, extname, sep } from "node:path";
import { agentSummary } from "./agent-summary.ts";

const ROOT = realpathSync(resolve(process.env.WORK_ROOT ?? `${process.env.HOME}/Work`));
const PORT = Number(process.env.PORT ?? 7320);
const HOST = process.env.HOST ?? "127.0.0.1";
const PUBLIC = join(import.meta.dir, "public");

// 실시간 감시에서 빼는 경로 조각 (잡음이 많거나 볼 일이 없는 것)
const NOISE = [/(^|\/)\.git(\/|$)/, /node_modules/, /__pycache__/, /(^|\/)\.omc(\/|$)/, /(^|\/)\.cache(\/|$)/,
  // 빌드·개발 서버 캐시 (Next.js .next, Turborepo, Vite, Nuxt, Svelte, Parcel, 파이썬 도구 캐시)
  /(^|\/)\.(next|turbo|nuxt|svelte-kit|parcel-cache|vite|pytest_cache|mypy_cache|ruff_cache)(\/|$)/,
  /\.swp$/, /~$/, /\.DS_Store$/, /(^|\/)venvs\//, /\.tmp$/, /(^|\/)\.ovis(\/|$)/,
  /\.tmp\.\d+\.[0-9a-f]+$/, /(^|\/)sed[A-Za-z0-9]{6}$/, /\.sw[a-p]x?$/, /(^|\/)\.#/, /(^|\/)4913$/, /\.crswap$/];
// 원자적 저장(임시 파일에 쓰고 이름 바꾸기)을 '수정'으로 보기 위한 기록
const TMP_WRITE = /^(.*)\.tmp\.\d+\.[0-9a-f]+$/;
const recentTmp = new Map<string, number>();
// 목록·검색에서 숨기는 이름
const HIDDEN = new Set([".git", "node_modules", "__pycache__", ".DS_Store", ".omc"]);
// 내용을 내려주지 않는 파일 (이름만 보임)
const SECRET = [/^\.env(\..*)?$/, /\.pem$/, /\.key$/, /^id_(rsa|ed25519|ecdsa)/, /credentials/i, /\.p12$/];

const TEXT_EXT = new Set([".md", ".txt", ".json", ".yaml", ".yml", ".toml", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".sh", ".bash", ".zsh", ".css", ".scss", ".html", ".htm", ".php", ".sql", ".xml", ".svg", ".csv", ".tsv", ".ini",
  ".conf", ".cfg", ".env.example", ".log", ".rs", ".go", ".java", ".kt", ".rb", ".lua", ".vue", ".svelte", ".gitignore",
  ".gitattributes", ".service", ".lock", ".dockerfile", ".asp", ".jsp", ".htaccess"]);
const MIME: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".avif": "image/avif", ".ico": "image/x-icon", ".bmp": "image/bmp", ".pdf": "application/pdf",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".mp3": "audio/mpeg", ".wav": "audio/wav",
  ".html": "text/plain; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".woff2": "font/woff2", ".otf": "font/otf", ".ttf": "font/ttf",
};

// ---------- 경로 안전 ----------
async function safe(rel: string): Promise<string | null> {
  const clean = (rel ?? "").replace(/^\/+/, "");
  const abs = resolve(ROOT, clean);
  if (abs !== ROOT && !abs.startsWith(ROOT + sep)) return null;
  try {
    const real = await realpath(abs);
    if (real !== ROOT && !real.startsWith(ROOT + sep)) return null;
    return real;
  } catch { return null; }
}
const relOf = (abs: string) => relative(ROOT, abs).split(sep).join("/");
const isSecret = (name: string) => SECRET.some((r) => r.test(name));
const isText = (name: string) => {
  const e = extname(name).toLowerCase();
  return TEXT_EXT.has(e) || ["Dockerfile", "Makefile", "LICENSE", "README", "AGENTS", "CLAUDE"].includes(name) || (!e && !name.startsWith("."));
};

// ---------- 활동 기록 ----------
type Activity = { t: number; path: string; kind: "created" | "modified" | "deleted"; project: string | null; dir: boolean };
const activity: Activity[] = [];
// 기록은 파일에 남겨 서버를 다시 켜도 유지한다 (최근 KEEP_DAYS일)
const KEEP_DAYS = 30;
const STATE_DIR = process.env.STATE_DIR ?? `${process.env.HOME}/.local/state/work-viewer`;
const LOG_FILE = `${STATE_DIR}/activity.jsonl`;
const { mkdirSync, readFileSync, appendFileSync, writeFileSync } = await import("node:fs");
mkdirSync(STATE_DIR, { recursive: true });
try {
  const cut = Date.now() - KEEP_DAYS * 86400000;
  const rows = readFileSync(LOG_FILE, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter((a) => a && a.t >= cut && !NOISE.some((r) => r.test(a.path))); // 규칙이 늘면 지난 기록에서도 뺀다
  activity.push(...rows.reverse());
  writeFileSync(LOG_FILE, rows.slice().reverse().map((a) => JSON.stringify(a)).join("\n") + (rows.length ? "\n" : ""));
} catch {}
const lastSeen = new Map<string, number>();
const projectTouched = new Map<string, number>();
for (const a of activity) if (a.project && !projectTouched.has(a.project)) projectTouched.set(a.project, a.t);
const clients = new Set<ReadableStreamDefaultController>();
const enc = new TextEncoder();

function broadcast(event: string, data: unknown) {
  const msg = enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  for (const c of clients) { try { c.enqueue(msg); } catch { clients.delete(c); } }
}
function projectOf(rel: string): string | null {
  const m = rel.match(/^Projects\/([^/]+)/);
  return m ? m[1] : null;
}

watch(ROOT, { recursive: true }, (_ev, file) => {
  if (!file) return;
  const rel = String(file).split(sep).join("/");
  const tm = rel.match(TMP_WRITE);
  if (tm) { recentTmp.set(tm[1], Date.now()); return; }
  if (NOISE.some((r) => r.test(rel))) return;
  const now = Date.now();
  const prev = lastSeen.get(rel) ?? 0;
  lastSeen.set(rel, now);
  if (now - prev < 800) return; // 같은 파일 연속 이벤트 합치기
  let kind: Activity["kind"] = "modified";
  let dir = false;
  try {
    const s = statSync(join(ROOT, rel));
    dir = s.isDirectory();
    if (s.birthtimeMs > 0 && now - s.birthtimeMs < 2000 && now - (recentTmp.get(rel) ?? 0) > 3000) kind = "created";
  } catch { kind = "deleted"; }
  if (dir && kind === "modified") return; // 폴더 mtime 변화는 하위 파일 이벤트로 충분
  const a: Activity = { t: now, path: rel, kind, project: projectOf(rel), dir };
  activity.unshift(a);
  if (activity.length > 50_000) activity.length = 50_000;
  try { appendFileSync(LOG_FILE, JSON.stringify(a) + "\n"); } catch {}
  if (a.project) { projectTouched.set(a.project, now); gitCache.delete(a.project); }
  broadcast("activity", a);
});
setInterval(() => { const cut = Date.now() - 10_000; for (const [k, v] of lastSeen) if (v < cut) lastSeen.delete(k); for (const [k, v] of recentTmp) if (v < cut) recentTmp.delete(k); }, 30_000);

// ---------- git ----------
type GitInfo = { branch: string; dirty: number; ahead: number; behind: number; last?: { subject: string; date: string }; worktrees: number };
const gitCache = new Map<string, { at: number; info: GitInfo | null }>();
async function sh(cmd: string[], cwd: string): Promise<string> {
  const p = Bun.spawn(cmd, { cwd, stdout: "pipe", stderr: "ignore", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });
  const out = await new Response(p.stdout).text();
  await p.exited;
  return out;
}
async function gitInfo(name: string, dir: string): Promise<GitInfo | null> {
  const c = gitCache.get(name);
  if (c && Date.now() - c.at < 15_000) return c.info;
  let info: GitInfo | null = null;
  if (existsSync(join(dir, ".git"))) {
    const [st, log, wt] = await Promise.all([
      sh(["git", "status", "--porcelain=v2", "--branch"], dir),
      sh(["git", "log", "-1", "--format=%s%x00%cI"], dir),
      sh(["git", "worktree", "list", "--porcelain"], dir),
    ]);
    const branch = st.match(/^# branch\.head (.+)$/m)?.[1] ?? "?";
    const ab = st.match(/^# branch\.ab \+(\d+) -(\d+)$/m);
    const dirty = st.split("\n").filter((l) => /^[12u?] /.test(l)).length;
    const [subject, date] = log.trim().split("\0");
    info = { branch, dirty, ahead: Number(ab?.[1] ?? 0), behind: Number(ab?.[2] ?? 0),
      last: subject ? { subject, date } : undefined, worktrees: Math.max(0, (wt.match(/^worktree /gm)?.length ?? 1) - 1) };
  }
  gitCache.set(name, { at: Date.now(), info });
  return info;
}

// ---------- 프로젝트 ----------
const DATED = /^(\d{4}-\d{2}-\d{2})(?:[_-](.+))?$/;
async function newestMtime(dir: string, depth = 2): Promise<number> {
  let best = 0;
  let ents: import("node:fs").Dirent[] = [];
  try { ents = await readdir(dir, { withFileTypes: true }); } catch { return 0; }
  for (const e of ents) {
    if (HIDDEN.has(e.name) || e.name === "backups") continue;
    const p = join(dir, e.name);
    try {
      const s = await stat(p);
      best = Math.max(best, s.mtimeMs);
      if (e.isDirectory() && depth > 0) best = Math.max(best, await newestMtime(p, depth - 1));
    } catch {}
  }
  return best;
}
async function readTitle(dir: string): Promise<string | null> {
  for (const f of ["README.md", "readme.md"]) {
    try {
      const txt = await Bun.file(join(dir, f)).text();
      const h = txt.match(/^#\s+(.+)$/m)?.[1];
      const para = txt.replace(/^---[\s\S]*?---/, "").split("\n").map((l) => l.trim())
        .find((l) => l && !l.startsWith("#") && !l.startsWith(">") && !l.startsWith("|") && !l.startsWith("```") && !l.startsWith("-"));
      return JSON.stringify({ h, para: para?.replace(/\*\*/g, "").slice(0, 160) });
    } catch {}
  }
  return null;
}
async function listProjects() {
  const base = join(ROOT, "Projects");
  const ents = (await readdir(base, { withFileTypes: true }).catch(() => [])).filter((e) => e.isDirectory() && !e.name.startsWith("."));
  return Promise.all(ents.map(async (e) => {
    const dir = join(base, e.name);
    const kids = (await readdir(dir, { withFileTypes: true })).filter((k) => !HIDDEN.has(k.name));
    const git = await gitInfo(e.name, dir);
    const items = kids.filter((k) => k.isDirectory() && DATED.test(k.name)).map((k) => k.name).sort().reverse();
    let backups: string[] = [];
    if (kids.some((k) => k.name === "backups" && k.isDirectory())) {
      backups = (await readdir(join(dir, "backups"))).filter((n) => DATED.test(n)).sort().reverse();
    }
    const kind = git ? "git" : e.name.startsWith("_") ? "common" : items.length || backups.length || /\./.test(e.name) ? "site" : "folder";
    const t = await readTitle(dir);
    const title = t ? JSON.parse(t) : null;
    const mtime = Math.max(await newestMtime(dir, git ? 1 : 2), projectTouched.get(e.name) ?? 0) || (await stat(dir)).mtimeMs;
    return { name: e.name, kind, git, items: items.slice(0, 6), itemCount: items.length, lastBackup: backups[0] ?? null,
      backupCount: backups.length, title: title?.h ?? null, blurb: title?.para ?? null, mtime, touched: projectTouched.get(e.name) ?? null,
      entries: kids.length };
  }));
}

// ---------- 디렉터리·파일 ----------
async function listDir(abs: string) {
  const ents = await readdir(abs, { withFileTypes: true });
  const out = await Promise.all(ents.filter((e) => !HIDDEN.has(e.name)).map(async (e) => {
    const p = join(abs, e.name);
    try {
      const s = await stat(p);
      let count: number | null = null;
      if (s.isDirectory()) { try { count = (await readdir(p)).filter((n) => !HIDDEN.has(n)).length; } catch {} }
      return { name: e.name, dir: s.isDirectory(), size: s.size, mtime: s.mtimeMs, count, secret: isSecret(e.name) };
    } catch { return null; }
  }));
  return out.filter(Boolean);
}

// ---------- 문서 색인 ----------
async function parseIndex(file: string, prefix: string) {
  try {
    const txt = await Bun.file(file).text();
    const block = txt.match(/```ya?ml\n([\s\S]*?)```/)?.[1];
    if (!block) return [];
    const y: any = Bun.YAML.parse(block);
    const arr = y?.docs ?? y?.documents ?? [];
    return arr.map((d: any) => ({ ...d, path: prefix + d.path, scope: prefix ? prefix.split("/")[1] : "Work" }));
  } catch { return []; }
}
async function docsIndex() {
  const all = await parseIndex(join(ROOT, "INDEX.md"), "");
  for (const e of await readdir(join(ROOT, "Projects"), { withFileTypes: true }).catch(() => [])) {
    if (e.isDirectory()) all.push(...await parseIndex(join(ROOT, "Projects", e.name, "INDEX.md"), `Projects/${e.name}/`));
  }
  return all;
}

// ---------- 검색 ----------
async function search(q: string) {
  const needle = q.toLowerCase();
  const hits: { path: string; dir: boolean; mtime: number }[] = [];
  let visited = 0;
  async function walk(abs: string, depth: number) {
    if (hits.length >= 120 || visited > 40_000 || depth > 12) return;
    let ents: import("node:fs").Dirent[] = [];
    try { ents = await readdir(abs, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      visited++;
      if (HIDDEN.has(e.name) || e.name === "backups" || e.name === "Obsidian" || e.name === "notion-original") continue;
      const p = join(abs, e.name);
      if (e.name.toLowerCase().includes(needle)) {
        try { hits.push({ path: relOf(p), dir: e.isDirectory(), mtime: (await stat(p)).mtimeMs }); } catch {}
      }
      if (e.isDirectory() && !e.isSymbolicLink()) await walk(p, depth + 1);
    }
  }
  await walk(join(ROOT, "Projects"), 0);
  await walk(join(ROOT, "docs"), 0);
  return hits.sort((a, b) => b.mtime - a.mtime);
}

// ---------- 에이전트 (herdr) ----------
let agents: any[] = [];
let agentsJson = "";
async function pollAgents() {
  try {
    const out = await sh(["herdr", "agent", "list"], ROOT);
    const list = JSON.parse(out)?.result?.agents ?? [];
    const slim = await Promise.all(list.map(async (a: any) => {
      const cwd = a.foreground_cwd ?? a.cwd ?? "";
      const rel = cwd.startsWith(ROOT) ? relOf(cwd) : cwd;
      const summary = await agentSummary(a.pane_id, a.agent, sh, ROOT).catch(() => null);
      return { id: a.pane_id, agent: a.agent, status: a.agent_status, title: a.terminal_title_stripped || a.name,
        cwd: rel, project: projectOf(rel), workspace: a.workspace_id, focused: a.focused, summary };
    }));
    const j = JSON.stringify(slim);
    if (j !== agentsJson) { agentsJson = j; agents = slim; broadcast("agents", agents); }
  } catch { if (agentsJson !== "[]") { agentsJson = "[]"; agents = []; broadcast("agents", agents); } }
}
pollAgents();
setInterval(pollAgents, 3000);

// ---------- HTTP ----------
const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

Bun.serve({
  port: PORT, hostname: HOST, idleTimeout: 0,
  async fetch(req) {
    const url = new URL(req.url);
    const p = url.pathname;
    try {
      if (p === "/api/events") {
        let ctl: ReadableStreamDefaultController;
        let hb: ReturnType<typeof setInterval>;
        const stream = new ReadableStream({
          start(c) {
            ctl = c; clients.add(c);
            c.enqueue(enc.encode(`retry: 2000\nevent: agents\ndata: ${JSON.stringify(agents)}\n\n`));
            hb = setInterval(() => { try { c.enqueue(enc.encode(": hb\n\n")); } catch { clearInterval(hb); } }, 20_000);
          },
          cancel() { clients.delete(ctl); clearInterval(hb); },
        });
        return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" } });
      }
      if (p === "/api/projects") return json(await listProjects());
      if (p === "/api/activity") {
        const since = Number(url.searchParams.get("since") ?? 0);
        const limit = Number(url.searchParams.get("limit") ?? 5000);
        const out = [];
        for (const a of activity) { if (a.t < since || out.length >= limit) break; out.push(a); }
        return json(out);
      }
      if (p === "/api/agents") return json(agents);
      if (p === "/api/docs") return json(await docsIndex());
      if (p === "/api/index") {
        const abs = await safe(url.searchParams.get("path") ?? "");
        if (!abs || basename(abs) !== "INDEX.md") return json({ error: "not found" }, 404);
        const dir = relOf(abs).split("/").slice(0, -1).join("/");
        return json(await parseIndex(abs, dir ? dir + "/" : ""));
      }
      if (p === "/api/search") return json(await search(url.searchParams.get("q") ?? ""));
      if (p === "/api/ls") {
        const abs = await safe(url.searchParams.get("path") ?? "");
        if (!abs) return json({ error: "not found" }, 404);
        return json({ path: relOf(abs), entries: await listDir(abs) });
      }
      if (p === "/api/stat") {
        const abs = await safe(url.searchParams.get("path") ?? "");
        if (!abs) return json({ error: "not found" }, 404);
        const s = await stat(abs);
        const name = basename(abs);
        return json({ path: relOf(abs), dir: s.isDirectory(), size: s.size, mtime: s.mtimeMs, secret: isSecret(name),
          text: !s.isDirectory() && isText(name) && s.size < 3_000_000, mime: MIME[extname(name).toLowerCase()] ?? null });
      }
      if (p === "/raw") {
        const abs = await safe(url.searchParams.get("path") ?? "");
        if (!abs || isSecret(basename(abs))) return new Response("not found", { status: 404 });
        const f = Bun.file(abs);
        const type = MIME[extname(abs).toLowerCase()] ?? (isText(basename(abs)) ? "text/plain; charset=utf-8" : "application/octet-stream");
        const headers: Record<string, string> = { "content-type": type, "cache-control": "no-cache",
          "x-content-type-options": "nosniff", "content-security-policy": "sandbox" };
        if (url.searchParams.has("download")) headers["content-disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(basename(abs))}`;
        return new Response(f, { headers });
      }
      // 정적 파일
      const file = p === "/" ? "index.html" : p.slice(1);
      if (!file.includes("..")) {
        const f = Bun.file(join(PUBLIC, file));
        if (await f.exists()) return new Response(f, { headers: { "cache-control": "no-cache" } });
      }
      return new Response("not found", { status: 404 });
    } catch (err: any) {
      return json({ error: String(err?.message ?? err) }, 500);
    }
  },
});
console.log(`work-viewer: http://${HOST}:${PORT}  root=${ROOT}`);
