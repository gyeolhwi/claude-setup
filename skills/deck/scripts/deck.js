#!/usr/bin/env node
'use strict';
/*
 * deck.js — 기획안(plan.md) → 발표자료(pptx) 생성기
 *
 *   node deck.js check  <plan.md>                 형식·분량 검사 + 「구성 한눈에 보기」표/슬라이드 제목 자동 동기화
 *   node deck.js build  <plan.md> [-o out.pptx]   검사 통과 시 pptx 생성 (--force: 오류 무시)
 *   node deck.js render <deck.pptx>               슬라이드 이미지(jpg) + 전체 그리드 생성 (시각 검수용)
 *   node deck.js layouts                          사용 가능한 형태(layout) 목록
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const yaml = require('js-yaml');
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');

// ─── 디자인 토큰 (ppt.pptx 기준) ─────────────────────────────────────────────
const C = {
  accent: '0066FF', accentDeep: '005EEB', ink: '171719', strong: '333438', body: '2E2F33',
  muted: '70737C', surface: 'F7F7F8', tint: 'EAF2FE', white: 'FFFFFF',
};
// 강조색 프리셋 — 기획안 개요 표의 「색상」 줄에 이름 또는 #HEX 로 지정 (기본 blue)
const PRESETS = {
  blue: '0066FF', navy: '1E3A8A', indigo: '4F46E5', purple: '7C3AED', teal: '0F766E',
  green: '15803D', orange: 'E8590C', red: 'DC2626', black: '171719',
};
const hexRgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbHex = (a) => a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const mix = (h, to, t) => rgbHex(hexRgb(h).map((v, i) => v + (hexRgb(to)[i] - v) * t));
function luminance(h) {
  const [r, g, b] = hexRgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
// 강조색 하나로 진한색(강조 글자)·연한색(배지·정보 박스 배경)을 파생
function resolveAccent(value) {
  const v = String(value || 'blue').trim().replace(/^#/, '');
  const hex = PRESETS[v.toLowerCase()] || (/^[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : null);
  if (!hex) return { error: `색상 "${value}" 을(를) 알 수 없습니다 — 프리셋(${Object.keys(PRESETS).join(', ')}) 또는 #RRGGBB` };
  const contrast = 1.05 / (luminance(hex) + 0.05);
  if (contrast < 3) return { error: `색상 #${hex} 은(는) 너무 밝아 흰 글자가 보이지 않습니다 (대비 ${contrast.toFixed(1)}:1, 3:1 이상 필요). 더 진한 색을 고르세요` };
  if (hex === '0066FF') return { accent: hex, accentDeep: '005EEB', tint: 'EAF2FE' }; // 기준 덱 원본값
  return { accent: hex, accentDeep: mix(hex, '000000', 0.08), tint: mix(hex, 'FFFFFF', 0.9) };
}
const FONT = 'Pretendard';
const MONO = 'Courier New';
const L = 120, R = 1800, CW = R - L, BOTTOM = 1000; // px (1920×1080 캔버스)
const px = (v) => v / 96;

// ─── 텍스트 분량 추정 ────────────────────────────────────────────────────────
function charW(ch) {
  const c = ch.codePointAt(0);
  // Pretendard 실측 폭(em) + 약 3% 여유
  if ((c >= 0xac00 && c <= 0xd7a3) || (c >= 0x3130 && c <= 0x318f) || (c >= 0x4e00 && c <= 0x9fff)) return 0.89;
  if (ch === ' ') return 0.25;
  if (/[MW%→]/.test(ch)) return 0.95;
  if (/[A-Z]/.test(ch)) return 0.72;
  if (/[a-z0-9]/.test(ch)) return 0.6;
  if (/[·.,:;'"!|()[\]/]/.test(ch)) return 0.36;
  if (/[~+\-–—×&]/.test(ch)) return 0.66;
  return 0.75;
}
const textW = (t, pt) => [...String(t)].reduce((s, ch) => s + charW(ch), 0) * pt * 96 / 72;
function lineCount(t, pt, w) {
  let lines = 0;
  for (const para of String(t).split('\n')) {
    lines++;
    let cur = 0;
    for (const word of para.split(' ')) {
      const ww = textW(word, pt), sp = textW(' ', pt);
      if (cur === 0) cur = ww;
      else if (cur + sp + ww <= w) cur += sp + ww;
      else { lines++; cur = ww; }
      while (cur > w) { lines++; cur -= w; }
    }
  }
  return lines;
}
const lineH = (pt, mult) => pt * 96 / 72 * 1.2 * mult;
const plain = (s) => String(s).replace(/\[\[|\]\]/g, '');

function accentRuns(str, base, accent, extra = {}) {
  const parts = String(str).split(/(\[\[.+?\]\])/).filter(Boolean);
  return parts.map((p) => {
    const m = p.match(/^\[\[(.+)\]\]$/);
    return { text: m ? m[1] : p, options: { color: m ? accent : base, ...extra } };
  });
}

// ─── 아이콘 (lucide) ─────────────────────────────────────────────────────────
const ICON_DIR = path.join(__dirname, 'node_modules/lucide-static/icons');
const iconExists = (n) => fs.existsSync(path.join(ICON_DIR, `${n}.svg`));
const iconCache = {};
async function iconData(name, color) {
  const k = `${name}:${color}`;
  if (iconCache[k]) return iconCache[k];
  let svg = fs.readFileSync(path.join(ICON_DIR, `${name}.svg`), 'utf8');
  svg = svg.replace(/currentColor/g, `#${color}`).replace(/width="24"/, 'width="256"').replace(/height="24"/, 'height="256"')
    .replace(/stroke-width="2"/, 'stroke-width="1.75"');
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return (iconCache[k] = `image/png;base64,${buf.toString('base64')}`);
}

// ─── 상태 배지 톤 ────────────────────────────────────────────────────────────
const BADGE_TONE = { 완료: 'tint', 활성: 'tint', 운영: 'tint', '진행 중': 'solid', 진행중: 'solid', 현재: 'solid' };
const badgeTone = (t) => BADGE_TONE[String(t).trim()] || 'gray';

// ─── 슬라이드 그리기 컨텍스트 ────────────────────────────────────────────────
class Ctx {
  constructor(pres, slide, d, report) { Object.assign(this, { pres, slide, d, report }); }
  err(field, msg) { this.report.errors.push(`S${this.d._no} [${this.d.layout}] ${field}: ${msg}`); }
  warn(field, msg) { this.report.warnings.push(`S${this.d._no} [${this.d.layout}] ${field}: ${msg}`); }

  text(field, value, o) {
    if (value == null || value === '') return;
    const str = String(value);
    const mult = o.mult ?? 1.15;
    const lh = lineH(o.size, mult);
    const maxLines = o.maxLines ?? Math.max(1, Math.floor((o.h + 2) / lh));
    const lines = lineCount(plain(str), o.size, o.w);
    if (lines > maxLines) {
      this.err(field, `분량 초과 — 약 ${lines}줄 필요, 허용 ${maxLines}줄 (현재 ${[...plain(str)].length}자). 문구를 줄이세요`);
    }
    const runs = accentRuns(str, o.color, o.accent || C.accent, { bold: !!o.bold });
    this.slide.addText(runs, {
      x: px(o.x), y: px(o.y), w: px(o.w), h: px(o.h), fontFace: o.font || FONT, fontSize: o.size,
      bold: !!o.bold, color: o.color, align: o.align || 'left', valign: o.valign || 'top', margin: 0,
      isTextBox: true, lineSpacingMultiple: mult, fit: 'none', wrap: true,
    });
  }

  bullets(field, items, o) {
    const mult = o.mult ?? 1.15, lh = lineH(o.size, mult), gap = o.size * 0.6;
    const indent = o.size * 1.1 * 96 / 72;
    const need = items.reduce((s, t) => s + lineCount(t, o.size, o.w - indent) * lh, 0) + gap * (items.length - 1);
    if (need > o.h + 2) this.err(field, `분량 초과 — 항목 수나 문구 길이를 줄이세요 (필요 높이 ${Math.round(need)}px / 허용 ${Math.round(o.h)}px)`);
    const code = o.marker === 'check' ? '2713' : '2022';
    const runs = items.map((t, i) => ({
      text: String(t),
      options: { bullet: { code, indent: o.size * 1.1 }, color: o.color, paraSpaceAfter: i < items.length - 1 ? o.size * 0.6 : 0, breakLine: i < items.length - 1 },
    }));
    this.slide.addText(runs, {
      x: px(o.x), y: px(o.y), w: px(o.w), h: px(o.h), fontFace: FONT, fontSize: o.size, color: o.color,
      valign: 'top', margin: 0, isTextBox: true, lineSpacingMultiple: mult, fit: 'none', wrap: true,
    });
  }

  rect(x, y, w, h, color, transparency = 0) {
    this.slide.addShape(this.pres.shapes.RECTANGLE, { x: px(x), y: px(y), w: px(w), h: px(h), fill: { color, transparency }, line: { type: 'none' } });
  }

  // style: line(테두리) | fill(연회색) | accent(파랑) | tint(연파랑) | dashed | white
  card(x, y, w, h, style = 'line', radius = 20) {
    const o = { x: px(x), y: px(y), w: px(w), h: px(h), rectRadius: px(Math.min(radius, h / 2)) };
    const thin = { color: C.muted, width: 0.75, transparency: 78 };
    if (style === 'line') Object.assign(o, { fill: { color: C.white }, line: thin });
    if (style === 'white') Object.assign(o, { fill: { color: C.white }, line: { ...thin, transparency: 60 } });
    if (style === 'dashed') Object.assign(o, { fill: { color: C.white }, line: { color: C.muted, width: 1, transparency: 50, dashType: 'dash' } });
    if (style === 'fill') Object.assign(o, { fill: { color: C.surface }, line: { type: 'none' } });
    if (style === 'accent') Object.assign(o, { fill: { color: C.accent }, line: { type: 'none' } });
    if (style === 'tint') Object.assign(o, { fill: { color: C.tint }, line: { type: 'none' } });
    if (style === 'gray') Object.assign(o, { fill: { color: C.muted, transparency: 85 }, line: { type: 'none' } });
    this.slide.addShape(this.pres.shapes.ROUNDED_RECTANGLE, o);
  }

  async icon(name, x, y, size, color) {
    if (!name) return;
    if (!iconExists(name)) return this.err('icon', `없는 아이콘 이름 "${name}" (https://lucide.dev/icons 참고)`);
    this.slide.addImage({ data: await iconData(name, color), x: px(x), y: px(y), w: px(size), h: px(size) });
  }

  badge(text, x, y, align = 'left') {
    const tone = badgeTone(text);
    const w = textW(text, 18) + 40, h = 44;
    const bx = align === 'right' ? x - w : x;
    this.card(bx, y, w, h, tone === 'solid' ? 'accent' : tone === 'tint' ? 'tint' : 'gray', 22);
    this.text('status', text, { x: bx, y, w, h, size: 18, bold: true, align: 'center', valign: 'middle', maxLines: 1, mult: 1,
      color: tone === 'solid' ? C.white : tone === 'tint' ? C.accent : C.strong });
    return w;
  }

  // 섹션 라벨 + 제목 (+ 리드 문장). 콘텐츠 시작 y 반환
  header({ width = CW, lead = true, dark = false } = {}) {
    const d = this.d;
    const c1 = dark ? C.white : C.accent, c2 = dark ? C.white : C.ink, c3 = dark ? C.white : C.body;
    this.text('section', `${d._sec} ${d.section}`, { x: L, y: 100, w: width, h: 37, size: 21, bold: true, color: c1, maxLines: 1, mult: 1 });
    this.text('title', d.title, { x: L, y: 150, w: width, h: 84, size: 48, bold: true, color: c2, maxLines: 1, mult: 1, accent: dark ? C.white : C.accent });
    if (lead && d.lead) {
      this.text('lead', d.lead, { x: L, y: 253, w: width, h: 42, size: 24, color: c3, maxLines: 1 });
      return 360;
    }
    return 300;
  }
}

// ─── 형태(layout) 정의 ───────────────────────────────────────────────────────
// 필드 표기: 'str' 필수 문자열 · 'str?' 선택 · 'icon?' lucide 아이콘명 · {list:[최소,최대], of:...}
const STEP = { title: 'str', sub: 'str?' };
const LAYOUTS = {
  cover: {
    name: '표지', fields: { kicker: 'str?', subtitle: 'str?', meta: 'str?' }, noSection: true,
    async render(x, d) {
      if (d.kicker) {
        x.rect(140, 405, 64, 4, C.accent);
        x.text('kicker', d.kicker, { x: 228, y: 386, w: 1500, h: 44, size: 30, bold: true, color: C.strong, maxLines: 1, mult: 1 });
      }
      x.text('title', d.title, { x: 140, y: 462, w: 1660, h: 160, size: 96, bold: true, color: C.ink, maxLines: 1, mult: 1 });
      x.text('subtitle', d.subtitle, { x: 140, y: 660, w: 1660, h: 50, size: 30, color: C.body, maxLines: 1, mult: 1 });
      x.text('meta', d.meta, { x: 140, y: 940, w: 1660, h: 36, size: 21, color: C.muted, maxLines: 1, mult: 1 });
    },
  },

  images: {
    name: '이미지 예시', fields: { lead: 'str?', images: { list: [1, 3], of: { path: 'str', caption: 'str', sub: 'str?' } } },
    async render(x, d) {
      const top = x.header(), gap = 24, cardH = BOTTOM - top, innerH = cardH - 32 - 96, n = d.images.length;
      const metas = await Promise.all(d.images.map(async (im) => {
        const p = path.resolve(x.d._base, im.path);
        if (!fs.existsSync(p)) { x.warn('images.path', `이미지 없음: ${im.path} (자리표시로 출력)`); return { p: null, ar: 0.75 }; }
        const m = await sharp(p).metadata();
        return { p, ar: m.width / m.height };
      }));
      let widths = metas.map((m) => m.ar * innerH + 160);
      const sum = widths.reduce((a, b) => a + b, 0);
      if (sum + gap * (n - 1) > CW) widths = widths.map((w) => w * (CW - gap * (n - 1)) / sum);
      let cx = L;
      for (let i = 0; i < n; i++) {
        const w = widths[i], im = d.images[i], m = metas[i];
        x.card(cx, top, w, cardH, 'fill');
        let iw = Math.min(w - 64, m.ar * innerH), ih = iw / m.ar;
        const iy = top + 32 + (innerH - ih) / 2, ix = cx + (w - iw) / 2;
        if (m.p) x.slide.addImage({ path: m.p, x: px(ix), y: px(iy), w: px(iw), h: px(ih) });
        else {
          x.card(ix, iy, iw, ih, 'dashed', 12);
          x.text('images.path', `이미지: ${im.path}`, { x: ix + 16, y: iy + ih / 2 - 20, w: iw - 32, h: 40, size: 16, color: C.muted, align: 'center', maxLines: 2 });
        }
        const capW = w - 64;
        if (textW(im.caption, 21) + (im.sub ? textW(im.sub, 18) + 24 : 0) > capW) x.err(`images[${i}]`, 'caption+sub 가 카드 폭을 넘습니다. 줄이세요');
        x.text(`images[${i}].caption`, im.caption, { x: cx + 32, y: top + cardH - 66, w: capW, h: 36, size: 21, bold: true, color: C.strong, maxLines: 1, mult: 1 });
        if (im.sub) x.slide.addText(im.sub, { x: px(cx + 32), y: px(top + cardH - 64), w: px(capW), h: px(34), fontFace: FONT, fontSize: 18, color: C.body, align: 'right', margin: 0, isTextBox: true, valign: 'top' });
        cx += w + gap;
      }
    },
  },

  'stat-list': {
    name: '핵심 수치 + 항목', fields: { lead: 'str?', stat: { obj: { value: 'str', label: 'str' } }, items: { list: [2, 4], of: { icon: 'icon?', title: 'str', desc: 'str' } } },
    async render(x, d) {
      x.header({ lead: false });
      let y = 305;
      if (d.lead) { x.text('lead', d.lead, { x: L, y, w: 640, h: 150, size: 24, color: C.body, maxLines: 3 }); y = 485; }
      x.card(L, y, 640, 284, 'fill');
      x.text('stat.value', d.stat.value, { x: 168, y: y + 36, w: 560, h: 150, size: 108, bold: true, color: C.accent, maxLines: 1, mult: 0.9 });
      x.text('stat.label', d.stat.label, { x: 168, y: y + 212, w: 560, h: 40, size: 22.5, bold: true, color: C.strong, maxLines: 1, mult: 1 });
      const n = d.items.length, rowH = Math.min(157, (BOTTOM - 305) / n);
      for (let i = 0; i < n; i++) {
        const it = d.items[i], ry = 305 + i * rowH;
        await x.icon(it.icon, 856, ry + (rowH - 40) / 2, 40, C.accent);
        x.text(`items[${i}].title`, it.title, { x: 932, y: ry + rowH / 2 - 52, w: 868, h: 48, size: 27, bold: true, color: C.strong, maxLines: 1, mult: 1 });
        x.text(`items[${i}].desc`, it.desc, { x: 932, y: ry + rowH / 2 + 2, w: 868, h: 38, size: 21, color: C.body, maxLines: 1, mult: 1 });
        if (i < n - 1) x.rect(856, ry + rowH - 1, 944, 1, C.muted, 70);
      }
    },
  },

  table: {
    name: '비교표', fields: { lead: 'str?', columns: { list: [2, 4], of: 'str' }, rows: { list: [1, 7], of: { list: [2, 4], of: 'str' } }, highlight: 'str?' },
    async render(x, d) {
      const top = x.header(), cols = d.columns.length;
      const firstW = 280, restW = (CW - firstW) / (cols - 1);
      const colX = (c) => (c === 0 ? L : L + firstW + (c - 1) * restW), colW = (c) => (c === 0 ? firstW : restW);
      const hl = d.highlight === 'none' ? -1 : d.highlight ? Number(d.highlight) - 1 : cols - 1;
      const hy = top + 16;
      d.columns.forEach((h, c) => x.text(`columns[${c}]`, h, { x: colX(c), y: hy, w: colW(c) - 24, h: 40, size: 19.5, bold: true, color: c === hl ? C.accent : C.body, maxLines: 1, mult: 1 }));
      x.rect(L, hy + 58, CW, 1, C.strong);
      const n = d.rows.length, avail = BOTTOM - (hy + 60), rowH = Math.min(118, avail / n), size = rowH >= 100 ? 24 : 21;
      d.rows.forEach((row, r) => {
        if (row.length !== cols) x.err(`rows[${r}]`, `칸 수(${row.length})가 columns(${cols})와 다릅니다`);
        const ry = hy + 60 + r * rowH;
        row.forEach((cell, c) => x.text(`rows[${r}][${c}]`, cell, {
          x: colX(c), y: ry, w: colW(c) - 24, h: rowH, size, valign: 'middle',
          bold: c === 0 || c === hl, color: c === 0 || c === hl ? C.strong : C.body,
        }));
        if (r < n - 1) x.rect(L, ry + rowH - 1, CW, 1, C.muted, 70);
      });
    },
  },

  flow: {
    name: '단계 흐름', fields: { lead: 'str?', steps: { list: [3, 6], of: { icon: 'icon?', label: 'str' } }, highlight: 'str?', caption: 'str?' },
    async render(x, d) {
      const top = x.header(), n = d.steps.length, gap = 56, cardW = Math.min(300, (CW - (n - 1) * gap) / n), cardH = 285;
      const totalW = cardW * n + gap * (n - 1), x0 = L + (CW - totalW) / 2;
      const areaB = d.caption ? 920 : BOTTOM, cy = top + (areaB - top - cardH) / 2, hl = Number(d.highlight || 0) - 1;
      for (let i = 0; i < n; i++) {
        const s = d.steps[i], cx = x0 + i * (cardW + gap), on = i === hl;
        x.card(cx, cy, cardW, cardH, on ? 'accent' : 'line');
        await x.icon(s.icon, cx + (cardW - 52) / 2, cy + 56, 52, on ? C.white : C.strong);
        x.text(`steps[${i}]`, String(i + 1).padStart(2, '0'), { x: cx, y: cy + 136, w: cardW, h: 30, size: 18, bold: true, color: on ? C.white : C.muted, align: 'center', maxLines: 1, mult: 1 });
        x.text(`steps[${i}].label`, s.label, { x: cx + 12, y: cy + 180, w: cardW - 24, h: 84, size: 24, bold: true, color: on ? C.white : C.strong, align: 'center', maxLines: 2, mult: 1.05 });
        if (i < n - 1) await x.icon('chevron-right', cx + cardW + (gap - 28) / 2, cy + (cardH - 28) / 2, 28, 'B5B7BD');
      }
      x.text('caption', d.caption, { x: L, y: 950, w: CW, h: 40, size: 22.5, color: C.body, maxLines: 1, mult: 1 });
    },
  },

  'step-cards': {
    name: '카드 그리드', fields: {
      lead: 'str?', marker: 'str?',
      cards: { list: [2, 4], of: { tag: 'str?', title: 'str', bullets: { list: [1, 5], of: 'str' } } },
      chips: { obj: { label: 'str', items: { list: [1, 5], of: { icon: 'icon?', text: 'str' } } }, optional: true },
    },
    async render(x, d) {
      const top = x.header(), n = d.cards.length, gap = 24, cardW = (CW - gap * (n - 1)) / n;
      const cardH = Math.min(480, (d.chips ? BOTTOM - 110 : BOTTOM) - top);
      d.cards.forEach((c, i) => {
        const cx = L + i * (cardW + gap);
        x.card(cx, top, cardW, cardH, 'fill');
        let ty = top + 36;
        if (c.tag) { x.text(`cards[${i}].tag`, c.tag, { x: cx + 36, y: ty, w: cardW - 72, h: 30, size: 18, bold: true, color: C.accent, maxLines: 1, mult: 1 }); ty += 46; }
        x.text(`cards[${i}].title`, c.title, { x: cx + 36, y: ty, w: cardW - 72, h: 46, size: 27, bold: true, color: C.strong, maxLines: 1, mult: 1 });
        x.bullets(`cards[${i}].bullets`, c.bullets, { x: cx + 36, y: ty + 70, w: cardW - 72, h: top + cardH - 36 - (ty + 70), size: 19.5, color: C.body, marker: d.marker });
      });
      if (d.chips) {
        const cy = top + cardH + 40;
        x.text('chips.label', d.chips.label, { x: L, y: cy + 13, w: 160, h: 36, size: 19.5, bold: true, color: C.body, maxLines: 1, mult: 1 });
        let cx = L + textW(d.chips.label, 19.5) + 28;
        for (const [i, it] of d.chips.items.entries()) {
          const w = textW(it.text, 19.5) + (it.icon ? 40 : 0) + 56;
          if (cx + w > R) { x.err('chips', '칩이 한 줄을 넘습니다. 개수나 문구를 줄이세요'); break; }
          x.card(cx, cy, w, 62, 'line', 31);
          if (it.icon) await x.icon(it.icon, cx + 26, cy + 19, 24, C.strong);
          x.text(`chips.items[${i}]`, it.text, { x: cx + (it.icon ? 62 : 28), y: cy + 13, w: w - (it.icon ? 62 : 28) - 20, h: 36, size: 19.5, bold: true, color: C.strong, maxLines: 1, mult: 1 });
          cx += w + 20;
        }
      }
    },
  },

  'spec-list': {
    name: '항목 목록', fields: { lead: 'str?', rows: { list: [2, 6], of: { label: 'str', value: 'str', desc: 'str?' } } },
    async render(x, d) {
      const top = x.header(), n = d.rows.length, gap = 16, rowH = Math.min(129, (BOTTOM - top - gap * (n - 1)) / n);
      d.rows.forEach((r, i) => {
        const ry = top + i * (rowH + gap);
        x.card(L, ry, CW, rowH, 'line', 16);
        x.text(`rows[${i}].label`, r.label, { x: L + 49, y: ry, w: 240, h: rowH, size: 19.5, bold: true, color: C.body, valign: 'middle', maxLines: 1, mult: 1 });
        x.text(`rows[${i}].value`, r.value, { x: L + 309, y: ry, w: r.desc ? 620 : CW - 360, h: rowH, size: 25.5, bold: true, color: C.strong, valign: 'middle', maxLines: 1, mult: 1 });
        x.text(`rows[${i}].desc`, r.desc, { x: L + 949, y: ry, w: CW - 949 - 40, h: rowH, size: 20, color: C.body, valign: 'middle', maxLines: 2 });
      });
    },
  },

  tree: {
    name: '구조도', fields: { lead: 'str?', root: 'str', items: { list: [2, 6], of: { name: 'str', desc: 'str' } } },
    async render(x, d) {
      const top = x.header(), rowH = 60, cardH = 48 + 56 + d.items.length * rowH + 28;
      x.card(L, top, CW, cardH, 'fill');
      await x.icon('folder', L + 44, top + 44, 34, C.accent);
      x.text('root', d.root, { x: L + 96, y: top + 42, w: CW - 140, h: 40, size: 24, bold: true, color: C.strong, maxLines: 1, mult: 1 });
      d.items.forEach((it, i) => {
        const ry = top + 104 + i * rowH;
        x.text(`items[${i}].name`, it.name, { x: L + 96, y: ry, w: 400, h: rowH, size: 21, bold: true, color: C.strong, font: MONO, valign: 'middle', maxLines: 1, mult: 1 });
        x.text(`items[${i}].desc`, it.desc, { x: L + 520, y: ry, w: CW - 520 - 48, h: rowH, size: 21, color: C.body, valign: 'middle', maxLines: 1, mult: 1 });
        if (i < d.items.length - 1) x.rect(L + 96, ry + rowH - 1, CW - 144, 1, C.muted, 75);
      });
      if (top + cardH > BOTTOM) x.err('items', '항목이 너무 많습니다');
    },
  },

  pipeline: {
    name: '처리 파이프라인', fields: {
      lead: 'str?', inputs: { list: [0, 3], of: 'str', optional: true }, steps: { list: [3, 6], of: STEP },
      highlight: 'str?', highlight_tag: 'str?', note: 'str?',
    },
    async render(x, d) {
      let y = x.header();
      if (d.inputs && d.inputs.length) {
        let cx = L;
        d.inputs.forEach((t, i) => {
          const w = textW(t, 21) + 48;
          x.card(cx, y, w, 61, 'fill', 14);
          x.text(`inputs[${i}]`, t, { x: cx + 24, y, w: w - 40, h: 61, size: 21, bold: true, color: C.strong, valign: 'middle', maxLines: 1, mult: 1 });
          cx += w;
          if (i < d.inputs.length - 1) { x.text('inputs', '+', { x: cx + 12, y, w: 24, h: 61, size: 21, bold: true, color: C.body, valign: 'middle', maxLines: 1, mult: 1 }); cx += 48; }
        });
        y += 61 + 32;
      }
      const n = d.steps.length, gap = 48, w = (CW - gap * (n - 1)) / n, h = 235, hl = Number(d.highlight || 0) - 1;
      const noteTop = d.note ? BOTTOM - 158 : BOTTOM;
      if (!d.inputs || !d.inputs.length) y += Math.max(0, (noteTop - 40 - y - h) / 2);
      for (let i = 0; i < n; i++) {
        const s = d.steps[i], cx = L + i * (w + gap), on = i === hl;
        x.card(cx, y, w, h, on ? 'accent' : 'line');
        const tag = `${i + 1}${on && d.highlight_tag ? ` · ${d.highlight_tag}` : ''}`;
        x.text(`steps[${i}]`, tag, { x: cx + 28, y: y + 32, w: w - 56, h: 30, size: 18, bold: true, color: on ? C.white : C.muted, maxLines: 1, mult: 1 });
        x.text(`steps[${i}].title`, s.title, { x: cx + 28, y: y + 72, w: w - 56, h: s.sub ? 86 : 130, size: 22.5, bold: true, color: on ? C.white : C.strong, mult: 1.1 });
        x.text(`steps[${i}].sub`, s.sub, { x: cx + 28, y: y + 164, w: w - 56, h: 56, size: 18, color: on ? C.white : C.body, maxLines: 2, mult: 1.1 });
        if (i < n - 1) await x.icon('arrow-right', cx + w + (gap - 24) / 2, y + (h - 24) / 2, 24, 'B5B7BD');
      }
      if (d.note) {
        x.card(L, noteTop, CW, 158, 'tint');
        await x.icon('info', L + 52, noteTop + 40, 36, C.accent);
        x.text('note', d.note, { x: L + 112, y: noteTop + 30, w: CW - 170, h: 100, size: 21, color: C.strong, valign: 'middle', maxLines: 3 });
      }
    },
  },

  lanes: {
    name: '구조 비교 (현재/전환)', fields: { lead: 'str?', lanes: { list: [2, 3], of: { label: 'str', steps: { list: [2, 5], of: 'str' } } }, highlight: 'str?', annotation: 'str?' },
    async render(x, d) {
      const top = x.header(), m = Math.max(...d.lanes.map((l) => l.steps.length)), aw = 64;
      const bw = Math.min(330, (CW - 228 - (m - 1) * aw) / m), bh = 102, lgap = d.annotation ? 112 : 64;
      const block = d.lanes.length * bh + (d.lanes.length - 1) * lgap, y0 = top + (BOTTOM - top - block) / 2, hl = Number(d.highlight || 0) - 1;
      for (const [li, lane] of d.lanes.entries()) {
        const ly = y0 + li * (bh + lgap);
        x.text(`lanes[${li}].label`, lane.label, { x: L, y: ly, w: 200, h: bh, size: 21, bold: true, color: C.body, valign: 'middle', maxLines: 1, mult: 1 });
        for (const [si, s] of lane.steps.entries()) {
          const bx = L + 228 + si * (bw + aw), on = si === hl;
          x.card(bx, ly, bw, bh, on ? 'accent' : 'line', 16);
          x.text(`lanes[${li}].steps[${si}]`, s, { x: bx + 16, y: ly, w: bw - 32, h: bh, size: 22.5, bold: true, color: on ? C.white : C.strong, align: 'center', valign: 'middle', maxLines: 2, mult: 1.05 });
          if (si < lane.steps.length - 1) await x.icon('arrow-right', bx + bw + (aw - 24) / 2, ly + (bh - 24) / 2, 24, 'B5B7BD');
        }
      }
      if (d.annotation && hl >= 0) {
        const bx = L + 228 + hl * (bw + aw);
        x.text('annotation', d.annotation, { x: bx - 40, y: y0 + bh + (lgap - 36) / 2, w: bw + 80, h: 36, size: 19.5, bold: true, color: C.accent, align: 'center', maxLines: 1, mult: 1 });
      }
    },
  },

  'detail-cards': {
    name: '상세 카드', fields: { lead: 'str?', cards: { list: [2, 3], of: { tag: 'str', status: 'str?', title: 'str', sub: 'str?', rows: { list: [1, 8], of: { k: 'str', v: 'str' } } } } },
    async render(x, d) {
      const top = x.header(), n = d.cards.length, gap = 32, w = (CW - gap * (n - 1)) / n, h = BOTTOM - top;
      d.cards.forEach((c, i) => {
        const cx = L + i * (w + gap);
        x.card(cx, top, w, h, 'line');
        x.text(`cards[${i}].tag`, c.tag, { x: cx + 49, y: top + 50, w: w - 240, h: 36, size: 19.5, bold: true, color: C.body, maxLines: 1, mult: 1 });
        if (c.status) x.badge(c.status, cx + w - 49, top + 46, 'right');
        x.text(`cards[${i}].title`, c.title, { x: cx + 49, y: top + 100, w: w - 98, h: 56, size: 33, bold: true, color: C.strong, maxLines: 1, mult: 1 });
        x.text(`cards[${i}].sub`, c.sub, { x: cx + 49, y: top + 162, w: w - 98, h: 34, size: 19.5, color: C.body, maxLines: 1, mult: 1 });
        const ry0 = top + 222, rh = 52, maxRows = Math.floor((h - 222 - 32) / rh);
        if (c.rows.length > maxRows) x.err(`cards[${i}].rows`, `행이 너무 많습니다 (최대 ${maxRows})`);
        c.rows.forEach((r, j) => {
          x.text(`cards[${i}].rows[${j}].k`, r.k, { x: cx + 49, y: ry0 + j * rh, w: 170, h: rh, size: 19.5, bold: true, color: C.strong, maxLines: 1, mult: 1 });
          x.text(`cards[${i}].rows[${j}].v`, r.v, { x: cx + 230, y: ry0 + j * rh, w: w - 230 - 40, h: rh, size: 19.5, color: C.body, maxLines: 1, mult: 1 });
        });
      });
    },
  },

  'status-grid': {
    name: '현황 카드', fields: { lead: 'str?', cards: { list: [2, 4], of: { status: 'str', title: 'str', sub: 'str?' } } },
    async render(x, d) {
      const top = x.header(), n = d.cards.length, gap = 24, w = (CW - gap * (n - 1)) / n, h = 300, y = top + (BOTTOM - top - h) / 2;
      d.cards.forEach((c, i) => {
        const cx = L + i * (w + gap), active = badgeTone(c.status) !== 'gray';
        x.card(cx, y, w, h, active ? 'fill' : 'dashed');
        x.badge(c.status, cx + 36, y + 36);
        x.text(`cards[${i}].title`, c.title, { x: cx + 36, y: y + h - 128, w: w - 72, h: 50, size: 30, bold: true, color: active ? C.strong : C.muted, maxLines: 1, mult: 1 });
        x.text(`cards[${i}].sub`, c.sub, { x: cx + 36, y: y + h - 70, w: w - 72, h: 34, size: 19.5, color: C.body, maxLines: 1, mult: 1 });
      });
    },
  },

  points: {
    name: '핵심 포인트', fields: { lead: 'str?', points: { list: [2, 4], of: { title: 'str', desc: 'str' } } },
    async render(x, d) {
      const top = x.header(), n = d.points.length, gap = 64, w = (CW - gap * (n - 1)) / n, y = top + 20;
      d.points.forEach((p, i) => {
        const cx = L + i * (w + gap);
        x.rect(cx, y, w, 2, C.ink);
        x.text(`points[${i}]`, String(i + 1).padStart(2, '0'), { x: cx, y: y + 36, w, h: 76, size: 54, bold: true, color: C.accent, maxLines: 1, mult: 1 });
        x.text(`points[${i}].title`, p.title, { x: cx, y: y + 132, w, h: 50, size: 30, bold: true, color: C.strong, maxLines: 1, mult: 1 });
        x.text(`points[${i}].desc`, p.desc, { x: cx, y: y + 204, w: w - 24, h: 140, size: 21, color: C.body, maxLines: 4 });
      });
    },
  },

  chat: {
    name: '대화 예시', fields: { lead: 'str?', messages: { list: [2, 8], of: { from: 'str', text: 'str' } } },
    async render(x, d) {
      x.slide.background = { color: C.surface };
      x.header({ width: 720, lead: false });
      x.text('lead', d.lead, { x: L, y: 262, w: 720, h: 90, size: 24, color: C.body, maxLines: 2 });
      const maxW = 760, padX = 24, padY = 15, size = 19.5, lh = lineH(size, 1.15), gap = 16;
      const boxes = d.messages.map((m, i) => {
        if (!['user', 'bot'].includes(m.from)) x.err(`messages[${i}].from`, 'user 또는 bot 이어야 합니다');
        const lines = lineCount(m.text, size, maxW - padX * 2);
        const tw = lines > 1 ? maxW - padX * 2 : Math.ceil(textW(m.text, size)) + 6;
        return { ...m, w: tw + padX * 2, h: lines * lh + padY * 2 };
      });
      const total = boxes.reduce((s, b) => s + b.h, 0) + gap * (boxes.length - 1), avail = BOTTOM - 100;
      if (total > avail) x.err('messages', `대화가 너무 깁니다 (필요 ${Math.round(total)}px / 허용 ${avail}px)`);
      let y = 100 + Math.max(0, (avail - total) / 2);
      boxes.forEach((b, i) => {
        const user = b.from === 'user', bx = user ? R - b.w : 920;
        x.card(bx, y, b.w, b.h, user ? 'accent' : 'white', 18);
        x.text(`messages[${i}].text`, b.text, { x: bx + padX, y: y + padY, w: b.w - padX * 2 + 4, h: b.h - padY * 2 + 4, size, bold: user, color: user ? C.white : C.strong, maxLines: 99 });
        y += b.h + gap;
      });
    },
  },

  stages: {
    name: '단계별 계획', fields: { lead: 'str?', stages: { list: [2, 5], of: { label: 'str', desc: 'str' } }, current: 'str?', note: 'str?' },
    async render(x, d) {
      const top = x.header(), n = d.stages.length, gap = 24, w = (CW - gap * (n - 1)) / n, h = 260, cur = Number(d.current || 0) - 1;
      const y = top + Math.max(20, (BOTTOM - (d.note ? 130 : 0) - top - h) / 2);
      d.stages.forEach((s, i) => {
        const cx = L + i * (w + gap), on = i === cur;
        x.card(cx, y, w, h, on ? 'accent' : 'fill');
        x.text(`stages[${i}].label`, on ? `${s.label} · 현재` : s.label, { x: cx + 32, y: y + 32, w: w - 64, h: 30, size: 18, bold: true, color: on ? C.white : C.accent, maxLines: 1, mult: 1 });
        x.text(`stages[${i}].desc`, s.desc, { x: cx + 32, y: y + 80, w: w - 64, h: h - 112, size: 22.5, bold: true, color: on ? C.white : C.strong, mult: 1.15 });
      });
      if (d.note) {
        x.rect(L, BOTTOM - 112, CW, 1, C.muted, 70);
        x.text('note', d.note, { x: L, y: BOTTOM - 88, w: CW, h: 88, size: 22.5, color: C.body, maxLines: 2 });
      }
    },
  },

  roadmap: {
    name: '로드맵', fields: { lead: 'str?', phases: { list: [2, 4], of: { name: 'str', status: 'str?', items: { list: [1, 5], of: 'str' } } }, footer: { obj: { from: 'str', to: 'str' }, optional: true } },
    async render(x, d) {
      const top = x.header(), n = d.phases.length, gap = 24, w = (CW - gap * (n - 1)) / n;
      d.phases.forEach((p, i) => {
        const cx = L + i * (w + gap), gray = !p.status || badgeTone(p.status) === 'gray';
        x.rect(cx, top, w, 4, gray ? C.muted : C.accent, gray ? 60 : 0);
        x.text(`phases[${i}].name`, p.name, { x: cx, y: top + 36, w: w - 140, h: 50, size: 30, bold: true, color: C.strong, maxLines: 1, mult: 1 });
        if (p.status) x.badge(p.status, cx + textW(p.name, 30) + 16, top + 40);
        p.items.forEach((t, j) => x.text(`phases[${i}].items[${j}]`, t, {
          x: cx, y: top + 112 + j * 52, w: w - 24, h: 44, size: j === 0 ? 22.5 : 19.5, bold: j === 0, color: j === 0 ? C.strong : C.body, maxLines: 1, mult: 1,
        }));
      });
      if (d.footer) {
        const fy = BOTTOM - 89, lw = (n - 1) * (w + gap) - gap;
        x.card(L, fy, lw, 89, 'fill', 16);
        x.text('footer.from', d.footer.from, { x: L + 36, y: fy, w: lw - 72, h: 89, size: 21, bold: true, color: C.strong, valign: 'middle', maxLines: 1, mult: 1 });
        const rx = L + lw + gap, rw = R - rx;
        x.card(rx, fy, rw, 89, 'tint', 16);
        x.text('footer.to', d.footer.to, { x: rx + 36, y: fy, w: rw - 72, h: 89, size: 21, bold: true, color: C.accentDeep, valign: 'middle', maxLines: 1, mult: 1 });
      }
    },
  },

  closing: {
    name: '마무리 (핵심 효과)', fields: { stats: { list: [2, 3], of: { label: 'str', value: 'str', sub: 'str?' } }, points: { list: [0, 3], of: 'str', optional: true } },
    async render(x, d) {
      x.slide.background = { color: C.accent };
      x.header({ lead: false, dark: true });
      const n = d.stats.length, gap = 12, w = (CW - gap * (n - 1)) / n;
      d.stats.forEach((s, i) => {
        const cx = L + i * (w + gap);
        x.text(`stats[${i}].label`, s.label, { x: cx, y: 305, w: w - 24, h: 37, size: 21, bold: true, color: C.white, maxLines: 1, mult: 1 });
        x.text(`stats[${i}].value`, s.value, { x: cx, y: 352, w: w - 24, h: 140, size: 102, bold: true, color: C.white, maxLines: 1, mult: 1 });
        x.text(`stats[${i}].sub`, s.sub, { x: cx, y: 506, w: w - 24, h: 38, size: 21, color: C.white, maxLines: 1, mult: 1 });
      });
      if (d.points && d.points.length) {
        x.rect(L, 869, CW, 1, C.white, 60);
        d.points.forEach((p, i) => x.text(`points[${i}]`, p, { x: L + i * (w + gap), y: 906, w: w - 48, h: 94, size: 22.5, bold: true, color: C.white, maxLines: 2 }));
      }
    },
  },
};

// ─── 스키마 검사 ─────────────────────────────────────────────────────────────
const COMMON = { layout: 'str', section: 'str', title: 'str', message: 'str', notes: 'str', source: 'str?' };
function validate(val, spec, p, errs) {
  if (typeof spec === 'string') {
    const opt = spec.endsWith('?'), t = spec.replace('?', '');
    if (val == null || val === '') { if (!opt) errs.push(`${p}: 필수 항목 누락`); return; }
    if (typeof val !== 'string' && typeof val !== 'number') return errs.push(`${p}: 문자열이어야 합니다`);
    if (t === 'icon' && !iconExists(val)) errs.push(`${p}: 없는 아이콘 "${val}" (lucide.dev/icons)`);
    return;
  }
  if (spec.list) {
    if (val == null) { if (!spec.optional) errs.push(`${p}: 필수 목록 누락`); return; }
    if (!Array.isArray(val)) return errs.push(`${p}: 목록이어야 합니다`);
    const [a, b] = spec.list;
    if (val.length < a || val.length > b) errs.push(`${p}: ${a}~${b}개여야 합니다 (현재 ${val.length}개)`);
    val.forEach((v, i) => validate(v, spec.of, `${p}[${i}]`, errs));
    return;
  }
  const fields = spec.obj || spec;
  if (val == null) { if (!spec.optional) errs.push(`${p}: 필수 항목 누락`); return; }
  if (typeof val !== 'object' || Array.isArray(val)) return errs.push(`${p}: 항목(key: value)이어야 합니다`);
  for (const k of Object.keys(val)) {
    if (k in fields) continue;
    const hint = /[\s.가-힣]/.test(k) ? ' — { } 안의 값에 쉼표가 있으면 "따옴표"로 감싸세요' : '';
    errs.push(`${p ? `${p}.` : ''}${k}: 이 형태에서 쓰지 않는 항목${hint}`);
  }
  for (const [k, s] of Object.entries(fields)) validate(val[k], s, p ? `${p}.${k}` : k, errs);
}

// ─── 기획안 파싱 / 동기화 ────────────────────────────────────────────────────
const H_OVERVIEW = '## 2. 구성 한눈에 보기';
const H_DETAIL = '## 3. 슬라이드 상세';

function parsePlan(file) {
  const src = fs.readFileSync(file, 'utf8');
  const di = src.indexOf(H_DETAIL);
  if (di < 0) throw new Error(`"${H_DETAIL}" 제목을 찾을 수 없습니다 (references/plan-format.md 형식 확인)`);
  const blocks = [...src.slice(di).matchAll(/```yaml\n([\s\S]*?)```/g)].map((m) => m[1]);
  const slides = blocks.map((raw, i) => {
    let d;
    try { d = yaml.load(raw) || {}; } catch (e) { d = { _yamlError: e.message.split('\n')[0] }; }
    return { ...d, _raw: raw, _no: String(i + 1).padStart(2, '0') };
  });
  const sec = [];
  for (const d of slides) {
    if (d.layout === 'cover' || !d.section) continue;
    if (!sec.includes(d.section)) sec.push(d.section);
    d._sec = String(sec.indexOf(d.section) + 1).padStart(2, '0');
  }
  return { src, slides };
}

function checkSchema(slides) {
  const errors = [];
  for (const d of slides) {
    const tag = `S${d._no} [${d.layout || '?'}]`;
    if (d._yamlError) { errors.push(`${tag} YAML 문법 오류: ${d._yamlError}`); continue; }
    const lay = LAYOUTS[d.layout];
    if (!lay) { errors.push(`${tag} layout: 알 수 없는 형태 "${d.layout}" (사용 가능: ${Object.keys(LAYOUTS).join(', ')})`); continue; }
    const common = { ...COMMON };
    if (lay.noSection) delete common.section;
    const e = [];
    validate(Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith('_'))), { ...common, ...lay.fields }, '', e);
    errors.push(...e.map((m) => `${tag} ${m}`));
  }
  return errors;
}

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
function syncPlan(file, { src, slides }) {
  const table = ['| # | 섹션 | 제목 | 형태 | 핵심 메시지 |', '|---|---|---|---|---|',
    ...slides.map((d) => `| ${d._no} | ${d.layout === 'cover' ? '표지' : cell(`${d._sec || ''} ${d.section || ''}`.trim())} | ${cell(plain(d.title || ''))} | ${cell(LAYOUTS[d.layout]?.name || d.layout)} | ${cell(d.message)} |`)].join('\n');
  const detail = slides.map((d) => `### ${d._no} · ${plain(d.title || '(제목 없음)')}\n\n\`\`\`yaml\n${d._raw.replace(/\n*$/, '\n')}\`\`\``).join('\n\n');
  const oi = src.indexOf(H_OVERVIEW), di = src.indexOf(H_DETAIL);
  if (oi < 0 || oi > di) throw new Error(`"${H_OVERVIEW}" 제목이 "${H_DETAIL}" 앞에 있어야 합니다`);
  const out = `${src.slice(0, oi)}${H_OVERVIEW}\n\n${table}\n\n${H_DETAIL}\n\n${detail}\n`;
  // 개요의 분량 줄 갱신: "| 분량 | ... |"
  const final = out.replace(/^\| 분량 \|.*\|$/m, `| 분량 | ${slides.length}장 · 약 ${Math.round(slides.length * 1.5)}분 |`);
  if (final !== src) fs.writeFileSync(file, final);
}

async function render(planFile, { write, out, force }) {
  const plan = parsePlan(planFile);
  const report = { errors: checkSchema(plan.slides), warnings: [] };
  const colorRow = plan.src.match(/^\| 색상 \|\s*(.*?)\s*\|$/m);
  const theme = resolveAccent(colorRow && colorRow[1]);
  if (theme.error) report.errors.push(`개요 색상: ${theme.error}`);
  else Object.assign(C, theme);
  if (report.errors.length === 0) {
    const pres = new pptxgen();
    pres.defineLayout({ name: 'DECK', width: 20, height: 11.25 });
    pres.layout = 'DECK';
    pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
    const titleSlide = plan.slides.find((s) => s.layout === 'cover');
    pres.title = titleSlide ? plain(titleSlide.title) : path.basename(planFile, '.md');
    for (const d of plan.slides) {
      d._base = path.dirname(path.resolve(planFile));
      const slide = pres.addSlide();
      slide.background = { color: C.white };
      const ctx = new Ctx(pres, slide, d, report);
      await LAYOUTS[d.layout].render(ctx, d);
      // 출처·근거 (선택): 하단에 작게, 눈에 덜 띄게
      if (d.source) ctx.text('source', d.source, { x: L, y: 1032, w: CW, h: 26, size: 12, color: d.layout === 'closing' ? C.tint : 'A3A5AB', maxLines: 1, mult: 1 });
      slide.addNotes(String(d.notes).trim());
    }
    if (write && (report.errors.length === 0 || force)) await pres.writeFile({ fileName: out });
  }
  syncPlan(planFile, plan);
  return { report, count: plan.slides.length };
}

function printReport({ report, count }) {
  console.log(`슬라이드 ${count}장`);
  for (const w of report.warnings) console.log(`  ⚠ ${w}`);
  for (const e of report.errors) console.log(`  ✖ ${e}`);
  console.log(report.errors.length ? `오류 ${report.errors.length}건 — 기획안을 고친 뒤 다시 실행하세요` : '✔ 검사 통과');
}

function renderImages(pptx) {
  const abs = path.resolve(pptx), dir = path.dirname(abs), base = path.basename(abs, '.pptx');
  const outDir = path.join(dir, `${base}_preview`);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  // Homebrew LibreOffice는 fontconfig만 보므로 macOS 글꼴 폴더(Pretendard 포함)를 직접 알려준다
  const env = { ...process.env, FONTCONFIG_FILE: path.join(__dirname, 'fontconfig/fonts.conf') };
  const profile = `file://${path.join(require('os').tmpdir(), 'deck-lo-profile')}`;
  execFileSync('soffice', [`-env:UserInstallation=${profile}`, '--headless', '--convert-to', 'pdf', '--outdir', outDir, abs], { stdio: 'ignore', env });
  execFileSync('pdftoppm', ['-jpeg', '-r', '60', path.join(outDir, `${base}.pdf`), path.join(outDir, 'slide')]);
  const files = fs.readdirSync(outDir).filter((f) => f.startsWith('slide')).sort().map((f) => path.join(outDir, f));
  return { outDir, files };
}

async function makeGrid(files, out) {
  const cols = 4, tw = 600, th = 338, pad = 12, rows = Math.ceil(files.length / cols);
  const comps = await Promise.all(files.map(async (f, i) => ({
    input: await sharp(f).resize(tw, th).toBuffer(), left: pad + (i % cols) * (tw + pad), top: pad + Math.floor(i / cols) * (th + pad),
  })));
  await sharp({ create: { width: cols * (tw + pad) + pad, height: rows * (th + pad) + pad, channels: 3, background: '#9a9ca3' } }).composite(comps).jpeg().toFile(out);
}

// ─── CLI ─────────────────────────────────────────────────────────────────────
(async () => {
  const [cmd, file, ...rest] = process.argv.slice(2);
  const opt = (k) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : null; };
  try {
    if (cmd === 'layouts') {
      for (const [k, v] of Object.entries(LAYOUTS)) console.log(`${k.padEnd(14)} ${v.name}`);
    } else if (cmd === 'check' && file) {
      const r = await render(file, { write: false });
      printReport(r);
      process.exit(r.report.errors.length ? 1 : 0);
    } else if (cmd === 'build' && file) {
      const out = opt('-o') || file.replace(/(\.plan)?\.md$/, '.pptx');
      const r = await render(file, { write: true, out, force: rest.includes('--force') });
      printReport(r);
      if (r.report.errors.length && !rest.includes('--force')) process.exit(1);
      console.log(`→ ${path.resolve(out)}`);
    } else if (cmd === 'render' && file) {
      const { outDir, files } = renderImages(file);
      const grid = path.join(outDir, 'grid.jpg');
      await makeGrid(files, grid);
      console.log(`이미지 ${files.length}장 → ${outDir}\n그리드 → ${grid}`);
    } else {
      console.log('사용법: node deck.js check|build <plan.md> [-o out.pptx] [--force] | render <deck.pptx> | layouts');
      process.exit(2);
    }
  } catch (e) {
    console.error(`✖ ${e.message}`);
    process.exit(1);
  }
})();
