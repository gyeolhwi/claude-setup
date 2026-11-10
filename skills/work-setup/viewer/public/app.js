// Work Viewer 클라이언트
const $ = (s, el = document) => el.querySelector(s);
const main = $("#main");
const state = { projects: [], agents: [], activity: [], docs: null, route: null, unseen: 0, docScope: "전체" };

// ---------- 유틸 ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const enc = (p) => p.split("/").map(encodeURIComponent).join("/");
const api = (p) => fetch(p, { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)));
function ago(t) {
  if (!t) return "";
  const s = (Date.now() - t) / 1000;
  if (s < 45) return "방금";
  if (s < 3600) return `${Math.round(s / 60)}분 전`;
  if (s < 86400) return `${Math.round(s / 3600)}시간 전`;
  const d = new Date(t), now = new Date();
  const days = Math.floor((new Date(now.toDateString()) - new Date(d.toDateString())) / 86400000);
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  return d.getFullYear() === now.getFullYear() ? `${d.getMonth() + 1}월 ${d.getDate()}일` : `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}
function clock(t) {
  const d = new Date(t);
  if (d.toDateString() !== new Date().toDateString()) return ago(t);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
const hm = (t) => { const d = new Date(t); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const fullTime = (t) => new Date(t).toLocaleString("ko-KR", { dateStyle: "long", timeStyle: "short" });
function size(n) {
  if (n == null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  if (n < 1073741824) return `${(n / 1048576).toFixed(1)} MB`;
  return `${(n / 1073741824).toFixed(1)} GB`;
}
const extOf = (n) => (n.includes(".") ? n.split(".").pop().toLowerCase() : "");
const IMG = ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp", "ico"];
const VID = ["mp4", "webm", "mov"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}/;
// onTap이 있으면 누를 수 있는 알림 (조금 더 오래 보인다)
function toast(msg, onTap) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.toggle("link", !!onTap);
  t.onclick = onTap ? () => { onTap(); t.classList.remove("on"); } : null;
  t.classList.add("on");
  clearTimeout(toast.h);
  toast.h = setTimeout(() => t.classList.remove("on"), onTap ? 6000 : 3200);
}

const I = {
  folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg>',
  file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/></svg>',
  doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/></svg>',
  img: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/></svg>',
  code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  dl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
};
function fileKind(name, dir) {
  if (dir) return ["is-dir", I.folder];
  const e = extOf(name);
  if (e === "md") return ["is-md", I.doc];
  if (IMG.includes(e)) return ["", I.img];
  if (["ts", "js", "py", "sh", "php", "css", "html", "json", "yaml", "yml", "toml", "sql"].includes(e)) return ["", I.code];
  return ["", I.file];
}
const KIND_LABEL = { git: "개발", site: "사이트", common: "공통", folder: "폴더" };
const VERB = { created: "추가", modified: "수정", deleted: "삭제" };

// ---------- 데이터 ----------
async function loadProjects() {
  state.projects = await api("/api/projects");
  state.projects.sort((a, b) => (b.touched || b.mtime) - (a.touched || a.mtime));
  renderSide();
}
let projTimer;
function refreshProjectsSoon() {
  clearTimeout(projTimer);
  projTimer = setTimeout(async () => {
    await loadProjects();
    if (state.route?.name === "projects") render(true);
  }, 1500);
}

// ---------- 다시 맞추기 (연결이 끊겼다 붙거나 화면에 돌아왔을 때) ----------
async function loadActivity() {
  state.activity = await api(`/api/activity?since=${Date.now() - 30 * 86400000}`);
  $("#feedList").innerHTML = state.activity.slice(0, 80).map((a) => entry(a)).join("");
}
async function resync() {
  state.docs = null;
  await Promise.all([loadActivity().catch(() => {}), loadProjects().catch(() => {})]);
  if (["home", "projects", "activity", "docs"].includes(state.route?.name)) render(true);
}

// ---------- 실시간 ----------
function connect() {
  const es = new EventSource("/api/events");
  const live = $("#live");
  let dropped = false;
  es.onopen = () => {
    live.classList.add("on"); live.lastChild.textContent = "실시간";
    if (dropped) { dropped = false; resync(); }
  };
  es.onerror = () => { dropped = true; live.classList.remove("on"); live.lastChild.textContent = "다시 연결하는 중"; };
  es.addEventListener("agents", (e) => {
    const prev = new Map(state.agents.map((a) => [a.id, a.status]));
    const first = !state.agentsSeen;
    state.agentsSeen = true;
    state.agents = JSON.parse(e.data);
    for (const a of first ? [] : state.agents) {
      const was = prev.get(a.id);
      if (a.status === "blocked" && was !== "blocked") toast(`${agentName(a)}이(가) 확인을 기다립니다: ${a.title || ""}`, () => showAgent(a.id));
      else if (was === "working" && (a.status === "idle" || a.status === "done")) toast(`${agentName(a)} 작업을 마쳤습니다: ${a.title || ""}`, () => showAgent(a.id));
    }
    renderSide();
    if (state.route?.name === "home") { renderGroups(); $("#homeLine").textContent = homeLine(); }
  });
  es.addEventListener("activity", (e) => {
    const a = JSON.parse(e.data);
    state.activity.unshift(a);
    if (state.activity.length > 600) state.activity.length = 600;
    onActivity(a);
  });
}

let viewTimer, homeTimer;
function onActivity(a) {
  const fl = $("#feedList");
  if (fl) { fl.insertAdjacentHTML("afterbegin", entry(a, true)); while (fl.children.length > 80) fl.lastChild.remove(); }
  if (state.route?.name !== "activity") {
    state.unseen++;
    $("#actCount").textContent = state.unseen > 99 ? "99+" : state.unseen;
    $("#tabDot").classList.add("on");
  } else {
    const list = $("#actList");
    if (list && (!state.route.project || a.project === state.route.project)) list.insertAdjacentHTML("afterbegin", entry(a, true, true));
  }
  if (state.route?.name === "home") {
    clearTimeout(homeTimer);
    homeTimer = setTimeout(() => { renderGroups(); const el = $("#days"); if (el) el.innerHTML = daysHtml(true, true); }, 700);
  }
  if (a.project) {
    const p = state.projects.find((x) => x.name === a.project);
    if (p) { p.touched = a.t; p.mtime = Math.max(p.mtime, a.t); }
    renderSide();
    document.querySelectorAll(`.prow[data-proj="${CSS.escape(a.project)}"]`).forEach((el) => {
      el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
      const w = el.querySelector(".when");
      if (w) { w.textContent = "방금"; w.classList.add("now"); }
    });
    if (a.dir || a.kind !== "modified") refreshProjectsSoon();
  }
  const r = state.route;
  if (!r) return;
  const parent = a.path.split("/").slice(0, -1).join("/");
  if (r.name === "file" && r.path === a.path) {
    clearTimeout(viewTimer);
    viewTimer = setTimeout(() => render(true, a.path), 400);
  } else if ((r.name === "file" && r.isDir && (parent === r.path || a.path === r.path)) ||
             (r.name === "project" && a.path.startsWith(`Projects/${r.project}/`) && parent.split("/").length <= 4)) {
    clearTimeout(viewTimer);
    viewTimer = setTimeout(() => render(true, a.path), 600);
  }
}

// ---------- 사이드바 ----------
const STATUS = { working: "작업 중", idle: "대기", blocked: "확인 필요", done: "완료", error: "오류" };
const statusText = (st) => STATUS[st] ?? st;
// ---------- 에이전트 카드 펼치기 ----------
// 카드는 Claude 대화 기록 요약(내 지시 · 지금 하는 일 · 결과/질문)을 보여 주고, 누르면 줄였던 글을 다 펼친다
state.openAgent = null;
function rerenderBands() {
  if (state.route?.name === "home") return renderGroups();
  const el = $("#projBand");
  if (el) renderBand(el, state.agents.filter((a) => a.project === state.route?.project));
}
function showAgent(id) {
  state.openAgent = id;
  if (state.route?.name !== "home") location.hash = "#/";
  else rerenderBands();
  setTimeout(() => document.querySelector(`.agent[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 50);
}
function toggleAgent(id) {
  state.openAgent = state.openAgent === id ? null : id;
  rerenderBands();
}
// "n분 전" 같은 시간 표시가 멈춰 보이지 않게 30초마다 다시 그린다
setInterval(() => { if (document.visibilityState === "visible") rerenderBands(); }, 30_000);
function span(ms) {
  const m = Math.floor(ms / 60000);
  return m < 1 ? "1분 미만" : m < 60 ? `${m}분` : `${Math.floor(m / 60)}시간 ${m % 60}분`;
}
// 접힌 카드의 한 줄: 질문 > 승인 대기 > 지금 하는 일 > 결과 첫 줄
function agentLine(a) {
  const s = a.summary;
  if (!s) return "";
  const line = (k, v, cls = "") => `<div class="ag-line ${cls}"><span class="ag-k">${k}</span><span class="ag-v">${esc(v)}</span></div>`;
  if (s.question?.length) return line("질문", s.question[0].question, "ask");
  if (a.status === "blocked" && s.pending) return line("승인 대기", s.pending, "ask");
  if (a.status === "working") return line("지금", (s.doing || "생각하는 중") + (s.todos ? `, 할 일 ${s.todos.done}/${s.todos.total}` : ""));
  if (s.result) return line("결과", plain(s.result));
  if (s.prompt) return line("내 지시", s.prompt);
  return "";
}
// Markdown 결과에서 첫 문장 정도를 맨글로
function plain(md) {
  const first = md.split(/\n\s*\n/).map((p) => p.trim()).find((p) => p && !/^(#|\||```|---)/.test(p)) ?? md;
  return first.replace(/[*_`>#]/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
}
function agentBody(a) {
  const s = a.summary;
  if (!s) return a.agent === "claude" ? "" : '<div class="ag-note">이 에이전트는 대화 기록 요약을 아직 지원하지 않습니다.</div>';
  const html = [];
  if (s.prompt) html.push(`<div class="ag-row ag-prompt"><span class="ag-k">내 지시</span><div class="ag-v pre">${esc(s.prompt)}</div></div>`);
  if (a.status === "working") {
    const todo = s.todos ? `, 할 일 ${s.todos.done}/${s.todos.total}${s.todos.current ? ` (${esc(s.todos.current)})` : ""}` : "";
    html.push(`<div class="ag-row ag-now"><span class="ag-k">지금</span><div class="ag-v">${esc(s.doing || "생각하는 중")}${todo}<span class="ag-t">&ensp;${ago(s.lastAt)}</span></div></div>`);
  }
  if (s.question?.length) {
    html.push(`<div class="ag-ask">${s.question.map((q) => `<div class="ag-q">${esc(q.question)}</div>${q.options.length ? `<div class="ag-opts">${q.options.map((o) => `<span>${esc(o)}</span>`).join("")}</div>` : ""}`).join("")}<div class="ag-hint">답은 에이전트 창에서 해 주세요</div></div>`);
  } else if (a.status === "blocked" && s.pending) {
    html.push(`<div class="ag-ask"><div class="ag-q">실행 승인을 기다립니다: ${esc(s.pending)}</div><div class="ag-hint">에이전트 창에서 허용하거나 거절해 주세요</div></div>`);
  }
  if (s.result) {
    const label = a.status === "working" ? "최근 메시지" : "결과";
    html.push(`<div class="ag-row ag-result"><span class="ag-k">${label}</span><div class="ag-v md">${DOMPurify.sanitize(marked.parse(s.result, { gfm: true }))}</div></div>`);
  }
  return html.join("");
}
const agentName = (a) => (a.agent === "claude" ? "Claude" : a.agent === "codex" ? "Codex" : a.agent);
function renderSide() {
  const r = state.route;
  const now = Date.now();
  const groups = [["git", "개발"], ["site", "사이트"], ["common", "공통"], ["folder", "기타"]];
  const projHtml = groups.map(([k, label]) => {
    const list = state.projects.filter((p) => p.kind === k).sort((a, b) => a.name.localeCompare(b.name));
    if (!list.length) return "";
    return `<section class="side-group"><h3>${label}</h3><div class="side-list">${list.map((p) => {
      const busy = (p.touched && now - p.touched < 5 * 60_000) || state.agents.some((a) => a.project === p.name && a.status === "working");
      const on = r && (r.project === p.name || (r.path ?? "").startsWith(`Projects/${p.name}`));
      return `<a href="#/p/${enc(p.name)}" class="${on ? "on" : ""}"><span class="n">${esc(p.name)}</span>${busy ? '<span class="busy" title="방금 바뀜"></span>' : ""}</a>`;
    }).join("")}</div></section>`;
  }).join("");
  const agentHtml = `<section class="side-group"><h3>에이전트</h3><div class="side-list">${state.agents.length
    ? state.agents.map((a) => `<a href="#/" data-agent="${esc(a.id)}" title="${esc(a.title)}"><span class="n">${esc(a.title || agentName(a))}</span>${a.status === "working" ? '<span class="busy"></span>' : a.status === "blocked" ? '<span class="busy warn"></span>' : ""}</a>`).join("")
    : '<div class="side-empty">실행 중인 에이전트가 없습니다</div>'}</div></section>`;
  $("#sideGroups").innerHTML = agentHtml + projHtml;
  $("#sideGroups").onclick = (e) => { const l = e.target.closest("[data-agent]"); if (l) { e.preventDefault(); showAgent(l.dataset.agent); } };
}

// ---------- 라우팅 ----------
function parseRoute() {
  const h = decodeURIComponent(location.hash.replace(/^#/, "") || "/");
  if (h === "/" || h === "") return { name: "home" };
  if (h === "/projects") return { name: "projects" };
  if (h.startsWith("/activity")) return { name: "activity", project: new URLSearchParams(h.split("?")[1] || "").get("p") };
  if (h === "/docs") return { name: "docs" };
  if (h.startsWith("/search")) return { name: "search", q: new URLSearchParams(h.split("?")[1] || "").get("q") || "" };
  if (h.startsWith("/p/")) return { name: "project", project: h.slice(3).replace(/\/$/, "") };
  if (h.startsWith("/f")) return { name: "file", path: h.replace(/^\/f\/?/, "").replace(/\/$/, "") };
  return { name: "home" };
}
function setNav(name) {
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const n = a.dataset.nav;
    a.classList.toggle("on", n === name || ((name === "file" || name === "project") && n === "files"));
  });
}
async function render(soft = false, changed = null) {
  const r = parseRoute();
  const same = state.route && state.route.key === JSON.stringify(r);
  r.key = JSON.stringify(r);
  state.route = r;
  setNav(r.name);
  renderSide();
  const scroll = main.scrollTop;
  if (!soft) main.innerHTML = '<div class="skeleton"></div>';
  try {
    if (r.name === "home") await viewHome();
    else if (r.name === "projects") await viewProjects();
    else if (r.name === "activity") viewActivity(r.project);
    else if (r.name === "docs") await viewDocs();
    else if (r.name === "search") await viewSearch(r.q);
    else if (r.name === "project") await viewProject(r.project, changed);
    else if (r.name === "file") await viewPath(r.path, changed);
  } catch (e) {
    main.innerHTML = `<div class="head"><h1>열 수 없습니다</h1><p>이 경로를 불러오지 못했습니다 (${esc(e)}). 파일이 옮겨졌거나 지워졌을 수 있습니다.</p></div><a class="chip" href="#/">홈으로 가기</a>`;
  }
  if (soft && same) main.scrollTop = scroll; else if (!soft) main.scrollTop = 0;
}

// ---------- 공통 조각 ----------
function part(title, note = "", more = "") {
  return `<header><h2>${title}</h2>${note ? `<p>${note}</p>` : ""}${more}</header>`;
}
const STATUS_ORDER = { blocked: 0, working: 1, done: 2, idle: 2 };
const byStatus = (a, b) => (STATUS_ORDER[a.status] ?? 2) - (STATUS_ORDER[b.status] ?? 2);
// 에이전트 카드 한 장. inGroup이면 프로젝트 묶음 안이라 프로젝트 이름을 빼고 그린다
function agentCard(a, inGroup = false) {
  const st = statusText(a.status);
  const open = state.openAgent === a.id;
  const s = a.summary;
  const proj = inGroup ? "" : a.project ? `<a href="#/p/${enc(a.project)}">${esc(a.project)}</a>&emsp;` : "";
  // 오른쪽: 작업 중이면 경과 시간, 아니면 상태 이름과 마지막 활동 (점 색만으로는 뜻이 안 보이니 글로도)
  const time = a.status === "working"
    ? (s?.promptAt ? (Date.now() - s.promptAt < 60_000 ? "방금 시작" : `${span(Date.now() - s.promptAt)}째`) : "작업 중")
    : !s?.lastAt ? st : ago(s.lastAt) === "방금" ? `방금 ${st}` : `${st} ${ago(s.lastAt)}`;
  return `<div class="agent ${esc(a.status)}${open ? " open" : ""}" data-id="${esc(a.id)}">
    <div class="ag-head"><span class="state">${esc(st)}</span>
      <button type="button" class="what" aria-expanded="${open}">${esc(a.title || "제목 없는 작업")}</button>
      <span class="ag-side">${proj}${esc(time)}</span></div>
    ${open ? `<div class="ag-body">${agentBody(a)}</div><div class="where">${esc(agentName(a))} 창 ${esc(a.id)}</div>` : agentLine(a)}
  </div>`;
}
// 카드를 누르면 펼치고 접는다 (안쪽 링크·글 선택 중일 때는 제외)
function onAgentClick(e) {
  const card = e.target.closest(".agent");
  if (!card || e.target.closest("a") || String(getSelection()).length) return;
  toggleAgent(card.dataset.id);
}
function renderBand(el, agents) {
  if (!el) return;
  if (!agents.length) { el.innerHTML = '<p class="empty">herdr에서 실행 중인 에이전트가 없습니다. herdr로 에이전트를 띄우면 여기에 나타납니다.</p>'; return; }
  el.innerHTML = agents.slice().sort(byStatus).map((a) => agentCard(a)).join("");
  el.onclick = onAgentClick;
}
function projDetail(p) {
  if (p.git) {
    const bits = [`${esc(p.git.branch)} 브랜치`];
    bits.push(p.git.dirty ? `<span class="warn">커밋 안 한 변경 ${p.git.dirty}개</span>` : "변경 없음");
    if (p.git.ahead) bits.push(`<span class="warn">푸시 안 한 커밋 ${p.git.ahead}개</span>`);
    if (p.git.worktrees) bits.push(`워크트리 ${p.git.worktrees}개`);
    return bits.join(", ");
  }
  const bits = [];
  if (p.items[0]) bits.push(`최근 작업 ${esc(p.items[0].replace(/^(\d{4}-\d{2}-\d{2})[_-]?/, "$1 "))}`);
  if (p.itemCount > 1) bits.push(`전체 ${p.itemCount}건`);
  if (p.lastBackup) bits.push(`백업 ${esc(p.lastBackup)}`);
  if (!bits.length) bits.push(`항목 ${p.entries}개`);
  return bits.join(", ");
}
function projRow(p) {
  const t = p.touched || p.mtime;
  const now = p.touched && Date.now() - p.touched < 5 * 60_000;
  const sub = p.title && p.title.toLowerCase() !== p.name.toLowerCase() ? p.title : KIND_LABEL[p.kind];
  return `<a class="prow ${esc(p.kind)}" href="#/p/${enc(p.name)}" data-proj="${esc(p.name)}">
    <span class="bar"></span>
    <span><div class="name">${esc(p.name)}<small>${esc(sub)}</small></div><div class="detail">${projDetail(p)}</div></span>
    <span class="when ${now ? "now" : ""}" title="${fullTime(t)}">${ago(t)}</span></a>`;
}
function entry(a, fresh = false, withVerb = false) {
  const parts = a.path.split("/");
  const name = parts.pop() + (a.dir ? "/" : "");
  const href = a.kind === "deleted" ? `#/f/${enc(parts.join("/"))}` : `#/f/${enc(a.path)}`;
  return `<a class="entry ${a.kind} ${fresh ? "new" : ""}" href="${href}" title="${esc(a.path)}, ${fullTime(a.t)}">
    <time data-t="${a.t}">${clock(a.t)}</time><span class="file">${esc(name)}</span>
    ${withVerb ? `<span class="verb ${a.kind}">${VERB[a.kind]}</span>` : ""}
    <span class="dir">${esc(parts.join("/") || "~/Work")}</span></a>`;
}
function crumbs(path) {
  const parts = path ? path.split("/") : [];
  let acc = "";
  return `<nav class="crumbs" aria-label="경로"><a href="#/f/">Work</a>${parts.map((p, i) => {
    acc += (i ? "/" : "") + p;
    const href = i === 1 && parts[0] === "Projects" ? `#/p/${enc(p)}` : `#/f/${enc(acc)}`;
    return `<span>/</span><a href="${href}">${esc(p)}</a>`;
  }).join("")}</nav>`;
}
function fileRows(base, entries, changed) {
  const sorted = entries.slice().sort((a, b) => (b.dir - a.dir) ||
    (DATE_RE.test(a.name) && DATE_RE.test(b.name) ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name, "ko")));
  if (!sorted.length) return '<p class="empty">비어 있는 폴더입니다.</p>';
  return sorted.map((e) => {
    const p = base ? `${base}/${e.name}` : e.name;
    const [cls, icon] = e.secret ? ["", I.lock] : fileKind(e.name, e.dir);
    const flash = changed && (changed === p || changed.startsWith(p + "/")) ? "flash" : "";
    return `<a class="frow ${cls} ${flash}" href="#/f/${enc(p)}">${icon}
      <span class="nm">${esc(e.name)}${e.dir && e.count != null ? `<small>${e.count}개</small>` : ""}</span>
      <span class="sz">${e.dir ? "" : size(e.size)}</span><span class="dt" title="${fullTime(e.mtime)}">${ago(e.mtime)}</span></a>`;
  }).join("");
}

// ---------- 홈 ----------
function homeLine() {
  const working = state.agents.filter((a) => a.status === "working").length;
  const blocked = state.agents.filter((a) => a.status === "blocked").length;
  if (blocked) return `에이전트 ${blocked}개가 확인을 기다립니다${working ? `, ${working}개는 작업 중입니다.` : "."}`;
  return working ? `에이전트 ${working}개가 작업 중입니다.` : state.agents.length ? "모든 에이전트가 대기 중입니다." : "실행 중인 에이전트가 없습니다.";
}
// 같은 프로젝트에서 30분 안에 이어진 변경을 한 묶음(세션)으로 본다
const GAP = 30 * 60_000;
function sessions(list) {
  const open = new Map();
  const out = [];
  for (const a of list) { // 최신순
    const key = a.project || "Work";
    let s = open.get(key);
    if (!s || s.start - a.t > GAP || dayKey(s.start) !== dayKey(a.t)) {
      s = { key, project: a.project, end: a.t, start: a.t, files: new Map(), newWork: [] };
      open.set(key, s);
      out.push(s);
    }
    s.start = a.t;
    if (!s.files.has(a.path)) s.files.set(a.path, a);
    const m = a.dir && a.kind === "created" && a.path.match(/^Projects\/[^/]+\/(\d{4}-\d{2}-\d{2}[^/]*)$/);
    if (m && !s.newWork.includes(m[1])) s.newWork.push(m[1]);
  }
  return out;
}
const dayKey = (t) => new Date(t).toDateString();
function dayLabel(t) {
  const d = new Date(t), today = new Date();
  const diff = Math.round((new Date(today.toDateString()) - new Date(d.toDateString())) / 86400000);
  const date = d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" });
  return diff === 0 ? ["오늘", date] : diff === 1 ? ["어제", date] : [date, ""];
}
function sessionHtml(s, fresh) {
  const p = state.projects.find((x) => x.name === s.project);
  const files = [...s.files.values()].filter((a) => !a.dir);
  const count = { created: 0, modified: 0, deleted: 0 };
  files.forEach((a) => count[a.kind]++);
  const said = [count.modified && `${count.modified}개 수정`, count.created && `${count.created}개 추가`, count.deleted && `${count.deleted}개 삭제`].filter(Boolean);
  const range = hm(s.start) === hm(s.end) ? hm(s.end) : `${hm(s.start)}–${hm(s.end)}`;
  const shown = files.slice(0, 4).map((a) => {
    const name = a.path.split("/").pop();
    return a.kind === "deleted" ? `<s>${esc(name)}</s>` : `<a href="#/f/${enc(a.path)}">${esc(name)}</a>`;
  }).join("");
  const more = files.length > 4 ? `<span class="more">외 ${files.length - 4}개</span>` : "";
  const title = s.project ? `<a href="#/p/${enc(s.project)}">${esc(s.project)}</a>` : `<a href="#/f/">Work 안내·설정</a>`;
  const now = Date.now() - s.end < 5 * 60_000;
  return `<article class="sess ${esc(p?.kind || "common")} ${fresh && now ? "flash" : ""}">
    <time>${range}</time><span class="bar"></span>
    <div><h3>${title}</h3>
      ${s.newWork.length ? `<p class="newwork">새 작업 ${s.newWork.map((w) => `<a href="#/f/${enc(`Projects/${s.project}/${w}`)}">${esc(w)}</a>`).join(", ")}</p>` : ""}
      ${said.length ? `<p class="said">파일 ${said.join(", ")}</p>` : ""}
      ${shown ? `<p class="names">${shown}${more}</p>` : ""}</div></article>`;
}
function daysHtml(fresh = false, pastOnly = false) {
  const today = dayKey(Date.now());
  const list = state.activity.filter((a) => Date.now() - a.t < 7 * 86400000 && !(pastOnly && dayKey(a.t) === today));
  if (!list.length) return pastOnly ? "" : '<p class="empty">최근 7일 동안 기록된 변경이 없습니다. 에이전트가 파일을 만들거나 고치면 바로 여기에 나타납니다.</p>';
  const byDay = new Map();
  for (const s of sessions(list)) {
    const k = dayKey(s.end);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(s);
  }
  return [...byDay.values()].map((ss) => {
    const [label, sub] = dayLabel(ss[0].end);
    const projects = new Set(ss.map((x) => x.key)).size;
    return `<section class="day"><header><h2>${label}</h2>${sub ? `<p>${sub}</p>` : ""}<span class="tally">프로젝트 ${projects}곳</span></header>
      ${ss.map((x) => sessionHtml(x, fresh)).join("")}</section>`;
  }).join("");
}
// 프로젝트마다 한 덩어리: 그 프로젝트의 에이전트 + 오늘 바뀐 파일. 확인 필요·작업 중이 있는 묶음이 위로, 나머지는 최근 순
function homeGroups() {
  const today = dayKey(Date.now());
  const groups = new Map();
  const get = (key) => {
    if (!groups.has(key)) groups.set(key, { key, agents: [], files: new Map(), last: 0 });
    return groups.get(key);
  };
  for (const a of state.agents) {
    const g = get(a.project || "");
    g.agents.push(a);
    g.last = Math.max(g.last, a.summary?.lastAt || 0);
  }
  for (const a of state.activity) { // 최신순
    if (a.dir || dayKey(a.t) !== today) continue;
    const g = get(a.project || "");
    if (!g.files.has(a.path)) g.files.set(a.path, a);
    g.last = Math.max(g.last, a.t);
  }
  const rank = (g) => Math.min(2, ...g.agents.map((a) => STATUS_ORDER[a.status] ?? 2));
  return [...groups.values()].sort((x, y) => rank(x) - rank(y) || y.last - x.last);
}
function groupHtml(g) {
  const p = state.projects.find((x) => x.name === g.key);
  const name = g.key ? `<a href="#/p/${enc(g.key)}">${esc(g.key)}</a>` : `<a href="#/f/">Work 공통</a>`;
  const git = p?.git ? [esc(p.git.branch), p.git.dirty ? `<span class="warn">커밋 안 한 변경 ${p.git.dirty}</span>` : "", p.git.ahead ? `<span class="warn">푸시 안 함 ${p.git.ahead}</span>` : ""].filter(Boolean).join(", ") : "";
  const files = [...g.files.values()];
  let filesHtml = "";
  if (files.length) {
    const ts = files.map((a) => a.t);
    const lo = Math.min(...ts), hi = Math.max(...ts);
    const range = hm(lo) === hm(hi) ? hm(hi) : `${hm(lo)}–${hm(hi)}`;
    const names = files.slice(0, 5).map((a) => {
      const n = a.path.split("/").pop();
      return a.kind === "deleted" ? `<s>${esc(n)}</s>` : `<a href="#/f/${enc(a.path)}">${esc(n)}</a>`;
    }).join("");
    const more = files.length > 5 ? (g.key ? `<a class="more" href="#/activity?p=${encodeURIComponent(g.key)}">외 ${files.length - 5}개</a>` : `<span class="more">외 ${files.length - 5}개</span>`) : "";
    filesHtml = `<div class="pg-files"><div class="pg-ft"><span>파일 ${files.length}개</span><span>${range}</span></div><div class="names">${names}${more}</div></div>`;
  }
  return `<section class="pgroup ${esc(p?.kind || "common")}">
    <header><h2>${name}</h2>${git ? `<span class="pg-git">${git}</span>` : ""}</header>
    <div class="pg-cells">${g.agents.slice().sort(byStatus).map((a) => agentCard(a, true)).join("")}${filesHtml}</div></section>`;
}
function renderGroups() {
  const el = $("#groups");
  if (!el) return;
  const gs = homeGroups();
  // 에이전트가 있는 프로젝트만 덩어리로, 파일만 바뀐 프로젝트는 아래에 한 줄씩
  const big = gs.filter((g) => g.agents.length), small = gs.filter((g) => !g.agents.length);
  const rows = small.map((g) => {
    const p = state.projects.find((x) => x.name === g.key);
    const ts = [...g.files.values()].map((a) => a.t);
    const lo = Math.min(...ts), hi = Math.max(...ts);
    const range = hm(lo) === hm(hi) ? hm(hi) : `${hm(lo)}–${hm(hi)}`;
    const href = g.key ? `#/p/${enc(g.key)}` : "#/activity";
    return `<a class="pg-row ${esc(p?.kind || "common")}" href="${href}"><span class="bar"></span><span class="n">${esc(g.key || "Work 공통")}</span>
      <span class="c">파일 ${g.files.size}개</span><span class="ag-t">${range}</span></a>`;
  }).join("");
  el.innerHTML = (big.map(groupHtml).join("") || '<p class="empty">지금 일하는 에이전트가 없습니다. herdr로 에이전트를 띄우면 프로젝트별로 여기에 나타납니다.</p>') +
    (rows ? `<section class="pg-others"><h3>파일만 바뀐 프로젝트</h3><div class="pg-cells">${rows}</div></section>` : "");
  el.onclick = onAgentClick;
}
async function viewHome() {
  if (!state.projects.length) await loadProjects();
  const today = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" });
  const past = daysHtml(false, true);
  main.innerHTML = `
    <div class="head"><h1 id="homeLine">${homeLine()}</h1><p>${today}</p></div>
    <div class="groups" id="groups"></div>
    ${past ? `<h2 class="past-title">지난 기록</h2><div class="days" id="days">${past}</div>` : ""}
    <p class="foot"><a href="#/activity">파일 하나하나 모두 보기</a></p>`;
  renderGroups();
}
async function viewProjects() {
  if (!state.projects.length) await loadProjects();
  main.innerHTML = `<div class="head"><h1>프로젝트</h1><p>프로젝트 ${state.projects.length}개를 최근에 바뀐 순서로 보여 줍니다.</p></div>
    <label class="search bigsearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input id="pq" type="search" placeholder="파일 이름으로 찾기" autocomplete="off" enterkeyhint="search" aria-label="파일 이름으로 찾기"></label>
    <div class="plist">${state.projects.map(projRow).join("")}</div>
    <p class="foot"><a href="#/docs">모든 프로젝트의 문서 보기</a></p>`;
  $("#pq").addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.value.trim()) location.hash = `#/search?q=${encodeURIComponent(e.target.value.trim())}`; });
}

// ---------- 바뀐 파일 ----------
function viewActivity(project) {
  state.unseen = 0;
  $("#actCount").textContent = "";
  $("#tabDot").classList.remove("on");
  const projects = [...new Set(state.activity.map((a) => a.project).filter(Boolean))];
  const list = state.activity.filter((a) => !project || a.project === project);
  main.innerHTML = `
    <div class="head"><h1>바뀐 파일</h1><p>~/Work에서 파일이 추가되거나 수정되거나 지워지면 바로 여기에 쌓입니다. 서버를 다시 켜면 기록이 비워집니다.</p></div>
    ${projects.length ? `<div class="filters"><a class="chip ${!project ? "on" : ""}" href="#/activity">전체</a>
      ${projects.map((p) => `<a class="chip ${project === p ? "on" : ""}" href="#/activity?p=${encodeURIComponent(p)}">${esc(p)}</a>`).join("")}</div>` : ""}
    <div class="log" id="actList">${list.map((a) => entry(a, false, true)).join("")}</div>
    ${list.length ? "" : '<p class="empty">아직 바뀐 파일이 없습니다.</p>'}`;
}

// ---------- 프로젝트 ----------
async function viewProject(name, changed) {
  if (!state.projects.length) await loadProjects();
  const p = state.projects.find((x) => x.name === name);
  const base = `Projects/${name}`;
  const ls = await api(`/api/ls?path=${encodeURIComponent(base)}`);
  const items = ls.entries.filter((e) => e.dir && DATE_RE.test(e.name)).sort((a, b) => b.name.localeCompare(a.name));
  const rest = ls.entries.filter((e) => !(e.dir && DATE_RE.test(e.name)));
  const agents = state.agents.filter((a) => a.project === name);
  const acts = state.activity.filter((a) => a.project === name).slice(0, 8);

  const facts = [];
  if (p?.git) {
    facts.push(`<span><b>${esc(p.git.branch)}</b> 브랜치</span>`);
    facts.push(p.git.dirty ? `<span class="warn">커밋 안 한 변경 <b>${p.git.dirty}개</b></span>` : '<span class="ok"><b>변경 없음</b></span>');
    if (p.git.ahead) facts.push(`<span class="warn">푸시 안 한 커밋 <b>${p.git.ahead}개</b></span>`);
    if (p.git.worktrees) facts.push(`<span>워크트리 <b>${p.git.worktrees}개</b></span>`);
    if (p.git.last) facts.push(`<span>마지막 커밋 <b>${ago(Date.parse(p.git.last.date))}</b></span>`);
  } else {
    if (items.length) facts.push(`<span>작업 <b>${items.length}건</b></span>`);
    if (p?.backupCount) facts.push(`<span>백업 <b>${p.backupCount}개</b>, 마지막 ${esc(p.lastBackup)}</span>`);
  }

  let html = `${crumbs(base)}<div class="head"><h1>${esc(name)}</h1><p>${esc(p?.blurb || (p?.git ? "개발 저장소" : p?.kind === "site" ? "사이트 유지보수" : "프로젝트 폴더"))}</p></div>
    ${facts.length ? `<div class="facts">${facts.join("")}</div>` : ""}`;
  if (agents.length) html += `<section class="part">${part("여기서 일하는 에이전트")}<div class="band" id="projBand"></div></section>`;
  if (items.length) {
    html += `<section class="part">${part("작업", "최신순")}<div class="timeline">${items.map((e) => {
      const m = e.name.match(/^(\d{4}-\d{2}-\d{2})[_-]?(.*)$/);
      return `<a class="tl" href="#/f/${enc(base + "/" + e.name)}"><time>${m[1]}</time><span class="dot"></span>
        <span><div class="t">${esc(m[2] || "주제 없음")}</div><div class="c">파일 ${e.count ?? 0}개, ${ago(e.mtime)} 수정</div></span></a>`;
    }).join("")}</div></section>`;
  }
  if (acts.length) html += `<section class="part">${part("방금 바뀐 파일", "", `<a href="#/activity?p=${encodeURIComponent(name)}">모두 보기</a>`)}<div class="log">${acts.map((a) => entry(a, false, true)).join("")}</div></section>`;
  html += `<section class="part">${part(items.length ? "그 밖의 파일" : "파일")}<div class="files">${fileRows(base, rest, changed)}</div></section>`;
  const rd = ls.entries.find((e) => /^readme\.md$/i.test(e.name));
  if (rd) {
    const txt = await fetch(`/raw?path=${encodeURIComponent(base + "/" + rd.name)}`).then((r) => r.text());
    html += `<section class="part">${part("README")}<div style="padding-top:24px">${renderMarkdown(txt, base + "/" + rd.name, true)}</div></section>`;
  }
  main.innerHTML = html;
  if (agents.length) renderBand($("#projBand"), agents);
}

// ---------- 폴더·파일 ----------
async function viewPath(path, changed) {
  const st = await api(`/api/stat?path=${encodeURIComponent(path)}`);
  state.route.isDir = st.dir;
  if (st.dir) {
    const ls = await api(`/api/ls?path=${encodeURIComponent(path)}`);
    const name = path.split("/").pop() || "Work";
    main.innerHTML = `${crumbs(path)}<div class="head"><h1>${esc(name)}</h1><p>항목 ${ls.entries.length}개</p></div>
      <div class="files">${fileRows(path, ls.entries, changed)}</div>`;
    return;
  }
  const name = path.split("/").pop();
  const e = extOf(name);
  const raw = `/raw?path=${encodeURIComponent(path)}`;
  let body = "", flush = false;
  if (st.secret) body = '<p class="empty">비밀번호나 키가 들어 있을 수 있는 파일이라 내용을 보여 주지 않습니다.</p>';
  else if (IMG.includes(e)) body = `<img class="media" src="${raw}&v=${st.mtime}" alt="${esc(name)}">`;
  else if (VID.includes(e)) body = `<video src="${raw}" controls playsinline></video>`;
  else if (e === "pdf") { body = `<iframe src="${raw}&v=${st.mtime}" title="${esc(name)}"></iframe>`; flush = true; }
  else if (st.text) {
    const txt = await fetch(raw).then((r) => r.text());
    if (name === "INDEX.md" && /```ya?ml/.test(txt)) body = await renderIndex(txt, path);
    else if (e === "md" || e === "markdown") body = renderMarkdown(txt, path);
    else { body = renderCode(txt, e); flush = true; }
  } else body = `<p class="empty">이 형식은 미리 볼 수 없습니다. 내려받아 여세요 (${size(st.size)}).</p>`;
  const recent = Date.now() - st.mtime < 5 * 60_000;
  main.innerHTML = `${crumbs(path)}<article class="sheet">
    <div class="sheet-h"><h1>${esc(name)}</h1>${recent ? '<span class="tag">방금 수정</span>' : ""}
      <span class="info" title="${fullTime(st.mtime)}">${size(st.size)}, ${ago(st.mtime)} 수정</span>
      ${st.secret ? "" : `<span class="acts"><a class="icon-btn" href="${raw}" target="_blank" rel="noopener" aria-label="새 창에서 열기">${I.ext}</a><a class="icon-btn" href="${raw}&download" aria-label="내려받기">${I.dl}</a></span>`}</div>
    <div class="sheet-b ${flush ? "flush" : ""}">${body}</div></article>`;
  if (changed === path) toast("파일이 바뀌어 다시 불러왔습니다");
}

// INDEX.md는 AI용 YAML 목록이라 사람이 읽기 좋게 문서 목록으로 보여 준다
async function renderIndex(txt, path) {
  const docs = await api(`/api/index?path=${encodeURIComponent(path)}`).catch(() => []);
  const intro = txt.split("```")[0].replace(/^#.*$/m, "").replace(/^>\s?/gm, "").trim();
  const rows = docs.map((d) => `<a class="drow" href="#/f/${enc(d.path)}">
    <div class="t">${esc(d.title)}</div><div class="s">${esc(d.summary)}</div><div class="p mono">${esc(d.path)}</div></a>`).join("");
  return `<div class="docinfo"><p class="summary">AI가 질문을 받으면 가장 먼저 읽는 문서 목록입니다. 문서 ${docs.length}개가 등록되어 있고, 제목을 누르면 그 문서가 열립니다.</p>
    ${intro ? `<details><summary>파일에 적힌 안내</summary><p>${esc(intro)}</p></details>` : ""}</div>
    <div class="dlist">${rows || '<p class="empty">등록된 문서가 없습니다.</p>'}</div>
    <details class="rawsrc"><summary>원본 보기 (YAML)</summary>${renderCode(txt, "md")}</details>`;
}

function renderCode(txt, ext) {
  const lang = { ts: "typescript", js: "javascript", mjs: "javascript", py: "python", sh: "bash", yml: "yaml", htm: "xml", html: "xml", svg: "xml", vue: "xml" }[ext] || ext;
  let html = esc(txt);
  if (window.hljs && txt.length < 400_000) {
    try { html = hljs.getLanguage(lang) ? hljs.highlight(txt, { language: lang }).value : hljs.highlightAuto(txt).value; } catch {}
  }
  const n = txt.split("\n").length;
  return `<div class="code-grid"><pre class="gutter">${Array.from({ length: n }, (_, i) => i + 1).join("\n")}</pre><pre class="src hljs"><code>${html}</code></pre></div>`;
}

function renderMarkdown(txt, path, bare = false) {
  let fm = null;
  const m = txt.match(/^---\n([\s\S]*?)\n---\n?/);
  if (m) { fm = parseFrontmatter(m[1]); txt = txt.slice(m[0].length); }
  const tmp = document.createElement("div");
  tmp.innerHTML = DOMPurify.sanitize(marked.parse(txt, { gfm: true }));
  const dir = path.split("/").slice(0, -1);
  const resolveRel = (href) => {
    const out = [...dir];
    for (const seg of decodeURIComponent(href.split("#")[0]).split("/")) {
      if (seg === "..") out.pop(); else if (seg && seg !== ".") out.push(seg);
    }
    return out.join("/");
  };
  tmp.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (/^(https?:|mailto:|tel:)/.test(href)) { a.target = "_blank"; a.rel = "noopener"; return; }
    if (!href.startsWith("#")) a.setAttribute("href", `#/f/${enc(resolveRel(href))}`);
  });
  tmp.querySelectorAll("img[src]").forEach((img) => {
    const src = img.getAttribute("src");
    if (!/^(https?:|data:)/.test(src)) img.src = `/raw?path=${encodeURIComponent(resolveRel(src))}`;
    img.loading = "lazy";
  });
  tmp.querySelectorAll("pre code").forEach((c) => { try { window.hljs && hljs.highlightElement(c); } catch {} });
  let info = "";
  if (fm && Object.keys(fm).length && !bare) {
    const { summary, title, ...rest } = fm;
    const rows = Object.entries(rest).filter(([, v]) => v !== "" && !(Array.isArray(v) && !v.length));
    info = `<div class="docinfo">${summary ? `<p class="summary">${esc(summary)}</p>` : ""}
      ${rows.length ? `<details><summary>문서 정보 ${rows.length}개 항목</summary><dl>${rows.map(([k, v]) =>
        `<dt>${esc(k)}</dt><dd>${esc(Array.isArray(v) ? v.join(", ") : v)}</dd>`).join("")}</dl></details>` : ""}</div>`;
  }
  return `${info}<div class="md">${tmp.innerHTML}</div>`;
}
function parseFrontmatter(s) {
  const out = {};
  let key = null;
  for (const line of s.split("\n")) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      let v = kv[2].trim();
      if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1).split(",").map((x) => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      else if (v === "") v = [];
      else v = v.replace(/^["']|["']$/g, "");
      out[key] = v;
    } else if (key && /^\s+-\s+/.test(line)) {
      if (!Array.isArray(out[key])) out[key] = [];
      out[key].push(line.replace(/^\s+-\s+/, "").replace(/^["']|["']$/g, ""));
    }
  }
  return out;
}

// ---------- 문서 ----------
async function viewDocs() {
  if (!state.docs) state.docs = await api("/api/docs");
  const scopes = ["전체", ...new Set(state.docs.map((d) => d.scope))];
  const draw = (q) => {
    const needle = q.trim().toLowerCase();
    const list = state.docs.filter((d) => (state.docScope === "전체" || d.scope === state.docScope) &&
      (!needle || [d.title, d.summary, d.path, ...(d.keywords || [])].join(" ").toLowerCase().includes(needle)));
    $("#docList").innerHTML = list.map((d) => `<a class="drow" href="#/f/${enc(d.path)}">
      <div class="t">${esc(d.title)}</div><div class="s">${esc(d.summary)}</div><div class="p mono">${esc(d.path)}</div></a>`).join("")
      || '<p class="empty">맞는 문서가 없습니다. 다른 낱말로 찾아보세요.</p>';
    $("#docCount").textContent = `문서 ${list.length}개`;
  };
  const pinned = [["README.md", "Work 소개", "이 작업공간이 무엇이고 어떻게 나뉘어 있는지"],
    ["INDEX.md", "문서 목록 (INDEX)", "AI가 먼저 읽는 전체 문서 색인"],
    ["AGENTS.md", "에이전트 지침", "에이전트가 이 작업공간에서 지키는 규칙"]];
  main.innerHTML = `<div class="head"><h1>문서</h1><p id="docCount"></p></div>
    <div class="pins">${pinned.map(([f, t, d]) => `<a class="pin" href="#/f/${f}"><b>${t}</b><span>${d}</span><small class="mono">${f}</small></a>`).join("")}</div>
    <label class="search bigsearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input id="docQ" type="search" placeholder="제목, 요약, 검색어로 찾기" autocomplete="off" aria-label="문서 찾기"></label>
    ${scopes.length > 2 ? `<div class="filters">${scopes.map((s) => `<button class="chip ${s === state.docScope ? "on" : ""}" data-scope="${esc(s)}">${esc(s)}</button>`).join("")}</div>` : ""}
    <div class="dlist" id="docList"></div>`;
  const q = $("#docQ");
  q.addEventListener("input", () => draw(q.value));
  main.querySelectorAll("[data-scope]").forEach((b) => b.addEventListener("click", () => {
    state.docScope = b.dataset.scope;
    main.querySelectorAll("[data-scope]").forEach((x) => x.classList.toggle("on", x === b));
    draw(q.value);
  }));
  draw("");
}

// ---------- 찾기 ----------
async function viewSearch(q) {
  main.innerHTML = `<div class="head"><h1>찾기</h1><p>프로젝트와 docs에서 파일·폴더 이름으로 찾습니다. 백업 폴더는 빼고 찾습니다.</p></div>
    <label class="search bigsearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input id="sq" type="search" placeholder="예: issue-22, 배너, .pdf" value="${esc(q)}" autocomplete="off" enterkeyhint="search" aria-label="파일 이름"></label>
    <div id="sres"></div>`;
  const input = $("#sq");
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") location.hash = `#/search?q=${encodeURIComponent(input.value)}`; });
  if (!q) { input.focus(); return; }
  $("#sres").innerHTML = '<div class="skeleton"></div>';
  const hits = await api(`/api/search?q=${encodeURIComponent(q)}`);
  $("#sres").innerHTML = hits.length ? `<div class="files">${hits.map((h) => {
    const parts = h.path.split("/"); const name = parts.pop();
    const [cls, icon] = fileKind(name, h.dir);
    return `<a class="frow ${cls}" href="#/f/${enc(h.path)}">${icon}<span class="nm">${esc(name)}<small>${esc(parts.join("/"))}</small></span><span class="sz"></span><span class="dt">${ago(h.mtime)}</span></a>`;
  }).join("")}</div>` : `<p class="empty">"${esc(q)}"이(가) 들어간 이름이 없습니다.</p>`;
}

// ---------- 시작 ----------
$("#q").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.value.trim()) location.hash = `#/search?q=${encodeURIComponent(e.target.value.trim())}`;
});
window.addEventListener("hashchange", () => render());
setInterval(() => document.querySelectorAll("time[data-t]").forEach((el) => (el.textContent = clock(+el.dataset.t))), 30_000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) resync(); });
// git 상태(커밋·푸시)는 파일 감시에 안 잡히므로 30초마다 다시 확인
setInterval(() => { if (!document.hidden) refreshProjectsSoon(); }, 30_000);

(async () => {
  await loadActivity().catch(() => {});
  connect();
  await loadProjects().catch(() => {});
  render();
})();
