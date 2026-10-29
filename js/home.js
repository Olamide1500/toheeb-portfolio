/* Home: the 7-project showcase. Desktop = hover the project bar. Phone = swipe or arrows. */
(function () {
  var P = [
    { word: 'web apps', c: '#1F4E5F', meta: 'Web app \u00b7 Real problem', title: 'Attendance system', img: 'img/home-01.jpg', kind: 'browser', href: 'attendance.html' },
    { word: 'mobile apps', c: '#6E2A42', meta: 'Mobile app \u00b7 Concept', title: 'FOND', img: 'img/home-02.webp', kind: 'phones', href: 'fond.html' },
    { word: 'savings apps', c: '#18224A', meta: 'Mobile app \u00b7 Personal project', title: 'GradSave', img: 'img/home-03.webp', kind: 'phones', href: 'gradsave.html' },
    { word: 'travel apps', c: '#6B6863', meta: 'Mobile app \u00b7 Ongoing', title: 'Routemate', img: 'img/home-04.webp', kind: 'phones', href: null },
    { word: 'responsive websites', c: '#003366', meta: 'Web \u00b7 Unsolicited redesign', title: 'WAEC result checker', img: 'img/home-05.webp', kind: 'phones', href: 'waec.html' },
    { word: 'fintech apps', c: '#10231E', meta: 'Mobile app \u00b7 Feature redesign', title: 'Refund tracker', img: 'img/home-06.webp', kind: 'phones', href: 'refund.html' },
    { word: 'e-commerce apps', c: '#006C49', meta: 'Mobile + web \u00b7 Unsolicited redesign', title: 'Jiji search redesign', img: 'img/home-07.webp', kind: 'phones', href: 'jiji.html' }
  ];
  var shots = document.getElementById('shots'), dock = document.getElementById('dock');
  if (!shots) return;
  var chip = document.getElementById('chip'), word = document.getElementById('chipWord');
  var pMeta = document.getElementById('pMeta'), pTitle = document.getElementById('pTitle'), pNote = document.getElementById('pNote'), plabel = document.getElementById('plabel');
  var mCounter = document.querySelector('#mCounter span'), mOpen = document.getElementById('mOpen');
  var cur = 0, t;
  var coarse = window.matchMedia('(hover: none)').matches;

  P.forEach(function (p, i) {
    var s = document.createElement('div');
    s.className = 'shot shot--' + p.kind + (i === 0 ? ' is-active' : '');
    var inner = '<img src="' + p.img + '" alt="' + p.title + ' screens" loading="' + (i === 0 ? 'eager' : 'lazy') + '" decoding="async">';
    s.innerHTML = p.href ? '<a href="' + p.href + '" data-cursor="Open" aria-label="Open ' + p.title + ' case study">' + inner + '</a>' : inner;
    var im = s.querySelector('img');
    im.addEventListener('error', function () { var ph = document.createElement('div'); ph.className = 'ph'; ph.style.background = p.c; ph.textContent = p.title; im.replaceWith(ph); });
    shots.appendChild(s);

    var a = document.createElement('a');
    a.href = p.href || '#';
    a.style.setProperty('--c', p.c);
    a.innerHTML = '<span>' + String(i + 1).padStart(2, '0') + '</span><span class="dock__name">' + p.title + ' <span class="arrow">\u2192</span></span>';
    if (i === 0) a.className = 'is-active';
    a.addEventListener('mouseenter', function () { go(i); });
    a.addEventListener('focus', function () { go(i); });
    a.addEventListener('click', function (e) {
      if (!p.href) { e.preventDefault(); return; }
      /* touch screens (tablets): first tap previews the project, second tap opens it */
      if (coarse && cur !== i) { e.preventDefault(); go(i); }
    });
    dock.appendChild(a);
  });

  function go(i) {
    i = (i + P.length) % P.length;
    if (i === cur) return;
    var p = P[i];
    shots.children[cur].classList.remove('is-active');
    shots.children[i].classList.add('is-active');
    dock.children[cur].classList.remove('is-active');
    dock.children[i].classList.add('is-active');
    cur = i;
    var n = String(i + 1).padStart(2, '0') + ' / 07';
    document.documentElement.style.setProperty('--cur', p.c);
    chip.style.setProperty('--chip-bg', p.c);
    word.classList.add('is-out');
    clearTimeout(t);
    t = setTimeout(function () { word.textContent = p.word; word.classList.remove('is-out'); }, 220);
    pMeta.textContent = n + ' \u00b7 ' + p.meta;
    pTitle.textContent = p.title;
    pNote.hidden = !!p.href;
    mCounter.textContent = n;
    var href = p.href || '#';
    plabel.setAttribute('href', href);
    if (p.href) { mOpen.className = 'btn btn--primary'; mOpen.innerHTML = 'Open case study <span class="arrow">\u2192</span>'; mOpen.href = href; }
    else { mOpen.className = 'btn btn--disabled'; mOpen.textContent = 'Coming soon'; mOpen.removeAttribute('href'); }
  }
  window.homeGo = go;

  document.getElementById('prev').addEventListener('click', function () { go(cur - 1); });
  document.getElementById('next').addEventListener('click', function () { go(cur + 1); });

  /* swipe on phones */
  var x0 = null, y0 = null;
  shots.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  shots.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  document.addEventListener('keydown', function (e) {
    if (e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowRight') go(cur + 1);
    if (e.key === 'ArrowLeft') go(cur - 1);
  });
})();
