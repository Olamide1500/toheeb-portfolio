/* Explorations viewer: full-page website designs, one at a time */
(function () {
  var E = [
    { id: 'mega', name: 'Mega’s Clothiers', tags: ['Mobile website', '*Client'], kind: 'phones',
      desc: 'For a menswear tailor in Ibadan and Kano whose clients are in Nigeria and abroad. Goal: look presentable and make it easy to reach him on WhatsApp.',
      meta: 'Instrument Serif + Instrument Sans · Wine #801423 on linen #EAE4DB · Mobile-first · Not live yet',
      shots: [['mega-page', '01 · Home · scroll inside', 17357], ['mega-2', '02 · Collections'], ['mega-3', '03 · How it works'], ['mega-menu', '04 · Menu', 1922]] },
    { id: 'nova', name: 'Nova Skin', tags: ['Website', 'Skincare'], kind: 'page',
      desc: 'Practising a quiet, premium look with less colour and more space.',
      meta: 'Inter + Libre Baskerville · Desktop 1440 · Design concept, not live',
      vars: [{ key: 'nova', n: 5, h: 8601 }] },
    { id: 'topflight', name: 'Topflight', tags: ['Website', 'Agency'], kind: 'page',
      desc: 'Practising bold type and how to show many services in one simple diagram.',
      meta: 'Poppins + Lora · Desktop 1440 · Design concept, not live',
      vars: [{ key: 'top', n: 6, h: 10606 }] },
    { id: 'lumina', name: 'Lumina', tags: ['Website', 'Real estate'], kind: 'page',
      desc: 'Practising a dark theme that still feels warm. Two colour directions on the same layout.',
      meta: 'Manrope + Cormorant Garamond · Desktop 1440 · Design concept, not live',
      vars: [{ key: 'lumA', n: 8, h: 15761, label: 'A · Green' }, { key: 'lumB', n: 8, h: 15309, label: 'B · Coral' }] }
  ];
  var X = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 3l12 12M15 3 3 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var L = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16 10H4m5-5-5 5 5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var R = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var D = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 2.5v7M3 6.5l3 3 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var v = document.createElement('div');
  v.className = 'ex-view'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', 'Explorations viewer'); v.hidden = true;
  v.innerHTML =
    '<div class="ex-top">' +
      '<button type="button" class="ex-back" data-close><span aria-hidden="true">' + L + '</span> All work</button>' +
      '<button type="button" class="ex-x ex-x--m" data-close aria-label="Close">' + X + '</button>' +
      '<div class="ex-top__title"><h2 class="ex-name"></h2><span class="wk-tags ex-tags"></span></div>' +
      '<div class="ex-top__nav"><span class="ex-count" aria-live="polite"></span><button type="button" class="ex-arrow" data-prev aria-label="Previous website">' + L + '</button><button type="button" class="ex-arrow" data-next aria-label="Next website">' + R + '</button><button type="button" class="ex-x" data-close aria-label="Close">' + X + '</button></div>' +
    '</div>' +
    '<div class="ex-info">' +
      '<span class="ex-grab" aria-hidden="true"></span>' +
      '<div class="ex-vars" role="group" aria-label="Colour direction" hidden></div>' +
      '<p class="ex-info__tags wk-tags"></p>' +
      '<p class="ex-desc"></p><p class="ex-meta"></p>' +
      '<div class="ex-mnav"><button type="button" class="ex-arrow" data-prev aria-label="Previous website">' + L + '</button><button type="button" class="ex-full" data-full>Tap to view full page</button><button type="button" class="ex-arrow" data-next aria-label="Next website">' + R + '</button></div>' +
    '</div>' +
    '<div class="ex-stage"><div class="ex-frame"></div><button type="button" class="ex-hint" data-hint>Scroll the page ' + D + '</button></div>';
  document.body.appendChild(v);

  var $ = function (s) { return v.querySelector(s); };
  var frame = $('.ex-frame'), hint = $('.ex-hint'), vars = $('.ex-vars'), full = $('.ex-full');
  var cur = 0, vi = 0, lastFocus = null, isOpen = false;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 699px)');

  function tagsHTML(t) { return t.map(function (x) { return x[0] === '*' ? '<span class="is-dark">' + x.slice(1) + '</span>' : '<span>' + x + '</span>'; }).join(''); }
  function pageHTML(p) {
    return '<img src="img/ex/' + p.key + '.webp" width="2000" height="' + p.h + '" alt="" decoding="async">';
  }
  function render(dir) {
    var e = E[cur];
    $('.ex-name').textContent = e.name;
    $('.ex-tags').innerHTML = tagsHTML(e.tags);
    $('.ex-info__tags').innerHTML = tagsHTML(e.tags);
    $('.ex-count').textContent = (cur + 1) + ' / ' + E.length;
    $('.ex-desc').textContent = e.desc;
    $('.ex-meta').textContent = e.meta.toUpperCase();
    v.setAttribute('aria-label', e.name + ', website design');
    v.classList.toggle('is-phones', e.kind === 'phones');
    if (e.vars && e.vars.length > 1) {
      vars.hidden = false;
      vars.innerHTML = '<span class="ex-vars__pill" aria-hidden="true"></span>' + e.vars.map(function (x, i) { return '<button type="button" data-var="' + i + '" aria-pressed="' + (i === vi) + '"' + (i === vi ? ' class="is-on"' : '') + '>' + x.label + '</button>'; }).join('');
      requestAnimationFrame(pillTo);
    } else { vars.hidden = true; vars.innerHTML = ''; }
    var inner = document.createElement('div');
    inner.className = 'ex-anim' + (dir < 0 ? ' from-left' : dir === 0 ? ' from-up' : '');
    if (e.kind === 'phones') {
      inner.innerHTML = '<div class="ex-phones" tabindex="0" aria-label="' + e.name + ' screens">' + e.shots.map(function (s) {
        var alt = e.name + ': ' + s[1].replace(/^\d+ · /, '').replace(' · scroll inside', ', full page');
        var img = '<img src="img/ex/' + s[0] + '.jpg" width="888" height="' + (s[2] || 1920) + '" alt="' + alt + '" decoding="async">';
        if (s[2] > 3000) return '<figure class="is-long"><div class="ex-pscroll" tabindex="0" aria-label="' + alt + ', scroll inside">' + img + '</div><figcaption>' + s[1] + '</figcaption></figure>';
        return '<figure>' + img + '<figcaption>' + s[1] + '</figcaption></figure>';
      }).join('') + '</div>';
      hint.hidden = true;
      full.textContent = mobile.matches ? 'Swipe to see all 4 screens' : 'All 4 screens';
    } else {
      inner.innerHTML = '<div class="ex-scroll" tabindex="0" aria-label="' + e.name + ' full page, scroll to see more">' + pageHTML(e.vars[vi]) + '</div>';
      hint.hidden = false; hint.classList.remove('is-gone');
      full.textContent = 'Tap to view full page';
      var sc = inner.querySelector('.ex-scroll');
      sc.addEventListener('scroll', function () { if (sc.scrollTop > 40) hint.classList.add('is-gone'); }, { passive: true });
    }
    frame.innerHTML = ''; frame.appendChild(inner);
    v.classList.remove('is-full');
    /* warm the next project */
    var nx = E[(cur + 1) % E.length];
    var im = new Image(); im.src = nx.kind === 'phones' ? 'img/ex/mega-page.jpg' : 'img/ex/' + nx.vars[0].key + '.webp';
  }
  function pillTo() {
    var b = vars.querySelector('.is-on'), p = vars.querySelector('.ex-vars__pill'); if (!b || !p) return;
    p.style.width = b.offsetWidth + 'px'; p.style.transform = 'translateX(' + b.offsetLeft + 'px)';
  }
  function go(i, dir) { cur = (i + E.length) % E.length; vi = 0; render(dir); }

  function open(id) {
    var i = E.findIndex(function (e) { return e.id === id; }); if (i < 0) i = 0;
    lastFocus = document.activeElement; cur = i; vi = 0; render(0);
    document.documentElement.style.overflow = 'hidden';
    if (window.siteScroll) window.siteScroll.stop();
    v.hidden = false; void v.offsetWidth; v.classList.add('is-open'); isOpen = true;
    $('.ex-x:not(.ex-x--m)').offsetParent ? $('.ex-x:not(.ex-x--m)').focus({ preventScroll: true }) : $('.ex-x--m').focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen) return;
    v.classList.remove('is-open'); isOpen = false;
    setTimeout(function () { if (!isOpen) { v.hidden = true; frame.innerHTML = ''; } }, 360);
    document.documentElement.style.overflow = '';
    if (window.siteScroll) window.siteScroll.start();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  v.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('[data-close]')) return close();
    if (t.closest('[data-prev]')) return go(cur - 1, -1);
    if (t.closest('[data-next]')) return go(cur + 1, 1);
    var vb = t.closest('[data-var]');
    if (vb) {
      var n = +vb.dataset.var; if (n === vi) return;
      var sc = frame.querySelector('.ex-scroll'), ratio = sc ? sc.scrollTop / Math.max(1, sc.scrollHeight - sc.clientHeight) : 0;
      vi = n;
      vars.querySelectorAll('button').forEach(function (b) { var on = +b.dataset.var === vi; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
      pillTo();
      if (sc) {
        var tmp = document.createElement('div'); tmp.innerHTML = pageHTML(E[cur].vars[vi]);
        sc.animate([{ opacity: 1 }, { opacity: .35 }, { opacity: 1 }], { duration: reduce ? 1 : 520, easing: 'ease-out' });
        setTimeout(function () { sc.innerHTML = tmp.innerHTML; sc.scrollTop = ratio * (sc.scrollHeight - sc.clientHeight); }, reduce ? 0 : 200);
      }
      return;
    }
    if (t.closest('[data-hint]')) { var s = frame.querySelector('.ex-scroll'); if (s) s.scrollBy({ top: s.clientHeight * .8, behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (t.closest('[data-full]')) {
      if (E[cur].kind === 'phones') { var ph = frame.querySelector('.ex-phones'); if (ph) ph.scrollBy({ left: ph.clientWidth * .7, behavior: 'smooth' }); return; }
      var on = !v.classList.contains('is-full'); v.classList.toggle('is-full', on);
      full.textContent = on ? 'Show details' : 'Tap to view full page';
    }
  });
  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1, 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1, -1); }
    else if (e.key === 'Tab') {
      var f = [].filter.call(v.querySelectorAll('button, [tabindex="0"]'), function (x) { return x.offsetParent !== null && !x.closest('[hidden]'); });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  window.addEventListener('resize', function () { if (isOpen) pillTo(); });

  document.addEventListener('click', function (e) { var b = e.target.closest('[data-ex]'); if (!b) return; e.preventDefault(); open(b.dataset.ex); });
  if (window.matchMedia('(pointer: coarse)').matches) document.querySelectorAll('.t-tap').forEach(function (s) { s.textContent = 'Tap'; });
  var h = (location.hash || '').slice(1);
  if (E.some(function (e) { return e.id === h; })) setTimeout(function () { open(h); }, 300);
  window.openExploration = open;
})();
