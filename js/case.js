/* Shared case study behaviour: reading mode, pinned decisions, images, drag scroll */

/* Quick read / Full story: the pill slides, the page fades out, swaps, then settles back in */
(function () {
  var root = document.documentElement, body = document.querySelector('.cs-body'), mode = document.querySelector('.mode');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches, busy = false;
  function pill() {
    var b = mode.querySelector('[aria-pressed="true"]'); if (!b) return;
    mode.style.setProperty('--pill-x', b.offsetLeft + 'px'); mode.style.setProperty('--pill-w', b.offsetWidth + 'px');
  }
  function apply(quick) {
    root.classList.toggle('is-quick', quick);
    try { history.replaceState(null, '', quick ? '#quick' : location.pathname + location.search); } catch (e) {}
    window.dispatchEvent(new Event('resize'));
  }
  function set(m, go) {
    var quick = m === 'quick';
    if (busy || quick === root.classList.contains('is-quick')) { if (go) jump(go); return; }
    mode.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.mode === m)); });
    pill();
    if (reduce || !body.animate) { apply(quick); if (go) jump(go); return; }
    busy = true;
    body.animate([{ opacity: 1, transform: 'none', filter: 'blur(0)' }, { opacity: 0, transform: 'translateY(-6px)', filter: 'blur(2px)' }], { duration: 240, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }).onfinish = function () {
      apply(quick);
      if (go) jump(go, true);
      var a = body.animate([{ opacity: 0, transform: 'translateY(14px)', filter: 'blur(2px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
      a.onfinish = function () { a.cancel(); body.getAnimations().forEach(function (x) { x.cancel(); }); busy = false; };
    };
  }
  function jump(id, instant) {
    var t = document.getElementById(id); if (!t) return;
    if (instant) { window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 24); return; }
    if (window.siteScroll) window.siteScroll.scrollTo(t, -24); else t.scrollIntoView({ behavior: 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]'); if (!b) return;
    e.preventDefault(); set(b.dataset.mode, b.dataset.go);
  });
  if (location.hash === '#quick') { mode.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.mode === 'quick')); }); apply(true); }
  pill(); window.addEventListener('resize', pill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pill);
})();

/* Key decisions: the section stays pinned while 01 → 02 → 03 change in place */
(function () {
  var track = document.querySelector('.dec-track'); if (!track) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var roomy = function () { return window.innerHeight >= 560 && !(window.innerWidth > window.innerHeight * 1.9 && window.innerHeight < 640); };
  var arts = track.querySelectorAll('.decision'), steps = track.querySelectorAll('.dec-step'), cur = 0, ticking = false;
  function on() { return !reduce && roomy(); }
  document.documentElement.classList.toggle('dec-sticky', on());
  function update() {
    ticking = false;
    if (!document.documentElement.classList.contains('dec-sticky')) return;
    var r = track.getBoundingClientRect(), total = track.offsetHeight - window.innerHeight;
    var p = Math.min(1, Math.max(0, -r.top / total));
    var i = Math.min(arts.length - 1, Math.floor(p * arts.length * 0.999 + 0.0001));
    steps.forEach(function (s, k) { s.style.setProperty('--p', Math.min(1, Math.max(0, p * arts.length - k)).toFixed(3)); s.classList.toggle('is-active', k === i); s.classList.toggle('is-done', k < i); });
    if (i !== cur) { cur = i; arts.forEach(function (a, k) { a.classList.toggle('is-active', k === i); a.classList.toggle('is-past', k < i); }); }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', function () { document.documentElement.classList.toggle('dec-sticky', on()); update(); });
  steps.forEach(function (s, k) {
    s.addEventListener('click', function () {
      var top = track.getBoundingClientRect().top + window.scrollY, total = track.offsetHeight - window.innerHeight;
      var y = top + total * (k / arts.length) + (k ? 4 : 0);
      if (window.siteScroll) window.siteScroll.scrollTo({ getBoundingClientRect: function () { return { top: y - window.scrollY }; } }, 0); else window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
  update();
})();

/* drag-to-scroll for the horizontal galleries on desktop */
document.querySelectorAll('main img').forEach(function (im) {
  function miss() { var d = document.createElement('div'); d.className = 'img-missing'; d.textContent = 'Image coming soon'; d.setAttribute('role', 'img'); d.setAttribute('aria-label', im.alt); im.replaceWith(d); }
  if (im.complete && im.naturalWidth === 0) miss(); else im.addEventListener('error', miss);
});
document.querySelectorAll('[data-drag]').forEach(function (el) {
  var down = false, x0 = 0, s0 = 0;
  el.addEventListener('mousedown', function (e) { down = true; x0 = e.pageX; s0 = el.scrollLeft; e.preventDefault(); });
  window.addEventListener('mouseup', function () { down = false; });
  window.addEventListener('mousemove', function (e) { if (down) el.scrollLeft = s0 - (e.pageX - x0); });
});
