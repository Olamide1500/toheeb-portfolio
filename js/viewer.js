/* All-screens sheet + full-size viewer. Data comes from window.SCREENS. */
(function () {
  var D = window.SCREENS;
  if (!D) return;
  var list = [];
  D.flows.forEach(function (f) { f.screens.forEach(function (s, i) { s.flow = f.name; s.idx = i + 1; s.of = f.screens.length; list.push(s); }); });
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var src = function (s, t) { return D.base + (t ? 't' : 's') + pad(s.n) + '.jpg'; };
  var X = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 3l12 12M15 3 3 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var L = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16 10H4m5-5-5 5 5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var R = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  /* thumbnails come from one sprite image per project (fewer files to load) */
  var SP = D.sprite;
  function thumb(s) {
    var c = SP && SP.cells[s.n];
    if (!c) return '<img src="' + src(s, 1) + '" alt="" loading="lazy" decoding="async">';
    var sw = c[2], sh = c[3];
    var px = SP.W === sw ? 0 : c[0] / (SP.W - sw) * 100, py = SP.H === sh ? 0 : c[1] / (SP.H - sh) * 100;
    return '<span class="sv-sprite" style="background-image:url(' + SP.src + ');background-size:' + (SP.W / sw * 100) + '% ' + (SP.H / sh * 100) + '%;background-position:' + px + '% ' + py + '%"></span>';
  }
  var edges = list.filter(function (s) { return s.edge; }).length;

  /* ----- sheet ----- */
  var sheet = document.createElement('div');
  sheet.className = 'sv-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', D.project + ', all ' + D.total + ' screens'); sheet.hidden = true;
  var rows = D.flows.map(function (f) {
    var e = f.screens.filter(function (s) { return s.edge; }).length;
    var mob = f.platform === 'Mobile web' || f.screens.every(function (s) { return s.mobile; });
    return '<section class="sv-flow"><div class="sv-flow__head"><h3>' + f.name + '</h3><p class="sv-flow__meta">' + f.screens.length + ' screens' + (e ? ' · ' + e + ' edge' : '') + '</p><p class="sv-flow__plat">' + f.platform + '</p></div>' +
      '<div class="sv-grid' + (mob ? ' sv-grid--m' : '') + '">' + f.screens.map(function (s) {
        return '<button class="sv-thumb' + (s.edge ? ' is-edge' : '') + '" data-n="' + s.n + '" aria-label="Open ' + f.name + ': ' + s.name + (s.edge ? ' (edge case)' : '') + '">' + thumb(s) + '</button>';
      }).join('') + '</div></section>';
  }).join('');
  sheet.innerHTML = '<div class="sv-bar"><div class="wrap"><p class="sv-bar__title">' + D.project + '<span>·</span>All ' + D.total + ' screens</p><button class="sv-close" data-close aria-label="Close all screens">' + X + '</button></div></div>' +
    '<div class="wrap sv-sheet__body"><div class="sv-intro"><div><p class="label">All screens</p><h2>All ' + D.total + ' screens, in one view.</h2></div>' +
    '<p>' + (D.intro || (D.flows.length + ' flows: the website, sign-up, the employee and manager apps, and the mobile web version.')) + ' Includes ' + edges + ' edge cases. <span class="d-tap">Click</span> any screen to see it full size.</p></div>' +
    '<div class="sv-panel">' + rows + '</div><p class="sv-legend"><i></i>Edge case: an error, empty or expired screen</p></div>';
  document.body.appendChild(sheet);
  if (window.matchMedia('(pointer: coarse)').matches) sheet.querySelector('.d-tap').textContent = 'Tap';

  /* ----- viewer ----- */
  var view = document.createElement('div');
  view.className = 'sv-view'; view.setAttribute('role', 'dialog'); view.setAttribute('aria-modal', 'true'); view.setAttribute('aria-label', 'Screen viewer'); view.hidden = true;
  view.innerHTML = '<div class="sv-view__inner">' +
    '<div class="sv-top"><p class="sv-top__crumb">' + D.project + ' · All screens</p><p class="sv-top__count" aria-live="polite"></p><button class="sv-close" data-close aria-label="Close viewer">' + X + '</button></div>' +
    '<div class="sv-stage"><div class="sv-frame"></div>' +
    '<button class="sv-arrow sv-arrow--side sv-arrow--prev" data-prev aria-label="Previous screen">' + L + '</button><button class="sv-arrow sv-arrow--side sv-arrow--next" data-next aria-label="Next screen">' + R + '</button></div>' +
    '<div class="sv-foot"><div class="sv-foot__info"><span class="sv-foot__flow"></span><span class="sv-foot__title"></span><span class="sv-foot__note"></span></div>' +
    '<span class="sv-foot__hint">Use ← → to move · Esc to close</span>' +
    '<div class="sv-foot__arrows"><button class="sv-arrow" data-prev aria-label="Previous screen">' + L + '</button><button class="sv-arrow" data-next aria-label="Next screen">' + R + '</button></div></div></div>';
  document.body.appendChild(view);
  var frame = view.querySelector('.sv-frame'), count = view.querySelector('.sv-top__count');
  var fFlow = view.querySelector('.sv-foot__flow'), fTitle = view.querySelector('.sv-foot__title'), fNote = view.querySelector('.sv-foot__note');
  var cur = 0, lastFocus = [], stack = [];

  function show(i, dir) {
    cur = (i + list.length) % list.length;
    var s = list[cur];
    var mobileVw = window.innerWidth < 700;
    var html;
    if (s.mobile) html = '<div class="sv-shot sv-shot--m' + (s.long ? ' sv-shot--mlong' : '') + '"' + (s.long ? ' tabindex="0"' : '') + '><div class="sv-scroll"><img src="' + src(s) + '" alt="' + s.flow + ': ' + s.name + '"></div></div>';
    else html = '<div class="sv-shot sv-shot--d' + (s.long && !mobileVw ? ' sv-shot--long' : '') + '" tabindex="' + (s.long ? '0' : '-1') + '"><img src="' + src(s) + '" alt="' + s.flow + ': ' + s.name + '"></div>' + (mobileVw ? '' : '');
    var wrap = document.createElement('div');
    wrap.className = 'sv-anim-in' + (dir < 0 ? ' from-left' : '');
    wrap.style.display = 'grid'; wrap.style.justifyItems = 'center';
    wrap.innerHTML = html + (!s.mobile && mobileVw ? '<p class="sv-desk-note">This is a desktop screen. Open it on a computer to see it bigger.</p>' : '');
    if (s.long && mobileVw && !s.mobile) wrap.querySelector('.sv-shot').classList.add('sv-shot--long');
    frame.innerHTML = ''; frame.appendChild(wrap);
    count.textContent = pad(s.n) + ' / ' + pad(D.total);
    fFlow.textContent = s.flow + ' · ' + s.idx + ' of ' + s.of;
    fTitle.textContent = s.name;
    fNote.textContent = s.long ? (s.mobile ? 'Long screen: scroll inside it' : 'Long page: scroll inside it') : '';
    [list[(cur + 1) % list.length], list[(cur - 1 + list.length) % list.length]].forEach(function (p) { var im = new Image(); im.src = src(p); });
  }

  function lock(on) {
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (window.siteScroll) { if (on) window.siteScroll.stop(); else window.siteScroll.start(); }
  }
  function open(el, focusSel) {
    lastFocus.push(document.activeElement);
    if (!stack.length) lock(true);
    stack.push(el);
    el.hidden = false; void el.offsetWidth; el.classList.add('is-open');
    var f = el.querySelector(focusSel || '[data-close]'); if (f) f.focus({ preventScroll: true });
  }
  function close() {
    var el = stack.pop(); if (!el) return;
    el.classList.remove('is-open');
    setTimeout(function () { if (!el.classList.contains('is-open')) el.hidden = true; }, 320);
    if (!stack.length) lock(false);
    var f = lastFocus.pop(); if (f && f.focus) f.focus({ preventScroll: true });
  }
  function openSheet() { sheet.scrollTop = 0; open(sheet); }
  function openViewer(n) { var i = list.findIndex(function (s) { return s.n === n; }); show(i < 0 ? 0 : i, 0); open(view); }

  sheet.addEventListener('click', function (e) {
    var t = e.target.closest('.sv-thumb'); if (t) return openViewer(+t.dataset.n);
    if (e.target.closest('[data-close]')) close();
  });
  view.addEventListener('click', function (e) {
    if (e.target.closest('[data-prev]')) show(cur - 1, -1);
    else if (e.target.closest('[data-next]')) show(cur + 1, 1);
    else if (e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', function (e) {
    var top = stack[stack.length - 1]; if (!top) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (top === view && e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1, 1); }
    if (top === view && e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1, -1); }
    if (e.key === 'Tab') {
      var f = Array.prototype.filter.call(top.querySelectorAll('button, [href], [tabindex="0"]'), function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  /* swipe in the viewer */
  var x0 = null, y0 = null;
  view.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  view.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    x0 = null;
  });

  /* entry points on the page */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-open-screens]'); if (!a) return;
    e.preventDefault(); openSheet();
  });
  window.openScreens = openSheet;
})();
