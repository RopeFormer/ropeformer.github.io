/* Animated figures: architecture (Fig. 1), Rope_Swing results (Fig. 3), Rope_Twirl results (Fig. 4).
   Data: hcrm-paper/evidence/experiments-20260910 (summary.csv, per_trial.csv, wave_stiffness.csv). */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = { txl1: '#E39237', txl6: '#A85F1E', mlp1: '#C9C7C2', mlp6: '#8A8782', ink: '#141413', ink3: '#5f5a52', grid: '#e6e2da', paper: '#ffffff', accent: '#ff8a4c', kv: '#f5d9b8', kvline: '#e0b98a', grey: '#d9d6d0', greyline: '#a39c90' };
  const FONT = "'IBM Plex Sans', system-ui, sans-serif";
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const text = (parent, x, y, s, attrs) => { const t = el('text', Object.assign({ x, y, 'font-family': FONT, 'font-size': 12, fill: C.ink }, attrs), parent); t.textContent = s; return t; };
  const ease = 'cubic-bezier(.2,.7,.2,1)';
  const anim = (n, frames, opt) => n.animate(frames, Object.assign({ fill: 'forwards', easing: ease }, opt));

  // ------------------------------------------------------------------ data
  const swing = {
    trials: [1, 2, 3, 4, 5],
    retained: { txl1: [7.387, 4.980, 4.730, 4.883, 4.977], txl6: [5.643, 4.719, 4.239, 4.046, 4.341], mlp1: [9.699, 9.699, 9.699, 9.699, 9.699], mlp6: [9.321, 9.321, 9.321, 9.321, 9.321] },
    reset: { txl1: 7.387, txl6: 5.643, mlp1: 9.699, mlp6: 9.321 },
    success: { txl1: [48.2, 79.8], txl6: [74.7, 77.7], mlp1: [14.1, 14.1], mlp6: [28.6, 28.6] }
  };
  const twirl = {
    groups: ['L', 'M', 'H'],
    configs: [
      { key: 'txl1', name: 'TXL-1', reset: [5.224, 4.672, 7.481], retain: [3.673, 3.486, 7.688] },
      { key: 'txl6', name: 'TXL-6', reset: [2.778, 3.444, 6.272], retain: [2.840, 3.333, 5.486] },
      { key: 'mlp1', name: 'MLP-1', reset: [3.381, 3.126, 6.744], retain: [3.381, 3.126, 6.744] },
      { key: 'mlp6', name: 'MLP-6', reset: [1.864, 3.146, 7.360], retain: [1.864, 3.147, 7.360] }
    ]
  };
  const NAMES = { txl1: 'TXL-1', txl6: 'TXL-6', mlp1: 'MLP-1', mlp6: 'MLP-6' };

  // ------------------------------------------------------------------ Fig. 3: Rope_Swing
  function buildSwing(root) {
    const W = 420, H = 470; const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img', 'aria-label': 'Rope Swing: acquisition time per trial and trial 2 to 5 success rate' }, root);
    const plays = [];
    // ---- (a) line chart
    const a = { x: 56, y: 36, w: 340, h: 160 };
    text(svg, a.x, 20, '(a) Acquisition time', { 'font-weight': 600, 'font-size': 14 });
    const xs = t => a.x + (t - 1) / 4 * a.w, ys = v => a.y + a.h - v / 10 * a.h;
    for (let v = 0; v <= 10; v += 2) { el('line', { x1: a.x, x2: a.x + a.w, y1: ys(v), y2: ys(v), stroke: C.grid }, svg); text(svg, a.x - 8, ys(v) + 4, v, { 'text-anchor': 'end', fill: C.ink3 }); }
    for (const t of swing.trials) text(svg, xs(t), a.y + a.h + 18, t, { 'text-anchor': 'middle', fill: C.ink3 });
    text(svg, a.x + a.w / 2, a.y + a.h + 36, 'Trial', { 'text-anchor': 'middle', fill: C.ink3 });
    text(svg, 14, a.y + a.h / 2, 'Mean capped (s)', { 'text-anchor': 'middle', fill: C.ink3, transform: `rotate(-90 14 ${a.y + a.h / 2})` });
    const order = ['mlp1', 'mlp6', 'txl6', 'txl1'];
    for (const k of order) {
      const col = C[k], sq = k.endsWith('6');
      // reset (dashed, open markers)
      const r = swing.reset[k];
      const rl = el('line', { x1: xs(1), x2: xs(5), y1: ys(r), y2: ys(r), stroke: col, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: 0 }, svg);
      const rm = swing.trials.map(t => marker(svg, xs(t), ys(r), sq, col, false));
      // retained (solid path, filled markers)
      const pts = swing.retained[k].map((v, i) => [xs(i + 1), ys(v)]);
      const p = el('path', { d: 'M' + pts.map(q => q.join(',')).join('L'), fill: 'none', stroke: col, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, svg);
      const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      const pm = pts.map(q => marker(svg, q[0], q[1], sq, col, true));
      plays.push(() => {
        anim(rl, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200 });
        rm.forEach((m, i) => anim(m, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 300 + i * 120 }));
        p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 1800, delay: 500, easing: 'linear', fill: 'forwards' });
        pm.forEach((m, i) => anim(m, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 320, delay: 500 + i * 450 }));
      });
      const reset0 = () => { rl.style.opacity = 0; rm.forEach(m => m.style.opacity = 0); p.style.strokeDashoffset = L; pm.forEach(m => m.style.opacity = 0); };
      plays.push({ reset: reset0 }); reset0();
    }
    // legend
    const lg = el('g', { transform: `translate(${a.x + 40} ${a.y + a.h - 30})` }, svg);
    [['txl1', 0, 0, false], ['txl6', 170, 0, true], ['mlp1', 0, 20, false], ['mlp6', 170, 20, true]].forEach(([k, x, y, sq]) => {
      el('line', { x1: x, x2: x + 26, y1: y, y2: y, stroke: C[k], 'stroke-width': 2.4 }, lg); marker(lg, x + 13, y, sq, C[k], true).style.opacity = 1;
      text(lg, x + 34, y + 4, NAMES[k], { fill: C[k], 'font-weight': 600 });
    });
    // ---- (b) bars
    const b = { x: 56, y: 262, w: 340, h: 150 };
    text(svg, b.x, 246, '(b) Success rate', { 'font-weight': 600, 'font-size': 14 });
    const yb = v => b.y + b.h - v / 100 * b.h;
    for (let v = 0; v <= 100; v += 50) { el('line', { x1: b.x, x2: b.x + b.w, y1: yb(v), y2: yb(v), stroke: C.grid }, svg); text(svg, b.x - 8, yb(v) + 4, v, { 'text-anchor': 'end', fill: C.ink3 }); }
    text(svg, 14, b.y + b.h / 2, 'Success (%)', { 'text-anchor': 'middle', fill: C.ink3, transform: `rotate(-90 14 ${b.y + b.h / 2})` });
    const keys = ['txl1', 'txl6', 'mlp1', 'mlp6'], gw = b.w / 4, bw = 26;
    keys.forEach((k, gi) => {
      const cx = b.x + gw * gi + gw / 2, [rs, rt] = swing.success[k];
      const x1 = cx - bw - 3, x2 = cx + 3;
      const r1 = el('rect', { x: x1, y: yb(rs), width: bw, height: b.h - (yb(rs) - b.y), fill: 'none', stroke: C[k], 'stroke-width': 2 }, svg);
      const r2 = el('rect', { x: x2, y: yb(rt), width: bw, height: b.h - (yb(rt) - b.y), fill: C[k] }, svg);
      [r1, r2].forEach(r => { r.style.transformOrigin = `${cx}px ${b.y + b.h}px`; r.style.transform = 'scaleY(0)'; });
      const t1 = text(svg, x1 + bw / 2, yb(rs) - 6, rs.toFixed(1), { 'text-anchor': 'middle', 'font-size': 11, fill: C.ink3 });
      const t2 = text(svg, x2 + bw / 2, yb(rt) - 6, rt.toFixed(1), { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600 });
      text(svg, cx, b.y + b.h + 18, NAMES[k], { 'text-anchor': 'middle', fill: C[k], 'font-weight': 600 });
      const d = rt - rs; let dl = null, br = null;
      if (d > 0.05) {
        const y = yb(Math.max(rs, rt)) - 20;
        br = el('path', { d: `M${x1 + 2} ${y + 8} V${y} H${x2 + bw - 2} V${y + 8}`, fill: 'none', stroke: C.ink, 'stroke-width': 1.2 }, svg);
        dl = text(svg, cx, y - 5, `+${d.toFixed(1)} pp`, { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600 });
      }
      const late = [t1, t2, dl, br].filter(Boolean);
      plays.push(() => {
        anim(r1, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 700, delay: 2500 + gi * 120 });
        anim(r2, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 700, delay: 2700 + gi * 120 });
        late.forEach(n => anim(n, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 3400 + gi * 120 }));
      });
      plays.push({ reset: () => { r1.style.transform = 'scaleY(0)'; r2.style.transform = 'scaleY(0)'; late.forEach(n => n.style.opacity = 0); } });
      late.forEach(n => n.style.opacity = 0);
    });
    const lg2 = el('g', { transform: `translate(${b.x + 70} ${b.y + b.h + 44})` }, svg);
    el('rect', { x: 0, y: -9, width: 14, height: 12, fill: 'none', stroke: C.ink3, 'stroke-width': 1.5 }, lg2); text(lg2, 20, 2, 'Reset', { fill: C.ink3, 'font-weight': 600 });
    el('rect', { x: 110, y: -9, width: 14, height: 12, fill: C.ink3 }, lg2); text(lg2, 130, 2, 'Retained', { fill: C.ink3, 'font-weight': 600 });
    return mkController(plays, 4600);
  }
  function marker(parent, x, y, square, col, filled) {
    const m = square ? el('rect', { x: x - 4, y: y - 4, width: 8, height: 8 }, parent) : el('circle', { cx: x, cy: y, r: 4.2 }, parent);
    m.setAttribute('fill', filled ? col : C.paper); m.setAttribute('stroke', col); m.setAttribute('stroke-width', 2);
    m.style.transformOrigin = `${x}px ${y}px`; m.style.opacity = 0; return m;
  }

  // ------------------------------------------------------------------ Fig. 4: Rope_Twirl
  function buildTwirl(root) {
    const W = 420, H = 320; const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img', 'aria-label': 'Rope Twirl: trial 2 to 5 mean acquisition time by stiffness group, reset versus retained' }, root);
    const plays = [];
    text(svg, W / 2, 20, 'Mean capped acquisition time (s)  ↓', { 'text-anchor': 'middle', 'font-weight': 600, 'font-size': 14 });
    const lg = el('g', { transform: 'translate(120 34)' }, svg);
    el('rect', { x: 0, y: 0, width: 14, height: 12, fill: 'none', stroke: C.greyline, 'stroke-width': 1.5 }, lg); text(lg, 20, 10, 'Reset (KV cleared)', { fill: C.ink3, 'font-weight': 600 });
    el('rect', { x: 150, y: 0, width: 14, height: 12, fill: C.txl1 }, lg); text(lg, 170, 10, 'Retained (KV kept)', { fill: C.ink3, 'font-weight': 600 });
    const p = { x: 40, y: 64, w: 366, h: 180 }; const yv = v => p.y + p.h - v / 8 * p.h;
    for (let v = 0; v <= 8; v += 2) { el('line', { x1: p.x, x2: p.x + p.w, y1: yv(v), y2: yv(v), stroke: C.grid }, svg); text(svg, p.x - 8, yv(v) + 4, v, { 'text-anchor': 'end', fill: C.ink3 }); }
    const gw = p.w / 4, bw = 18, gap = 6;
    twirl.configs.forEach((c, ci) => {
      const gx = p.x + gw * ci + (gw - (3 * bw + 2 * gap)) / 2;
      twirl.groups.forEach((g, gi) => {
        const x = gx + gi * (bw + gap), rs = c.reset[gi], rt = c.retain[gi];
        // grey outline = reset (grows first)
        const o = el('rect', { x, y: yv(rs), width: bw, height: p.h - (yv(rs) - p.y), fill: C.grey, stroke: C.greyline, 'stroke-width': 1.2 }, svg);
        // colored fill = retained (rises inside, replaces the grey)
        const f = el('rect', { x, y: yv(rt), width: bw, height: p.h - (yv(rt) - p.y), fill: C[c.key], opacity: c.key.startsWith('mlp') ? 0.9 : 1 }, svg);
        [o, f].forEach(r => { r.style.transformOrigin = `${x}px ${p.y + p.h}px`; r.style.transform = 'scaleY(0)'; });
        text(svg, x + bw / 2, p.y + p.h + 16, g, { 'text-anchor': 'middle', fill: C.ink3, 'font-weight': 600 });
        const d = rt - rs; const isTxl = c.key.startsWith('txl');
        const lab = text(svg, x + bw / 2, yv(Math.max(rs, rt)) - 6, isTxl ? (d > 0 ? '+' : '−') + Math.abs(d).toFixed(2) : (gi === 1 ? 'Δ≈0' : ''), { 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 600, fill: isTxl ? (d < 0 ? C.ink : '#b03a2e') : C.ink3 });
        lab.style.opacity = 0;
        plays.push(() => {
          anim(o, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 600, delay: 100 + ci * 150 + gi * 60 });
          anim(f, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 800, delay: 1400 + ci * 150 + gi * 60 });
          anim(lab, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 2500 + ci * 150 + gi * 60 });
        });
        plays.push({ reset: () => { o.style.transform = 'scaleY(0)'; f.style.transform = 'scaleY(0)'; lab.style.opacity = 0; } });
      });
      el('line', { x1: gx, x2: gx + 3 * bw + 2 * gap, y1: p.y + p.h + 28, y2: p.y + p.h + 28, stroke: C.grid }, svg);
      text(svg, gx + (3 * bw + 2 * gap) / 2, p.y + p.h + 46, c.name, { 'text-anchor': 'middle', fill: C[c.key], 'font-weight': 700, 'font-size': 13 });
    });
    text(svg, W / 2, H - 8, 'L low · M middle · H high bending stiffness (128 ropes each)', { 'text-anchor': 'middle', fill: C.ink3, 'font-size': 11 });
    return mkController(plays, 3600);
  }

  // ------------------------------------------------------------------ Fig. 1: architecture, looping
  function buildArch(root) {
    const W = 900, H = 420; const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img', 'aria-label': 'RopeFormer streaming inference: one observation token flows through six Transformer-XL blocks, each reading and appending a layer-specific KV cache' }, root);
    const box = (x, y, w, h, label, sub, opts) => { const o = Object.assign({ fill: '#fff', stroke: '#8c8781', r: 8, fs: 13, bold: 600 }, opts); const g = el('g', {}, svg); el('rect', { x, y, width: w, height: h, rx: o.r, fill: o.fill, stroke: o.stroke, 'stroke-width': 1.4 }, g); text(g, x + w / 2, y + h / 2 + (sub ? -3 : 5), label, { 'text-anchor': 'middle', 'font-size': o.fs, 'font-weight': o.bold }); if (sub) text(g, x + w / 2, y + h / 2 + 13, sub, { 'text-anchor': 'middle', 'font-size': 11, fill: C.ink3 }); return g; };
    const arrow = (x1, y1, x2, y2, col) => el('line', { x1, y1, x2, y2, stroke: col || C.ink, 'stroke-width': 1.5, 'marker-end': col === C.accent ? 'url(#ah-o)' : 'url(#ah)' }, svg);
    const defs = el('defs', {}, svg);
    [['ah', C.ink], ['ah-o', C.accent]].forEach(([id, col]) => { const m = el('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs); el('path', { d: 'M0,0 L10,5 L0,10 z', fill: col }, m); });

    // ---- top row
    const ty = 130, bh = 52;
    text(svg, 58, ty - 14, 'Observation', { 'font-weight': 600, 'text-anchor': 'middle' });
    box(24, ty, 68, bh, 'oₜ', null, { fs: 16, bold: 700 });
    arrow(92, ty + bh / 2, 128, ty + bh / 2);
    box(130, ty, 92, bh, 'Embedding');
    arrow(222, ty + bh / 2, 254, ty + bh / 2);
    el('rect', { x: 256, y: ty - 12, width: 458, height: bh + 24, rx: 12, fill: '#fbf1e4', stroke: '#e6c9a5' }, svg);
    const blocks = [], kvs = [], reads = [], appends = [];
    for (let i = 0; i < 6; i++) {
      const x = 268 + i * 75;
      blocks.push(box(x, ty, 58, bh, 'B' + (i + 1), null, { fill: '#f7dcbf', stroke: '#d9a06a', fs: 15, bold: 700 }));
      if (i < 5) arrow(x + 58, ty + bh / 2, x + 75, ty + bh / 2);
      kvs.push(box(x + 4, 40, 50, 34, 'KV ' + (i + 1), null, { fill: '#f7dcbf', stroke: '#d9a06a', fs: 12 }));
      reads.push(arrow(x + 22, 74, x + 22, ty - 1));
      appends.push(arrow(x + 36, ty - 1, x + 36, 74, C.accent));
    }
    el('rect', { x: 260, y: 26, width: 450, height: 56, rx: 10, fill: 'none', stroke: '#c9c2b5' }, svg);
    text(svg, 270, 20, 'Layer-specific KV caches', { 'font-weight': 600 });
    arrow(714, ty + bh / 2, 748, ty + bh / 2);
    box(750, ty, 76, bh, 'Actor', 'head');
    arrow(826, ty + bh / 2, 858, ty + bh / 2);
    text(svg, 878, ty + bh / 2 + 6, 'aₜ', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
    // legend
    arrow(760, 40, 760, 60); text(svg, 772, 54, 'Read', { 'font-size': 12 });
    arrow(760, 78, 760, 68, C.accent); text(svg, 772, 78, 'Append', { 'font-size': 12 });

    // ---- moving token
    const tok = el('circle', { cx: 58, cy: ty + bh / 2, r: 7, fill: C.accent, stroke: '#fff', 'stroke-width': 2 }, svg); tok.style.opacity = 0;
    const out = el('circle', { cx: 878, cy: ty + bh / 2, r: 7, fill: C.ink, stroke: '#fff', 'stroke-width': 2 }, svg); out.style.opacity = 0;

    // ---- bottom: inside one block
    const by = 236;
    el('path', { d: `M${268 + 2 * 75} ${ty + bh + 12} L20 ${by} L880 ${by} L${268 + 2 * 75 + 58} ${ty + bh + 12} Z`, fill: '#f1efea' }, svg);
    el('rect', { x: 20, y: by, width: 860, height: 160, rx: 12, fill: '#f1efea' }, svg);
    text(svg, 36, by + 24, 'Within each block', { 'font-weight': 600 });
    text(svg, 864, by + 24, 'Segment length: 128', { 'font-weight': 600, 'text-anchor': 'end' });
    box(36, by + 56, 120, 56, 'Layer input', '→ Q, K, V');
    // KV mem / cur
    const memX = 230, curX = 400, cy = by + 56, cw = 150, ch = 62;
    el('rect', { x: memX, y: cy, width: cw, height: ch, rx: 8, fill: '#d9d6d0', stroke: '#a39c90' }, svg);
    text(svg, memX + cw / 2, cy + 18, 'KV mem', { 'text-anchor': 'middle', 'font-weight': 600 }); text(svg, memX + cw / 2, cy + 32, '128 tokens', { 'text-anchor': 'middle', 'font-size': 11, fill: C.ink3 });
    text(svg, memX + cw + 12, cy + ch / 2 + 5, '||', { 'font-weight': 700, 'font-size': 14 });
    el('rect', { x: curX, y: cy, width: cw, height: ch, rx: 8, fill: '#fbf1e4', stroke: '#e6c9a5' }, svg);
    text(svg, curX + cw / 2, cy + 18, 'KV cur', { 'text-anchor': 'middle', 'font-weight': 600 }); text(svg, curX + cw / 2, cy + 32, '0–128 tokens', { 'text-anchor': 'middle', 'font-size': 11, fill: C.ink3 });
    const NC = 8, cellW = 14, cellGap = 3, cells0 = (cw - (NC * cellW + (NC - 1) * cellGap)) / 2;
    const memCells = [], curCells = [];
    for (let i = 0; i < NC; i++) {
      memCells.push(el('rect', { x: memX + cells0 + i * (cellW + cellGap), y: cy + 42, width: cellW, height: 9, rx: 2, fill: '#8a8782' }, svg));
      curCells.push(el('rect', { x: curX + cells0 + i * (cellW + cellGap), y: cy + 42, width: cellW, height: 9, rx: 2, fill: '#fff', stroke: '#e0b98a' }, svg));
    }
    // arrows
    arrow(156, cy + ch / 2, 226, cy + ch / 2);
    const qPath = el('path', { d: `M156 ${cy + 14} H190 V${by + 36} H700 V${cy + 24}`, fill: 'none', stroke: C.ink, 'stroke-width': 1.5, 'marker-end': 'url(#ah)' }, svg);
    text(svg, 440, by + 32, 'Q', { 'font-weight': 700, 'text-anchor': 'middle' });
    box(640, cy, 130, ch, 'Attention', 'episode mask', { fill: '#f7dcbf', stroke: '#d9a06a' });
    arrow(770, cy + ch / 2, 850, cy + ch / 2);
    arrow(550, cy + ch / 2, 636, cy + ch / 2);
    const appendPath = el('path', { d: `M96 ${cy + 56} V${cy + 100} H${curX + cw / 2} V${cy + ch + 2}`, fill: 'none', stroke: C.accent, 'stroke-width': 1.5, 'marker-end': 'url(#ah-o)' }, svg);
    text(svg, 250, cy + 116, 'Append K/V', { fill: '#b4531f', 'font-weight': 600, 'font-size': 12 });
    const rolloverArrow = el('path', { d: `M${curX + 10} ${cy - 8} H${memX + cw / 2} V${cy - 2}`, fill: 'none', stroke: '#8a8782', 'stroke-width': 1.5, 'stroke-dasharray': '4 3', 'marker-end': 'url(#ah)' }, svg); rolloverArrow.style.opacity = 0;
    const rolloverTxt = text(svg, (curX + memX + cw) / 2, cy - 12, 'segment full → becomes KV mem', { 'text-anchor': 'middle', 'font-size': 11, fill: C.ink3 }); rolloverTxt.style.opacity = 0;

    // ---- the loop: one token per ~1.6 s, rollover after NC tokens
    let step = 0, timer = null, running = false;
    const pulse = (n, col) => { const r = n.querySelector('rect'); if (r) r.animate([{ fill: col || '#f7dcbf' }, { fill: C.accent, stroke: C.accent }, { fill: col || '#f7dcbf' }], { duration: 500, easing: 'ease-out' }); };
    const flash = (line, col) => line.animate([{ strokeWidth: 1.5, opacity: 1 }, { strokeWidth: 3, opacity: 1 }, { strokeWidth: 1.5, opacity: 1 }], { duration: 420, easing: 'ease-out' });
    async function tick() {
      if (!running) return;
      const yC = ty + bh / 2;
      tok.style.opacity = 1;
      tok.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(118px,0)' }], { duration: 380, easing: 'linear', fill: 'forwards' });
      await wait(400);
      for (let i = 0; i < 6; i++) {
        const dx = 268 + i * 75 + 29 - 58;
        tok.animate([{ transform: `translate(${dx - 30}px,0)` }, { transform: `translate(${dx}px,0)` }], { duration: 160, easing: 'linear', fill: 'forwards' });
        await wait(160);
        pulse(blocks[i]); pulse(kvs[i]); flash(reads[i]); flash(appends[i]);
        if (i === 2) { // mirror the expanded view: Q reads mem+cur, K/V appended
          flash(qPath); flash(appendPath);
          const c = curCells[step % NC]; c.animate([{ fill: '#fff' }, { fill: C.accent }], { duration: 300, fill: 'forwards' });
        }
        await wait(120);
      }
      tok.animate([{ transform: 'translate(645px,0)' }, { transform: 'translate(730px,0)' }], { duration: 260, easing: 'linear', fill: 'forwards' });
      await wait(260);
      tok.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' });
      out.animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }, { opacity: 0 }], { duration: 700, easing: 'ease-out' });
      step++;
      if (step % NC === 0) { // segment rollover
        rolloverArrow.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 1 }, { opacity: 0 }], { duration: 1400 });
        rolloverTxt.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 1 }, { opacity: 0 }], { duration: 1400 });
        await wait(500);
        memCells.forEach(m => m.animate([{ fill: '#8a8782' }, { fill: C.accent }, { fill: '#8a8782' }], { duration: 700 }));
        curCells.forEach(c => c.animate([{ fill: C.accent }, { fill: '#fff' }], { duration: 500, fill: 'forwards' }));
        await wait(700);
      }
      timer = setTimeout(tick, 500);
    }
    const wait = ms => new Promise(r => setTimeout(r, ms));
    return {
      play() { if (running || reduce) return; running = true; tick(); },
      stop() { running = false; clearTimeout(timer); },
      replay() { this.stop(); step = 0; curCells.forEach(c => c.setAttribute('fill', '#fff')); this.play(); }
    };
  }

  function mkController(plays, total) {
    const fns = plays.filter(p => typeof p === 'function'), resets = plays.filter(p => p && p.reset).map(p => p.reset);
    return {
      play() { if (reduce) { /* show final state */ document.getAnimations && 0; } resets.forEach(r => r()); requestAnimationFrame(() => fns.forEach(f => f())); },
      stop() {},
      replay() { this.play(); }
    };
  }

  // ------------------------------------------------------------------ mount
  const builders = { swing: buildSwing, twirl: buildTwirl, arch: buildArch };
  document.querySelectorAll('[data-fig]').forEach(host => {
    const ctl = builders[host.dataset.fig](host);
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'replay'; btn.textContent = 'Replay'; btn.setAttribute('aria-label', 'Replay animation');
    btn.addEventListener('click', () => ctl.replay()); host.appendChild(btn);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) ctl.play(); else ctl.stop(); }), { threshold: 0.5 });
    io.observe(host);
  });
})();
