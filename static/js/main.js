(function () {
  document.documentElement.classList.add('js');
  const $ = id => document.getElementById(id);
  const hero = $('hero'), bg = $('bg'), mark = $('mark'), cta = $('cta'), ctain = $('ctain'),
        topbar = $('topbar'), slotL = $('slotL'), slotR = $('slotR'), secnav = $('secnav'), hint = $('hint');
  const texts = [$('t1'), $('t2'), $('t3')];
  const ctabox = cta.parentElement;
  const secBtns = [...cta.querySelectorAll('.sec')], resBtns = [...cta.querySelectorAll('.res')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, D = reduce ? 0 : 1;
  const EASE_OUT = 'cubic-bezier(.2,.7,.2,1)', EASE_IO = 'cubic-bezier(.65,0,.35,1)';
  let open = true, busy = false, start = {}, end = {};

  // ---- geometry: where the wordmark and the resource buttons start and land ----
  function measure() {
    if (busy) return;
    // Finished transition animations must not override geometry after a resize.
    [mark, cta].forEach(el => el.getAnimations().forEach(a => a.cancel()));
    mark.classList.remove('pinned'); cta.classList.remove('pinned'); mark.style.transform = ''; cta.style.transform = '';
    ctabox.style.height = '';
    const mr = mark.getBoundingClientRect(), cr = cta.getBoundingClientRect(), lr = slotL.getBoundingClientRect(), rr = slotR.getBoundingClientRect();
    const r0 = resBtns[0].getBoundingClientRect(), r2 = resBtns[resBtns.length - 1].getBoundingClientRect();
    const resW = r2.right - r0.left, s = 36 / 44, off = r0.left - cr.left;
    start.m = `translate(${mr.left}px,${mr.top}px) scale(1)`;
    end.m = `translate(${lr.left}px,${lr.top}px) scale(${lr.width / mr.width})`;
    start.c = `translate(${cr.left}px,${cr.top}px) scale(1)`;
    end.c = `translate(${rr.right - resW * s - off * s}px,${rr.top + (rr.height - 44 * s) / 2}px) scale(${s})`;
    // Preserve the space occupied by wrapped buttons before fixing them to the viewport.
    ctabox.style.height = `${cr.height}px`;
    mark.classList.add('pinned'); cta.classList.add('pinned');
    mark.style.transform = open ? start.m : end.m; cta.style.transform = open ? start.c : end.c;
  }
  const anim = (el, frames, opt) => el.animate(frames, Object.assign({ fill: 'forwards', easing: EASE_OUT }, opt)).finished;
  const fadeIn = (el, delay) => anim(el, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 420 * D, delay: delay * D });
  const fadeOut = (el, delay) => anim(el, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(18px)' }], { duration: 260 * D, delay: delay * D, easing: 'cubic-bezier(.4,0,.8,.4)' });
  const lock = on => document.documentElement.classList.toggle('locked', on);
  // Treat a fragment as an element ID, not a CSS selector (IDs may contain punctuation).
  function hashTarget(hash = location.hash) {
    if (!hash || hash === '#') return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return null; }
  }

  // ---- entrance ----
  function enter() {
    if (document.hidden) { document.addEventListener('visibilitychange', enter, { once: true }); return; }
    hero.classList.add('play');
    texts.forEach((el, i) => fadeIn(el, 900 + i * 150)); fadeIn(ctain, 900 + 3 * 150); fadeIn(hint, 1500);
  }
  // ---- hero -> page ----
  async function close() {
    if (!open || busy) return; busy = true;
    const outs = [fadeOut(hint, 0), fadeOut(texts[2], 0), fadeOut(texts[1], 70), fadeOut(texts[0], 140)];
    const m = anim(mark, [{ transform: start.m }, { transform: end.m }], { duration: 520 * D, delay: 160 * D, easing: EASE_IO });
    const c = anim(cta, [{ transform: start.c }, { transform: end.c }], { duration: 520 * D, delay: 160 * D, easing: EASE_IO });
    const sb = secBtns.map(b => anim(b, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 * D, delay: 160 * D }));
    const b = anim(bg, [{ opacity: 1 }, { opacity: 0 }], { duration: 420 * D, delay: 260 * D, easing: EASE_IO });
    const t = anim(topbar, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 * D, delay: 380 * D });
    const n = anim(secnav, [{ opacity: 0, transform: 'translate(-50%,-40%)' }, { opacity: 1, transform: 'translate(-50%,-50%)' }], { duration: 360 * D, delay: 560 * D });
    await Promise.all([...outs, m, c, ...sb, b, t, n]);
    secBtns.forEach(b => b.style.visibility = 'hidden');
    hero.classList.add('closed'); topbar.classList.add('on'); open = false; lock(false); busy = false; measure(); setActive();
    const v = bg.querySelector('video'); if (v) v.pause();
  }
  // ---- page -> hero ----
  async function reopen() {
    if (open || busy || window.scrollY > 0) return; busy = true; lock(true);
    hero.classList.remove('closed'); topbar.classList.remove('on'); secBtns.forEach(b => b.style.visibility = '');
    const v = bg.querySelector('video'); if (v) v.play().catch(() => {});
    const n = anim(secnav, [{ opacity: 1, transform: 'translate(-50%,-50%)' }, { opacity: 0, transform: 'translate(-50%,-40%)' }], { duration: 200 * D });
    const m = anim(mark, [{ transform: end.m }, { transform: start.m }], { duration: 520 * D, delay: 80 * D, easing: EASE_IO });
    const c = anim(cta, [{ transform: end.c }, { transform: start.c }], { duration: 520 * D, delay: 80 * D, easing: EASE_IO });
    const sb = secBtns.map(b => anim(b, [{ opacity: 0 }, { opacity: 1 }], { duration: 260 * D, delay: 340 * D }));
    const b = anim(bg, [{ opacity: 0 }, { opacity: 1 }], { duration: 420 * D, delay: 80 * D, easing: EASE_IO });
    const t = anim(topbar, [{ opacity: 1 }, { opacity: 0 }], { duration: 240 * D, delay: 80 * D });
    await Promise.all([n, m, c, ...sb, b, t, fadeIn(texts[0], 380), fadeIn(texts[1], 450), fadeIn(texts[2], 520), fadeIn(hint, 580)]);
    open = true; busy = false; measure();
  }

  // ---- section highlight ----
  const links = [...secnav.querySelectorAll('a')], secs = links.map(a => hashTarget(a.getAttribute('href')));
  function setActive() {
    const y = window.scrollY + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar')) + 48; let cur = 0;
    secs.forEach((s, i) => { if (s && s.offsetTop <= y) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
  }
  addEventListener('scroll', setActive, { passive: true });

  // ---- input ----
  addEventListener('wheel', e => { if (open && e.deltaY > 8) close(); else if (!open && e.deltaY < -8 && window.scrollY <= 0) reopen(); }, { passive: true });
  let ty = null;
  addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', e => { if (ty === null) return; const dy = ty - e.touches[0].clientY; if (open && dy > 30) { ty = null; close(); } else if (!open && dy < -30 && window.scrollY <= 0) { ty = null; reopen(); } }, { passive: true });
  addEventListener('keydown', e => {
    if (e.target.matches('input,textarea')) return;
    if (open && ['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); close(); }
    else if (!open && ['ArrowUp', 'PageUp', 'Home'].includes(e.key) && window.scrollY <= 0) { e.preventDefault(); reopen(); }
  });
  hint.addEventListener('click', close);
  mark.addEventListener('click', () => { if (open) return; if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' }); const w = () => { if (window.scrollY <= 0) reopen(); else requestAnimationFrame(w); }; w(); });
  secBtns.forEach(a => a.addEventListener('click', e => { if (open) { e.preventDefault(); close().then(() => { const t = hashTarget(a.getAttribute('href')); t && t.scrollIntoView({ behavior: 'smooth' }); }); } }));
  addEventListener('resize', measure);

  // ---- deep links (#method etc.) skip the stage ----
  function boot() {
    measure();
    const target = hashTarget();
    if (target) {
      open = false; hero.classList.add('closed', 'play'); topbar.classList.add('on');
      texts.forEach(t => t.style.opacity = 0); hint.style.opacity = 0; ctain.style.opacity = 1;
      secBtns.forEach(b => b.style.visibility = 'hidden'); secnav.style.opacity = 1; topbar.style.opacity = 1; bg.style.opacity = 0;
      measure(); lock(false);
      target.scrollIntoView({ behavior: 'instant' });
      setActive();
    } else { lock(true); enter(); }
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(boot);

  // ---- rail labels: split into letters, play on first view ----
  document.querySelectorAll('.lbl').forEach(el => {
    const txt = el.dataset.label || el.textContent; el.textContent = ''; let i = 0;
    for (const ch of txt) { const s = document.createElement('span'); s.className = 'l' + (ch === ' ' ? ' sp' : ''); s.textContent = ch === ' ' ? '\u00a0' : ch; s.style.setProperty('--i', i++); el.appendChild(s); }
  });
  // replay every time a label comes back into view (it is reset while off-screen, so the letters re-emerge)
  const lio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('play'); }
    else { e.target.classList.remove('play'); void e.target.offsetWidth; }
  }), { threshold: 0.6 });
  document.querySelectorAll('.lbl').forEach(el => lio.observe(el));

  // ---- reveal on scroll ----
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  // ---- copy the displayed citation; keep manual selection available if blocked ----
  const copyCitation = $('copy-citation'), citationText = $('citation-text'), citationStatus = $('citation-status');
  if (copyCitation && citationText && citationStatus) {
    copyCitation.hidden = false;
    copyCitation.addEventListener('click', async () => {
      citationStatus.textContent = '';
      try {
        await navigator.clipboard.writeText(citationText.textContent.trim());
        citationStatus.textContent = 'BibTeX copied to clipboard.';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(citationText);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        citationText.parentElement.focus();
        citationStatus.textContent = 'Copy unavailable. Select the citation and copy it manually.';
      }
    });
  }

  // ---- lazy-play videos only when visible ----
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: 0.25 });
  document.querySelectorAll('main video').forEach(v => vio.observe(v));

})();
