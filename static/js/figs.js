/* Animated paper figures.
   Fig. 1: the ropeformer-figures master (assets/pipeline.svg, named layers) inlined in the page and driven by layer ids.
   Fig. 3 / 4: the ropeformer-figures recipes (src/ropefig/results.py swing / twirl) ported 1:1 — same canvas, coordinates,
   sizes, palette and hatch — with the data from data/fig3|fig4/source-data.json, plus an entrance animation. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORS = ['#FF800E', '#C85200', '#CFCFCF', '#898989'], NAMES = ['TXL-1', 'TXL-6', 'MLP-1', 'MLP-6'], CONFIGS = ['txl_tip', 'txl_full', 'mlp_tip', 'mlp_full'];
  const FONT = "'DejaVu Sans Mono', Menlo, ui-monospace, monospace";
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const anim = (n, frames, opt) => n.animate(frames, Object.assign({ fill: 'forwards', easing: 'cubic-bezier(.2,.7,.2,1)' }, opt));
  let uid = 0;

  // ---- a port of ropefig.canvas.Canvas (top-left pt coordinates) ----
  function Canvas(w, h, root) {
    const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', role: 'img' }, root);
    const c = {
      svg,
      path(pts, col = '#000', width = 0.65, dash = false, fill = null) { return el('path', { d: 'M' + pts.map(p => p.join(',')).join('L'), fill: fill || 'none', stroke: col, 'stroke-width': width, 'stroke-dasharray': dash ? '2.2 1.6' : null, 'stroke-linecap': 'butt' }, svg); },
      rect(x, y, w, h, fill = null, col = '#000', width = 0.65) { return el('rect', { x, y, width: w, height: h, fill: fill || 'none', stroke: col || 'none', 'stroke-width': width }, svg); },
      text(x, y, s, size = 7.5, col = '#000', rot = 0, anchor = null) { const t = el('text', { x, y, 'font-family': FONT, 'font-weight': 700, 'font-size': size, fill: col, transform: rot ? `rotate(${rot} ${x} ${y})` : null, 'text-anchor': anchor }, svg); t.textContent = s; return t; },
      mid(x, y, s, size = 7.5, col = '#000') { return c.text(x, y, s, size, col, 0, 'middle'); },
      dot(x, y, col, r = 1.8, fill = null, width = 0.65) { return el('circle', { cx: x, cy: y, r, fill: fill || col, stroke: col, 'stroke-width': width }, svg); },
      marker(x, y, i, open = false, r = 1.8) { return i % 2 ? c.rect(x - r, y - r, 2 * r, 2 * r, open ? '#fff' : COLORS[i], COLORS[i]) : c.dot(x, y, COLORS[i], r, open ? '#fff' : COLORS[i]); },
      // hatch: 8 pt diagonal stride, black lines, as in canvas.py
      hatch(x, y, w, h, col, cross = false, line = 0.45, edge = '#000', edgeWidth = 0.7) {
        const g = el('g', {}, svg);
        el('rect', { x, y, width: w, height: h, fill: col }, g);
        for (let k = 8; k < w + h; k += 8) {
          const lo = Math.max(0, k - h), hi = Math.min(w, k);
          if (hi > lo) { el('path', { d: `M${x + lo},${y + k - lo}L${x + hi},${y + k - hi}`, stroke: '#000', 'stroke-width': line }, g); if (cross) el('path', { d: `M${x + lo},${y + h - k + lo}L${x + hi},${y + h - k + hi}`, stroke: '#000', 'stroke-width': line }, g); }
        }
        el('rect', { x, y, width: w, height: h, fill: 'none', stroke: edge, 'stroke-width': edgeWidth }, g);
        return g;
      }
    };
    return c;
  }
  // resets cancel any forwards-filled animation first, otherwise the finished state wins over the inline style on replay
  const stopAnims = n => n.getAnimations().forEach(a => a.cancel());
  const grow = (n, x, base) => { stopAnims(n); n.style.transformOrigin = `${x}px ${base}px`; n.style.transform = 'scaleY(0)'; };
  const hide = n => { stopAnims(n); n.style.opacity = 0; };

  // ------------------------------------------------------------------ Fig. 3 (results.py::swing)
  function buildSwing(root, d) {
    const p = Canvas(252, 264, root); p.svg.setAttribute('aria-label', 'Rope Swing: acquisition time per trial and trial 2 to 5 success rate');
    const seqs = [], resets = [];
    p.text(31, 13, '(a) Acquisition time', 9);
    const X = t => 31 + (t - 1) * 51.5, Y = t => 103 - t * 7.8;
    for (const v of [0, 2, 4, 6, 8, 10]) { p.path([[31, Y(v)], [237, Y(v)]], '#E5E9E8', 0.4); p.mid(23, Y(v) + 2.5, v); }
    p.path([[31, 24], [31, 103], [237, 103]]);
    for (let t = 1; t <= 5; t++) { p.mid(X(t), 114, t); p.path([[X(t), 103], [X(t), 106]]); }
    p.text(10, 88, 'Mean capped (s)', 7.5, '#000', -90);
    p.mid(134, 126, 'Trial', 8);
    // Lines grow trial by trial: point, segment, point, segment … Solid (retained) and dashed (reset) lines of all four
    // configurations are clipped by the same four interval rects, so they extend together at exactly the same rate.
    const cpId = 'cp' + (uid++), cp = el('clipPath', { id: cpId }, p.svg);
    const rects = [0, 1, 2, 3].map(j => el('rect', { x: X(j + 1), y: 0, width: 0, height: 264 }, cp));
    const marks = [[], [], [], [], []];                         // markers by trial, popped together
    const mark = (j, v, i, open) => { const m = p.marker(X(j + 1), Y(v), i, open); m.style.transformOrigin = `${X(j + 1)}px ${Y(v)}px`; marks[j].push(m); };
    CONFIGS.forEach((cfg, i) => {
      const row = d.swing[cfg];
      if (i < 2) { p.path(row.cleared.map((v, j) => [X(j + 1), Y(v)]), COLORS[i], 1.1, true).setAttribute('clip-path', `url(#${cpId})`); row.cleared.forEach((v, j) => mark(j, v, i, true)); }
      p.path(row.retained.map((v, j) => [X(j + 1), Y(v)]), COLORS[i], 1.1).setAttribute('clip-path', `url(#${cpId})`);
      row.retained.forEach((v, j) => mark(j, v, i, false));
    });
    const growRect = (r, w, ms) => new Promise(res => { const t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; r.setAttribute('width', w * e); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
    const resetLines = () => { rects.forEach(r => r.setAttribute('width', 0)); marks.flat().forEach(hide); };
    resetLines(); resets.push(resetLines);
    seqs.push(async () => {
      await wait(300);
      for (let j = 0; j < 5; j++) {                            // all points of trial j, then all segments to trial j+1
        marks[j].forEach(m => anim(m, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 200 }));
        if (j < 4) { await wait(100); await growRect(rects[j], 51.5, 260); await wait(30); }
      }
    });
    for (let i = 0; i < 4; i++) { const x = 54 + (i % 2) * 102, y = 82 + Math.floor(i / 2) * 12; p.path([[x, y], [x + 12, y]], COLORS[i], 1.1); p.marker(x + 6, y, i); p.text(x + 18, y + 2.4, NAMES[i], 7.5, COLORS[i]); }
    p.text(31, 144, '(b) Success rate', 9);
    const Yb = v => 222 - v * 0.64;
    for (const v of [0, 50, 100]) { p.path([[31, Yb(v)], [239, Yb(v)]], '#E5E9E8', 0.4); p.mid(20, Yb(v) + 2.5, v); }
    p.path([[31, 154], [31, 222], [239, 222]]);
    p.text(10, 203, 'Success (%)', 7.5, '#000', -90);
    d.success.forEach((row, i) => {
      const x = 51 + i * 52, r = row.reset_pct, t = row.retained_pct;
      const b1 = p.rect(x - 16, Yb(r), 15, 222 - Yb(r), COLORS[i]);
      const b2 = p.hatch(x + 1, Yb(t), 15, 222 - Yb(t), COLORS[i]);
      grow(b1, x, 222); grow(b2, x, 222);
      const late = [];
      if (i < 2) { late.push(p.mid(x - 8.5, Yb(r) - 3, r.toFixed(1), 6.2), p.mid(x + 8.5, Yb(t) - 3, t.toFixed(1), 6.2)); }
      else late.push(p.mid(x, Yb(t) - 3, t.toFixed(1), 7.2));
      p.mid(x, 234, NAMES[i], 7.5, COLORS[i]);
      if (i < 2) { const y = Yb(Math.max(r, t)) - 13; late.push(p.path([[x - 16, y + 2], [x - 16, y], [x + 16, y], [x + 16, y + 2]], '#000', 0.55), p.mid(x, y - 3, `+${row.delta_pp.toFixed(1)} pp`, 7)); }
      late.forEach(hide);
      resets.push(() => { grow(b1, x, 222); grow(b2, x, 222); late.forEach(hide); });
      seqs.push(async () => {
        await wait(300 + i * 150);                           // (b) runs alongside (a)
        anim(b1, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 650 }); await wait(250);
        anim(b2, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 650 }); await wait(600);
        late.forEach(n => anim(n, [{ opacity: 0 }, { opacity: 1 }], { duration: 350 }));
      });
    });
    p.path([[40, 251], [54, 251]], '#000', 0.85, true); p.rect(58, 247, 7, 7, '#fff'); p.text(70, 253.5, 'Reset');
    p.path([[132, 251], [146, 251]], '#000', 0.85); p.hatch(150, 247, 7, 7, '#DADADA'); p.text(162, 253.5, 'Retained');
    return ctl(seqs, resets);
  }

  // ------------------------------------------------------------------ Fig. 4 (results.py::twirl)
  function buildTwirl(root, d) {
    const rows = d.rows; const p = Canvas(252, 168, root); p.svg.setAttribute('aria-label', 'Rope Twirl: trial 2 to 5 mean acquisition time by stiffness group, KV cache cleared versus retained');
    const seqs = [], resets = [];
    p.mid(126, 13, 'Mean capped acquisition time (s) ↓', 8.2);
    p.rect(66, 22, 10, 6, '#B5BDC3', '#333', 0.5); p.text(81, 28, 'Retained', 7.1);
    p.rect(149, 22, 12, 6, null, '#A8AFB5', 0.65); p.text(166, 28, 'Reset', 7.1);
    const Y = v => 124 - v * 10.5;
    for (const v of [0, 2, 4, 6, 8]) { p.path([[32, Y(v)], [243, Y(v)]], v === 0 ? '#333' : '#E5E9EC', v === 0 ? 0.6 : 0.35); p.mid(23, Y(v) + 2.5, v, 7.1); }
    p.path([[32, 38], [32, 124]], '#333', 0.5);
    const annotations = [];
    CONFIGS.forEach((cfg, i) => {
      const cx = 58 + 53 * i; const grp = ['Low', 'Middle', 'High'];
      grp.forEach((g, j) => {
        const row = rows.find(r => r.config === cfg && r.group === g); const x = cx + (j - 1) * 14;
        const y = Y(row.retain_s), yr = Y(row.reset_s);
        const outline = p.rect(x - 6.5, yr, 13, 124 - yr, null, '#A8AFB5', 0.65);            // Reset outline (paper)
        const greyFill = p.rect(x - 6.5, yr, 13, 124 - yr, '#D3D8DC', null);                 // animation only: KV cleared, grey
        const bar = j === 0 ? p.rect(x - 4, y, 8, 124 - y, COLORS[i], '#394349', 0.45) : p.hatch(x - 4, y, 8, 124 - y, COLORS[i], j === 2, 0.28, '#394349', 0.45);
        grow(greyFill, x, 124); hide(outline); hide(bar);
        const delta = row.retain_s - row.reset_s;
        let lab = [];
        if (i < 2) {
          const extra = (i === 0 && j === 0) ? 10 : (i === 0 && j === 1) ? 5 : (i === 1 && j === 1) ? 6 : 0;
          const top = Math.min(y, yr), base = top - 4 - extra, lx = (i === 0 && j === 0) ? x : j < 2 ? x - 3.2 : x;
          if (extra) lab.push(p.path([[x, top - 1.3], [x, base + 1.5]], '#747D83', 0.35));
          lab.push(p.mid(lx, base, (delta >= 0 ? '+' : '−') + Math.abs(delta).toFixed(2), 6.4));
        }
        p.mid(x, 137, ['L', 'M', 'H'][j], 7.1);
        lab.forEach(hide);
        resets.push(() => { grow(greyFill, x, 124); hide(outline); hide(bar); lab.forEach(hide); });
        seqs.push(async () => {
          await wait(100 + i * 160 + j * 70);
          anim(greyFill, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 650 });           // 1. rises to the KV-cleared height
          await wait(1300);
          anim(outline, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
          anim(greyFill, [{ transform: 'scaleY(1)' }, { transform: `scaleY(${row.retain_s / row.reset_s})` }], { duration: 750, easing: 'cubic-bezier(.6,0,.3,1)' }); // 2. falls to the KV-retained height…
          anim(bar, [{ opacity: 0 }, { opacity: 1 }], { duration: 750, easing: 'cubic-bezier(.6,0,.3,1)' });     //    …and becomes the model's bar
          await wait(760); anim(greyFill, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
          await wait(120); lab.forEach(n => anim(n, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 }));
        });
      });
      if (i >= 2) { const top = Math.min(...rows.filter(r => r.config === cfg).flatMap(r => [Y(r.retain_s), Y(r.reset_s)])); const t = p.mid(cx, top - 7, 'Δ≈0 s', 6.6); hide(t); resets.push(() => hide(t)); seqs.push(async () => { await wait(2500 + i * 160); anim(t, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 }); }); }
      p.path([[cx - 19, 142], [cx + 19, 142]], '#B8BFC4', 0.4);
      p.mid(cx, 153, NAMES[i], 8.2, COLORS[i]);
    });
    p.mid(126, 165, 'L low · M middle · H high', 6.5);
    return ctl(seqs, resets);
  }

  // ------------------------------------------------------------------ Fig. 6 (results.py::robot)
  // Real robot: TAT / MNE for Swing and Twirl, Hits for Whip, T1 → T3, thin individual traces + thick mean. Same entrance
  // as Fig. 3(a): every trace in every panel grows point → segment → point in lockstep, driven by two shared clip rects.
  const tint = (c, a) => '#' + [1, 3, 5].map(i => Math.round(255 + (parseInt(c.slice(i, i + 2), 16) - 255) * a).toString(16).padStart(2, '0')).join('');
  function buildRobot(root, d) {
    const p = Canvas(252, 200, root); p.svg.setAttribute('aria-label', 'Real-robot results over trials 1 to 3: acquisition time and tracking error for Rope Swing and Rope Twirl, hits for Rope Whip');
    const seqs = [], resets = [];
    const colors = { swing: '#FF800E', twirl: '#C85200', whip: '#898989' };
    const xs = [1, 2, 3], plotW = 64, plotH = 50, gut = 14, cols = [6, 88, 170], topY = 42, botY = 118;
    const whipY = (topY + botY + plotH) / 2 - plotH / 2;
    const X = (left, t) => left + gut + (t - 0.7) / 2.6 * plotW;
    const Y = (top, v, lo, hi) => top + plotH - (v - lo) / (hi - lo) * plotH;
    // two clip rects (T1→T2, T2→T3) shared by every line in the figure; x-spans are identical in all three columns' local frames
    // only up to the column offset, so each column gets its own pair, grown together
    const cpIds = cols.map(() => 'cp' + (uid++));
    const rects = cols.map((left, ci) => { const cp = el('clipPath', { id: cpIds[ci] }, p.svg); return [1, 2].map(t => el('rect', { x: X(left, t), y: 0, width: 0, height: 200 }, cp)); });
    const marks = [[], [], []];                                 // markers by trial
    const dot = (x, y, c, r) => { const m = p.dot(x, y, c, r, null, 0); m.style.transformOrigin = `${x}px ${y}px`; return m; };
    function frame(left, top, [lo, hi], ticks) {
      const l = left + gut, r = left + gut + plotW, t = top, b = top + plotH;
      for (const v of ticks) { const y = Y(top, v, lo, hi); p.path([[l, y], [r, y]], '#E5E5E5', 0.4); p.mid(l - 8, y + 2.4, String(v), 6.2); }
      p.path([[l, t], [l, b], [r, b]], '#000', 0.55);
      for (const tk of xs) { const x = X(left, tk); p.path([[x, b], [x, b + 2.4]], '#000', 0.5); p.mid(x, b + 10, 'T' + tk, 6.4); }
    }
    function traces(ci, top, rows, mean, [lo, hi], color) {
      const left = cols[ci], light = tint(color, 0.38), clip = `url(#${cpIds[ci]})`;
      for (const row of rows) {
        p.path(row.map((v, j) => [X(left, xs[j]), Y(top, v, lo, hi)]), light, 0.7).setAttribute('clip-path', clip);
        row.forEach((v, j) => marks[j].push(dot(X(left, xs[j]), Y(top, v, lo, hi), light, 1.15)));
      }
      p.path(mean.map((v, j) => [X(left, xs[j]), Y(top, v, lo, hi)]), color, 1.35).setAttribute('clip-path', clip);
      mean.forEach((v, j) => marks[j].push(dot(X(left, xs[j]), Y(top, v, lo, hi), color, 1.7)));
    }
    p.path([[78, 10], [90, 10]], '#C7C7C7', 0.7); p.dot(84, 10, '#C7C7C7', 1.15, null, 0); p.text(94, 12.4, 'Individual', 7.2);
    p.path([[148, 10], [160, 10]], '#555555', 1.35); p.dot(154, 10, '#555555', 1.7, null, 0); p.text(164, 12.4, 'Mean', 7.2);
    [['(a) RopeSwing', 0], ['(b) RopeTwirl', 1], ['(c) RopeWhip', 2]].forEach(([lab, ci]) => p.mid(cols[ci] + gut + plotW / 2, 24, lab, 7.6));
    p.text(cols[0] + gut, 38, 'TAT (s) ↓', 6.8); frame(cols[0], topY, [5, 12], [5, 7, 9, 11]);
    traces(0, topY, d.swing.tat.trials, d.swing.tat.mean, [5, 12], colors.swing);
    p.text(cols[0] + gut, 114, 'MNE (%) ↓', 6.8); frame(cols[0], botY, [2.8, 7.1], [3, 5, 7]);
    traces(0, botY, d.swing.mne.trials, d.swing.mne.mean, [2.8, 7.1], colors.swing);
    p.text(cols[1] + gut, 38, 'TAT (s) ↓', 6.8); frame(cols[1], topY, [1.8, 4.2], [2, 3, 4]);
    traces(1, topY, d.twirl.tat.trials, d.twirl.tat.mean, [1.8, 4.2], colors.twirl);
    p.text(cols[1] + gut, 114, 'MNE (%) ↓', 6.8); frame(cols[1], botY, [0.35, 2], [0.5, 1, 1.5, 2]);
    traces(1, botY, d.twirl.mne.trials, d.twirl.mne.mean, [0.35, 2], colors.twirl);
    p.text(cols[2] + gut, whipY - 4, 'Hits ↑', 6.8); frame(cols[2], whipY, [-0.05, 3.3], [0, 1, 2, 3]);
    traces(2, whipY, d.whip.trials, d.whip.mean, [-0.05, 3.3], colors.whip);
    const segW = plotW / 2.6;                                     // x-distance between consecutive trials
    const growAll = (j, ms) => new Promise(res => { const t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; rects.forEach(r => r[j].setAttribute('width', segW * e)); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
    const reset = () => { rects.flat().forEach(r => r.setAttribute('width', 0)); marks.flat().forEach(hide); };
    reset(); resets.push(reset);
    seqs.push(async () => {
      await wait(300);
      for (let j = 0; j < 3; j++) {                              // all T_j points (thin first, mean on top), then all segments to T_j+1
        marks[j].forEach(m => anim(m, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 220 }));
        if (j < 2) { await wait(120); await growAll(j, 320); await wait(40); }
      }
    });
    return ctl(seqs, resets);
  }

  // ------------------------------------------------------------------ Fig. 1: the pipeline master, animated by layer id
  // Main process (top row): one token per control step, o_t → Embedding → B1…B6 → Actor head → a_t; every block reads its
  // layer-specific cache and appends to it. Sub-process (bottom panel, shown for block 3), in the order of the paper /
  // txl_core.forward_segment: (1) layer input → Q, K, V; (2) new K/V appended to KV cur BEFORE attention; (3) Q attends to
  // KV mem ‖ KV cur under the episode mask; (4) residual + FFN → next block. After ALL blocks finish a step with KV cur full
  // (128), KV cur becomes KV mem and is cleared (rollover ≠ trial reset).
  function buildArch(host) {
    const svg = host.querySelector('svg'); if (!svg) return { play() {}, stop() {}, replay() {} };
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'RopeFormer streaming inference: each observation token passes six Transformer-XL blocks; every block reads its layer-specific KV cache and appends to it. Inside a block the new K/V is appended to the current segment, then the query attends to the previous segment (KV mem) and the current one (KV cur) under the episode mask.');
    const g = id => svg.querySelector('#' + CSS.escape(id));
    const blocks = [1, 2, 3, 4, 5, 6].map(i => g('Transformer-block-' + i)), mems = [1, 2, 3, 4, 5, 6].map(i => g('Memory-' + i + '-front'));
    const reads = [1, 2, 3, 4, 5, 6].map(i => [g('Read-own-memory-for-block-' + i), g('Read-own-memory-for-block-' + i + '-arrow')]);
    const appends = [1, 2, 3, 4, 5, 6].map(i => [g('Append-input-projected-K-V-for-block-' + i), g('Append-input-projected-K-V-for-block-' + i + '-arrow')]);
    const hop = id => [g(id), g(id + '-arrow')];
    const hops = ['Observation-to-token-embedding', 'Current-embedded-token-to-block-1', 'Hidden-token-block-1-to-2', 'Hidden-token-block-2-to-3', 'Hidden-token-block-3-to-4', 'Hidden-token-block-4-to-5', 'Hidden-token-block-5-to-6', 'Final-hidden-token-to-action-readout', 'Action-for-execution'].map(hop);
    const qP = hop('Current-Q-to-attention'), catP = hop('Concatenated-mem-and-cur-to-one-attention'), ffnP = hop('Continue-to-residual-and-FFN'), appP = hop('Append-new-K-V-to-cur-before-attention'), rollP = hop('Rollover-when-cur-reaches-128-after-this-step-attention');
    const attn = g('Same-episode-masked-attention'), obs = g('Current-observation'), emb = g('Observation-embedding'), actor = g('Actor-head'), lin = g('Current-layer-input-and-projections'), curBox = g('KV-cur-current-segment-prefix'), memBox = g('KV-mem-previous-complete-segment');
    const memSlots = [0, 1, 2, 3, 4, 5, 6].map(i => g('Mem-filled-slot-' + i));
    const curSlots = [g('Cur-filled-slot-0'), g('Cur-filled-slot-1'), g('Cur-filled-slot-2'), g('Cur-filled-slot-3'), g('Cur-empty-slot-4'), g('Cur-empty-slot-5'), g('Cur-empty-slot-6')];
    const ORANGE = 'rgb(255,128,14)', DEEP = 'rgb(200,82,0)', GREY = 'rgb(137,137,137)';
    const setCur = n => curSlots.forEach((s, i) => { s.style.fill = i < n ? (i === n - 1 ? DEEP : ORANGE) : 'white'; s.style.stroke = i < n ? 'none' : 'rgb(171,171,171)'; });
    const fillOf = n => getComputedStyle(n).fill;
    const glow = (n, ms = 520) => { const f = fillOf(n); return n.animate([{ fill: f }, { fill: ORANGE }, { fill: f }], { duration: ms, easing: 'ease-out' }); };
    const flash = (pair, ms = 480) => pair.forEach(n => n && n.animate([{ strokeWidth: 0.85 }, { strokeWidth: 2.4 }, { strokeWidth: 0.85 }], { duration: ms, easing: 'ease-out' }));
    const pulseSlots = list => list.forEach(s => s.animate([{ fill: fillOf(s) }, { fill: DEEP }, { fill: fillOf(s) }], { duration: 480 }));
    // No tokens: motion is shown on the figure's own edges — a short orange pulse travels along the path (an overlay clone
    // with a moving dash), the arrowhead thickens as it lands, and the node it reaches glows.
    let running = false, timer = null, n = 4; setCur(n);
    const overlays = new Set();
    const travel = (pair, ms, w = 2.2) => new Promise(res => {
      const path = pair[0]; if (!path) return res();
      const L = path.getTotalLength(), dash = Math.min(L * 0.55, 16);
      const o = path.cloneNode(false); o.removeAttribute('id'); o.setAttribute('serif:id', ''); o.style.fill = 'none'; o.style.stroke = ORANGE; o.style.strokeWidth = w; o.style.strokeLinecap = 'round'; o.style.pointerEvents = 'none';
      o.style.strokeDasharray = `${dash} ${L + dash}`; o.style.strokeDashoffset = dash; path.parentNode.insertBefore(o, path.nextSibling); overlays.add(o);
      const a = o.animate([{ strokeDashoffset: dash }, { strokeDashoffset: -L }], { duration: ms, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
      if (pair[1]) pair[1].animate([{ strokeWidth: 0.85 }, { strokeWidth: 2.6 }, { strokeWidth: 0.85 }], { duration: 360, delay: Math.max(0, ms - 180), easing: 'ease-out' });
      a.onfinish = a.oncancel = () => { o.remove(); overlays.delete(o); res(); };
    });
    async function block(i) {                                                  // a block on the main row: append then read, in that order
      glow(blocks[i], 620); glow(mems[i], 620); flash(appends[i], 420); await wait(200); flash(reads[i], 420); await wait(360);
    }
    async function subprocess() {                                              // block 3 expanded, at a readable pace; the main row waits
      glow(blocks[2], 2100); glow(lin, 520); await wait(380);                  // (1) layer input → Q, K, V
      flash(appends[2], 520); glow(mems[2], 1400); await travel(appP, 520);      // KV 3 glows once, spanning append → read     // (2) append this step's K/V to KV cur (before attention)
      n = Math.min(n + 1, 7); setCur(n); pulseSlots(curSlots.slice(n - 1, n)); glow(curBox, 420); await wait(240);
      flash(reads[2], 560); await travel(qP, 560);         // (3) Q attends to KV mem ‖ KV cur under the episode mask
      pulseSlots([...memSlots, ...curSlots.slice(0, n)]); glow(memBox, 480); glow(curBox, 480); flash(catP, 480); glow(attn, 560); await wait(460);
      await travel(ffnP, 300); await wait(120);                                // (4) residual + FFN → next block
    }
    async function tick() {
      if (!running) return;
      glow(obs, 520); await wait(300);
      await travel(hops[0], 260); glow(emb, 520); await wait(260);
      for (let i = 0; i < 6; i++) {
        if (!running) return;
        await travel(hops[i + 1], 220);
        if (i === 2) await subprocess(); else await block(i);
      }
      await travel(hops[7], 280); glow(actor, 520); await wait(240);
      await travel(hops[8], 220); await wait(200);
      if (n >= 7) {                                                            // segment full after this step → mem ← cur, clear cur
        await wait(200); flash(rollP, 900); rollP[0].animate([{ stroke: GREY }, { stroke: 'black' }, { stroke: GREY }], { duration: 900 });
        curSlots.forEach(s => s.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: 'translate(-114px,0)', opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }));
        memSlots.forEach(m => m.animate([{ fill: GREY }, { fill: ORANGE }, { fill: GREY }], { duration: 900, delay: 400 }));
        await wait(850); curSlots.forEach(s => s.getAnimations().forEach(a => a.cancel())); n = 0; setCur(0); await wait(300);
      }
      timer = setTimeout(tick, 500);
    }
    const clear = () => { overlays.forEach(o => { o.getAnimations().forEach(a => a.cancel()); o.remove(); }); overlays.clear(); curSlots.forEach(s => s.getAnimations().forEach(a => a.cancel())); };
    return {
      play() { if (running || reduce) return; running = true; tick(); },
      stop() { running = false; clearTimeout(timer); },
      replay() { this.stop(); clear(); n = 4; setCur(4); this.play(); }
    };
  }

  function ctl(seqs, resets) { return { play() { resets.forEach(r => r()); requestAnimationFrame(() => seqs.forEach(s => s())); }, stop() {}, replay() { this.play(); } }; }

  // ------------------------------------------------------------------ mount
  const DATA = window.ROPEFIG_DATA || {};
  const builders = { swing: h => buildSwing(h, DATA.fig3), twirl: h => buildTwirl(h, DATA.fig4), robot: h => buildRobot(h, DATA.fig6), arch: buildArch };
  document.querySelectorAll('[data-fig]').forEach(host => {
    const c = builders[host.dataset.fig](host);
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) c.play(); else c.stop(); }), { threshold: 0.5 }).observe(host);
  });
})();
