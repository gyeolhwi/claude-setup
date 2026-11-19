#!/usr/bin/env node
/**
 * repo-init.mjs — 새 프로젝트의 GitHub 작업 환경을 점검하고 빠진 것만 채운다.
 *
 *   check                    무엇이 있고 무엇이 빠졌는지 표로 출력 (읽기 전용)
 *   board  [--title <t>]     GitHub Project 를 만들거나 찾아 저장소에 연결하고 필드를 채운다
 *   labels                   진행 상태(status:*)·성격 라벨 중 없는 것만 만든다
 *
 * 모든 명령은 멱등이다. 이미 있으면 건드리지 않는다.
 * 보드 캐시와 Status 연동은 issue-create 의 issue-tracker.mjs 를 그대로 쓴다.
 *
 * 요구사항: git, Node 18+, gh (project 권한: gh auth refresh -s project)
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ISSUE_SCRIPTS = path.resolve(HERE, '../../issue-create/scripts');
if (!existsSync(path.join(ISSUE_SCRIPTS, 'issue-tracker.mjs'))) {
  console.error(`✗ issue-create 스킬을 찾지 못했다: ${ISSUE_SCRIPTS}`);
  console.error('  repo-init 은 issue-create 와 같은 skills 폴더에 설치되어야 한다.');
  process.exit(1);
}
const { findBoard } = await import(path.join(ISSUE_SCRIPTS, 'issue-tracker.mjs'));
const { STATUS_LABELS } = await import(path.join(ISSUE_SCRIPTS, 'issue-common.mjs'));

const SPEC = JSON.parse(readFileSync(path.resolve(HERE, '../references/board-fields.json'), 'utf8'));

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  return { code: r.status ?? 1, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

function ghJson(args, opts) {
  const r = run('gh', args, opts);
  if (r.code !== 0) return null;
  try { return JSON.parse(r.out); } catch { return null; }
}

function repoRoot() {
  const r = run('git', ['rev-parse', '--show-toplevel']);
  return r.code === 0 ? r.out : null;
}

function repoInfo(root) {
  return ghJson(['repo', 'view', '--json', 'nameWithOwner,isPrivate,owner,defaultBranchRef'], { cwd: root });
}

function hasProjectScope() {
  const r = run('gh', ['auth', 'status']);
  const text = `${r.out}\n${r.err}`;
  // 활성 계정 블록의 scope 만 본다. 여러 계정이 로그인돼 있으면 Active account: true 인 블록.
  const blocks = text.split(/\n(?=\s*[✓X!] Logged in)/);
  const active = blocks.find((b) => /Active account: true/.test(b)) ?? blocks[0] ?? '';
  return { loggedIn: r.code === 0, project: /'project'/.test(active) };
}

/* ------------------------------------------------------------------ check */

function fileHas(root, rel, re) {
  const p = path.join(root, rel);
  if (!existsSync(p)) return false;
  return re ? re.test(readFileSync(p, 'utf8')) : true;
}

/** docs/ 아래에서 work-format.md 를 찾는다. 번호 폴더(docs/04-운영/) 같은 기존 구조도 받아준다. */
function findWorkFormat(root) {
  const base = path.join(root, 'docs');
  if (!existsSync(base)) return null;
  const stack = [base];
  while (stack.length) {
    const dir = stack.pop();
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.name === 'work-format.md') return path.relative(root, p);
    }
  }
  return null;
}

function cmdCheck() {
  const rows = [];
  const add = (item, ok, detail, next) => rows.push({ item, ok, detail, next });
  const root = repoRoot();
  add('git 저장소', !!root, root ?? '없음', 'git init');
  const auth = hasProjectScope();
  add('gh 로그인', auth.loggedIn, auth.loggedIn ? '로그인됨' : '안 됨', 'gh-setup 스킬');
  add('gh project 권한', auth.project, auth.project ? 'project scope 있음' : '없음', '! gh auth refresh -s project');
  if (!root) return print(rows);

  const remote = run('git', ['remote', 'get-url', 'origin'], { cwd: root });
  add('origin 원격', remote.code === 0, remote.code === 0 ? remote.out : '없음', 'gh repo create (승인 후)');
  const commits = run('git', ['rev-list', '--count', 'HEAD'], { cwd: root });
  add('커밋', commits.code === 0 && Number(commits.out) > 0, commits.code === 0 ? `${commits.out}개` : '없음', '첫 커밋 (git-commit 형식)');

  const info = remote.code === 0 ? repoInfo(root) : null;
  if (info) {
    const board = findBoard(root, { repo: info.nameWithOwner, refresh: true, persist: false });
    const detail = board.ok ? `#${board.board.number} ${board.board.title}` : board.reason === 'ambiguous'
      ? `여러 개: ${board.candidates.join(', ')}` : board.reason;
    add('GitHub Project 보드', board.ok, detail, 'repo-init.mjs board');
    if (board.ok) {
      const missing = SPEC.fields.map((f) => f.name).filter((n) => !board.board.fields?.[n]);
      add('보드 필드', missing.length === 0, missing.length ? `없음: ${missing.join(', ')}` : '전부 있음', 'repo-init.mjs board');
    }
    const labels = (ghJson(['label', 'list', '--limit', '200', '--json', 'name'], { cwd: root }) ?? []).map((l) => l.name);
    const want = [...Object.keys(STATUS_LABELS), ...SPEC.labels.map((l) => l.name)];
    const lack = want.filter((n) => !labels.includes(n));
    add('라벨', lack.length === 0, lack.length ? `없음: ${lack.join(', ')}` : '전부 있음', 'repo-init.mjs labels');
  }

  add('README.md', fileHas(root, 'README.md'), '', 'docs-tidy 형식으로 작성');
  add('INDEX.md', fileHas(root, 'INDEX.md'), '', 'docs-tidy 의 docs_index.py build');
  const workFormat = findWorkFormat(root);
  add('work-format 문서', !!workFormat, workFormat ?? 'docs/ 아래에 없음', 'references/work-format.template.md 로 작성 (기존 docs 구조가 있으면 그 안에)');
  const rulesFile = ['CLAUDE.md', 'AGENTS.md'].find((f) => fileHas(root, f, /repo-init:rules:start/));
  add('에이전트 규칙 블록', !!rulesFile, rulesFile ?? 'CLAUDE.md·AGENTS.md 에 없음', 'references/agent-rules.template.md 삽입');
  for (const dir of ['.issue', '.omc']) {
    const ignore = run('git', ['check-ignore', '-q', `${dir}/x`], { cwd: root });
    add(`.gitignore 에 ${dir}/`, ignore.code === 0, '', '.gitignore 에 추가');
  }
  const tag = run('git', ['describe', '--tags', '--abbrev=0'], { cwd: root });
  add('릴리스 태그', true, tag.code === 0 ? `최근 ${tag.out}` : '아직 없음 (첫 배포 때 git-release 가 형식을 묻는다)', '');
  print(rows);
}

function print(rows) {
  const w = Math.max(...rows.map((r) => r.item.length)) + 2;
  for (const r of rows) {
    const mark = r.ok ? '✓' : '✗';
    const tail = !r.ok && r.next ? `  → ${r.next}` : '';
    console.log(`${mark} ${r.item.padEnd(w)} ${r.detail}${tail}`);
  }
  const missing = rows.filter((r) => !r.ok).length;
  console.log('');
  console.log(`MISSING=${missing}`);
}

/* ------------------------------------------------------------------ board */

function cmdBoard(opts) {
  const root = repoRoot();
  if (!root) { console.error('✗ git 저장소가 아니다.'); process.exit(1); }
  const info = repoInfo(root);
  if (!info) { console.error('✗ GitHub 원격을 확인하지 못했다. origin 과 gh 로그인을 확인하라.'); process.exit(1); }
  if (!hasProjectScope().project) {
    console.error('✗ gh 토큰에 project 권한이 없다. 사용자에게 `! gh auth refresh -s project` 를 실행해 달라고 한다.');
    process.exit(4);
  }
  const owner = opts.owner ?? info.owner.login;
  const repoName = info.nameWithOwner.split('/')[1];

  let found = findBoard(root, { repo: info.nameWithOwner, refresh: true });
  if (!found.ok && found.reason === 'ambiguous') {
    console.error(`✗ 연결된 보드가 여러 개다: ${found.candidates.join(', ')}`);
    console.error('  issue-create.mjs board --pick <번호> 로 고른 뒤 다시 실행하라.');
    process.exit(3);
  }
  if (!found.ok && found.reason !== 'none') { console.error(`✗ ${found.reason}`); process.exit(1); }

  if (!found.ok) {
    const title = opts.title ?? repoName;
    const created = ghJson(['project', 'create', '--owner', owner, '--title', title, '--format', 'json']);
    if (!created?.number) { console.error(`✗ 보드 생성 실패 (owner=${owner})`); process.exit(1); }
    console.log(`✓ 보드 생성 #${created.number} ${title}`);
    const link = run('gh', ['project', 'link', String(created.number), '--owner', owner, '--repo', info.nameWithOwner]);
    if (link.code !== 0) { console.error(`✗ 저장소 연결 실패: ${link.err}`); process.exit(1); }
    console.log(`✓ ${info.nameWithOwner} 에 연결`);
    found = findBoard(root, { repo: info.nameWithOwner, number: created.number });
    if (!found.ok) { console.error(`✗ 생성한 보드를 다시 찾지 못했다: ${found.reason}`); process.exit(1); }
  } else {
    console.log(`= 연결된 보드 #${found.board.number} ${found.board.title} 를 쓴다`);
  }

  const { board } = found;
  let changed = false;
  for (const f of SPEC.fields) {
    const have = board.fields?.[f.name];
    if (!have) {
      const args = ['project', 'field-create', String(board.number), '--owner', board.owner ?? owner,
        '--name', f.name, '--data-type', f.type];
      if (f.options) args.push('--single-select-options', f.options.join(','));
      const r = run('gh', args);
      if (r.code !== 0) console.error(`! "${f.name}" 필드 생성 실패: ${r.err}`);
      else { console.log(`✓ 필드 추가 ${f.name}`); changed = true; }
    } else if (f.options) {
      const lack = f.options.filter((o) => !have.options?.[o]);
      if (lack.length) console.log(`! "${f.name}" 에 없는 옵션: ${lack.join(', ')} — 기존 옵션을 지우지 않으려고 손대지 않았다. 보드 설정에서 추가하라.`);
    }
  }
  const status = board.fields?.Status?.options ?? {};
  const lackStatus = ['Todo', 'In Progress', 'Done'].filter((o) => !status[o]);
  if (lackStatus.length) console.log(`! Status 에 없는 옵션: ${lackStatus.join(', ')} — issue 스킬은 이 이름으로 옮긴다.`);

  const final = changed ? findBoard(root, { repo: info.nameWithOwner, number: board.number }) : found;
  console.log('');
  console.log(`BOARD_NUMBER=${final.board.number}`);
  console.log(`BOARD_OWNER=${final.board.owner ?? owner}`);
  console.log(`BOARD_URL=${final.board.url}`);
}

/* ----------------------------------------------------------------- labels */

function cmdLabels() {
  const root = repoRoot();
  if (!root) { console.error('✗ git 저장소가 아니다.'); process.exit(1); }
  const have = (ghJson(['label', 'list', '--limit', '200', '--json', 'name'], { cwd: root }) ?? []).map((l) => l.name);
  const want = [
    ...Object.entries(STATUS_LABELS).map(([name, v]) => ({ name, color: v.color, description: v.description })),
    ...SPEC.labels,
  ];
  let made = 0;
  for (const l of want) {
    if (have.includes(l.name)) continue;
    const r = run('gh', ['label', 'create', l.name, '--color', l.color, '--description', l.description], { cwd: root });
    if (r.code === 0) { console.log(`✓ 라벨 ${l.name}`); made += 1; } else console.error(`! 라벨 ${l.name} 실패: ${r.err}`);
  }
  console.log(`CREATED=${made}`);
}

/* ------------------------------------------------------------------- main */

const [mode, ...rest] = process.argv.slice(2);
const opts = {};
for (let i = 0; i < rest.length; i += 1) {
  if (rest[i] === '--title') opts.title = rest[++i];
  else if (rest[i] === '--owner') opts.owner = rest[++i];
}
if (mode === 'check') cmdCheck();
else if (mode === 'board') cmdBoard(opts);
else if (mode === 'labels') cmdLabels();
else {
  console.error('Usage: node repo-init.mjs check | board [--title <t>] [--owner <o>] | labels');
  process.exit(1);
}
