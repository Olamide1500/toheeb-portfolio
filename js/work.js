/* All work: index rows, filters, phone accordion, desktop hover preview */
(function () {
  var P = [
    { no: '01', name: 'Attendance system', type: 'Web app', status: 'Real problem', tags: 'web', href: 'attendance.html', img: 'img/home-01.jpg', browser: true, tint: '#D7E5EA', feat: true,
      prob: 'My team had an attendance tool that was unclear and stressful, so everyone went back to a paper checklist.' },
    { no: '02', name: 'FOND', type: 'Mobile app', status: 'Concept', tags: 'mobile', href: 'fond.html', img: 'img/home-02.webp', tint: '#E9E0E1',
      prob: 'Dating apps show what someone looks like in a second, but what they want only after days of chatting.' },
    { no: '03', name: 'GradSave', type: 'Mobile app', status: 'Personal project', tags: 'mobile', href: 'gradsave.html', img: 'img/home-03.webp', tint: '#D9DCEC',
      prob: 'Students struggle to save, because irregular income and surprise expenses keep breaking their plans.' },
    { no: '04', name: 'Routemate', type: 'Mobile app', status: 'Ongoing', tags: 'mobile', href: null, img: null, tint: '#EDEAE5',
      prob: 'A travel app I’m designing now. The case study is coming soon.' },
    { no: '05', name: 'WAEC result checker', type: 'Web', status: 'Unsolicited redesign', tags: 'web redesign', href: 'waec.html', img: 'img/home-05.webp', tint: '#D6E1EC',
      prob: 'The result checker asks for 5 details, and a wrong one still uses up a check. The page doesn’t say what goes where.' },
    { no: '06', name: 'Refund tracker', type: 'Mobile app', status: 'Feature redesign', tags: 'mobile redesign', href: 'refund.html', img: 'img/home-06.webp', tint: '#F4E6DF',
      prob: 'When a transfer fails, nothing says if or when the money will come back, so people resend and risk a double debit.' },
    { no: '07', name: 'Jiji search redesign', type: 'Mobile + web', status: 'Unsolicited redesign', tags: 'mobile web redesign', href: 'jiji.html', img: 'img/home-07.webp', tint: '#DCE8E2',
      prob: 'Price, ratings, seller details and badges all look equally loud, so nothing tells a buyer where to look first.' }
  ];
  var index = document.getElementById('index');
  if (!index) return;
  var phone = window.matchMedia('(max-width: 767px)');
  var PLUS = '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 3v12M3 9h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var GO = '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 9h12m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  P.forEach(function (p, i) {
    var row = document.createElement('article');
    row.className = 'wk-row' + (p.feat ? ' is-feat' : '') + (p.href ? '' : ' is-soon');
    row.dataset.tags = p.tags; row.dataset.i = i;
    row.style.setProperty('--rt', p.tint);
    var cells = '<span class="wk-row__no">' + p.no + '</span><span class="wk-row__name">' + p.name + '</span>' +
      '<span class="wk-row__type">' + p.type + '</span><span class="wk-row__status">' + p.status + '</span>' +
      '<span class="wk-row__meta-m">' + p.type + ' &nbsp;·&nbsp; ' + p.status + '</span>' +
      '<span class="wk-row__go">' + (p.href ? '<span class="g-d">' + GO + '</span>' : '') + '<span class="g-m">' + PLUS + '</span></span>';
    var pid = 'wkp' + i;
    var img = p.img ? '<div class="wk-row__img' + (p.browser ? ' is-browser' : '') + '"><img src="' + p.img + '" alt="' + p.name + ' screens" loading="lazy" decoding="async"></div>'
      : '<div class="wk-row__img"><span class="ph-soon">In design</span></div>';
    var btns = p.href ? '<a class="btn btn--primary" href="' + p.href + '">View case study <span class="arrow">→</span></a><a class="text-link" href="' + p.href + '#quick">Open in Quick read · 1 min</a>'
      : '<span class="btn btn--disabled">Case study coming soon</span>';
    row.innerHTML = (p.href ? '<a class="wk-row__link" href="' + p.href + '" data-cursor="Open">' : '<div class="wk-row__link" aria-disabled="true">') + cells + (p.href ? '</a>' : '</div>') +
      '<div class="wk-row__panel" id="' + pid + '"><div><div class="wk-row__inner">' + img + '<p class="wk-row__prob">' + p.prob + '</p>' + btns + '</div></div></div>';
    index.appendChild(row);

    var link = row.querySelector('.wk-row__link');
    link.addEventListener('click', function (e) {
      if (!phone.matches) { if (!p.href) e.preventDefault(); return; }
      e.preventDefault();
      var open = !row.classList.contains('is-open');
      index.querySelectorAll('.wk-row.is-open').forEach(function (r) { if (r !== row) { r.classList.remove('is-open'); r.querySelector('.wk-row__link').setAttribute('aria-expanded', 'false'); } });
      row.classList.toggle('is-open', open);
      link.setAttribute('aria-expanded', String(open));
    });
  });
  /* icons: arrow on desktop, plus on phone */
  var st = document.createElement('style');
  st.textContent = '.wk-row__go .g-m{display:none}@media (max-width:767px){.wk-row__go .g-d{display:none}.wk-row__go .g-m{display:grid}}.wk-row__go span{display:grid;place-items:center}.wk-row__go svg{width:18px;height:18px}';
  document.head.appendChild(st);
  function setAria() {
    index.querySelectorAll('.wk-row__link').forEach(function (l, i) {
      if (phone.matches) { l.setAttribute('role', 'button'); l.setAttribute('aria-expanded', String(l.parentNode.classList.contains('is-open'))); l.setAttribute('aria-controls', 'wkp' + l.parentNode.dataset.i); }
      else { l.removeAttribute('aria-expanded'); l.removeAttribute('aria-controls'); if (l.tagName === 'A') l.removeAttribute('role'); }
    });
  }
  setAria(); phone.addEventListener('change', setAria);

  /* ---------- filters ---------- */
  var box = document.getElementById('filters'), pill = box.querySelector('.wk-filters__pill');
  var feat = document.querySelector('.wk-feat'), empty = document.getElementById('wkEmpty');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function place(b) { pill.style.setProperty('--pill-x', b.offsetLeft + 'px'); pill.style.setProperty('--pill-y', b.offsetTop + 'px'); pill.style.setProperty('--pill-w', b.offsetWidth + 'px'); }
  var on = box.querySelector('.is-on'); place(on);
  requestAnimationFrame(function () { box.classList.add('is-ready'); });
  window.addEventListener('resize', function () { place(box.querySelector('.is-on')); });
  if (document.fonts) document.fonts.ready.then(function () { place(box.querySelector('.is-on')); });
  function match(el, f) { return f === 'all' || (' ' + el.dataset.tags + ' ').indexOf(' ' + f + ' ') > -1; }
  box.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.classList.contains('is-on')) return;
    box.querySelectorAll('button').forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    place(b);
    var f = b.dataset.f;
    var rows = [].slice.call(index.querySelectorAll('.wk-row')).concat(feat ? [feat] : []);
    var before = new Map(); rows.forEach(function (r) { before.set(r, r.getBoundingClientRect().top); });
    var shown = 0;
    rows.forEach(function (r) { var m = match(r, f); r.classList.toggle('is-out', !m); if (r === feat) r.hidden = !m; else if (m && (!r.classList.contains('is-feat') || phone.matches)) shown++; });
    if (feat && !feat.hidden && !phone.matches) shown++;
    empty.hidden = shown > 0;
    if (reduce) return;
    /* slide rows into their new places, fade new ones in */
    rows.forEach(function (r) {
      if (r.classList.contains('is-out') || r.hidden) return;
      var was = before.get(r), now = r.getBoundingClientRect().top;
      if (r.offsetParent === null) return;
      var fromHidden = was === 0 && now !== 0;
      r.animate(fromHidden ? [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }]
        : [{ transform: 'translateY(' + (was - now) + 'px)' }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)' });
    });
  });

  /* ---------- desktop hover preview that trails the pointer ---------- */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!fine.matches || reduce) return;
  var peek = document.createElement('div'); peek.className = 'wk-peek'; peek.setAttribute('aria-hidden', 'true');
  P.forEach(function (p, i) {
    if (p.feat) return;
    var el;
    if (p.img) { el = document.createElement('img'); el.src = p.img; el.alt = ''; el.loading = 'lazy'; }
    else { el = document.createElement('span'); el.className = 'ph-soon'; el.textContent = 'In design'; el.style.opacity = 0; }
    el.dataset.i = i; peek.appendChild(el);
  });
  document.body.appendChild(peek);
  var x = 0, y = 0, tx = 0, ty = 0, lastX = 0, active = false, raf = 0;
  function tick() {
    x += (tx - x) * .14; y += (ty - y) * .14;
    var vx = tx - lastX; lastX += (tx - lastX) * .2;
    var r = Math.max(-8, Math.min(8, vx * .08));
    peek.style.setProperty('--x', (x + 28) + 'px'); peek.style.setProperty('--y', (y - peek.offsetHeight / 2) + 'px'); peek.style.setProperty('--r', r + 'deg');
    if (active || Math.abs(tx - x) > .5 || Math.abs(ty - y) > .5) raf = requestAnimationFrame(tick); else raf = 0;
  }
  index.addEventListener('pointermove', function (e) {
    tx = e.clientX; ty = e.clientY;
    if (!active) { x = tx; y = ty; lastX = tx; }
    var row = e.target.closest('.wk-row');
    if (!row || phone.matches) { hide(); return; }
    var i = +row.dataset.i;
    peek.style.setProperty('--pt', P[i].tint);
    peek.querySelectorAll('[data-i]').forEach(function (el) { var is = +el.dataset.i === i; el.classList.toggle('is-on', is); if (el.tagName === 'SPAN') el.style.opacity = is ? 1 : 0; });
    active = true; peek.classList.add('is-on');
    if (!raf) raf = requestAnimationFrame(tick);
  });
  function hide() { active = false; peek.classList.remove('is-on'); }
  index.addEventListener('pointerleave', hide);
  window.addEventListener('scroll', function () { if (active) { var el = document.elementFromPoint(tx, ty); if (!el || !el.closest('.wk-row')) hide(); } }, { passive: true });
})();
