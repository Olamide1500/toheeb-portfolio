/* Intro \u00b7 "Too many choices" \u2014 rebuilt from the Figma motion timeline.
   Plays once per visit, can be skipped, and is skipped for people who prefer reduced motion. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var forced = /(^|[?&#])intro\b/.test(location.search + location.hash);
  var seen = false;
  try { seen = sessionStorage.getItem('toheebIntroSeen') === '1'; } catch (e) {}
  if (!Element.prototype.animate || reduce || (seen && !forced)) return;

  var homePage = document.querySelector('.home-page');
  var realLogo = document.getElementById('logo');
  var mobile = window.innerWidth < 700 || window.innerWidth / window.innerHeight < 0.8;
  var W = mobile ? 402 : 1440, H = mobile ? 874 : 900;

  var F = { d: 'var(--f-display)', s: 'var(--f-sans)', m: 'var(--f-mono)', i: 'var(--f-serif)' };
  function mk(parent, o) {
    var e = document.createElement('div');
    e.className = 'ab' + (o.cls ? ' ' + o.cls : '');
    var st = e.style;
    if (o.x !== undefined) st.left = o.x + 'px';
    if (o.y !== undefined) st.top = o.y + 'px';
    if (o.w !== undefined) st.width = o.w + 'px';
    if (o.h !== undefined) st.height = o.h + 'px';
    if (o.bg) st.background = o.bg;
    if (o.r !== undefined) st.borderRadius = o.r + 'px';
    if (o.b) st.border = o.b;
    if (o.css) Object.assign(st, o.css);
    if (o.html !== undefined) e.innerHTML = o.html;
    parent.appendChild(e);
    return e;
  }
  function tx(parent, text, x, y, size, font, color, more) {
    more = more || {};
    var css = Object.assign({ fontFamily: font, fontSize: size + 'px', color: color, lineHeight: more.lh || 1.25, whiteSpace: more.w ? 'normal' : 'nowrap', fontWeight: more.fw || 400, letterSpacing: (more.ls || 0) + 'px', textAlign: more.align || 'left' }, more.css || {});
    return mk(parent, { x: x, y: y, w: more.w, html: text, css: css });
  }
  function center(el, width) { el.style.left = '0px'; el.style.width = width + 'px'; el.style.textAlign = 'center'; }
  function splitWords(el) { el.innerHTML = el.textContent.split(' ').map(function (w) { return '<span class="w" style="display:inline-block">' + w + '</span>'; }).join(' '); return el.querySelectorAll('.w'); }
  function splitChars(el) {
    var lines = el.innerHTML.split('<br>');
    el.innerHTML = lines.map(function (l) { return l.split('').map(function (ch) { return ch === ' ' ? ' ' : '<span class="c" style="display:inline-block">' + ch + '</span>'; }).join(''); }).join('<br>');
    return el.querySelectorAll('.c');
  }

  /* ---------- overlay + stage ---------- */
  var intro = document.createElement('div');
  intro.className = 'intro';
  intro.setAttribute('aria-hidden', 'true');
  var stage = mk(intro, { cls: 'intro__stage', w: W, h: H });
  stage.style.position = 'absolute';
  var skip = document.createElement('button');
  skip.className = 'intro__skip';
  skip.textContent = 'Skip intro  \u2192';
  document.body.appendChild(intro);
  document.body.appendChild(skip);
  document.documentElement.style.overflow = 'hidden';
  homePage.style.opacity = '0';

  function fit() {
    var s = Math.min(window.innerWidth / W, window.innerHeight / H);
    stage.style.transform = 'translate(' + (-W * s / 2) + 'px,' + (-H * s / 2) + 'px) scale(' + s + ')';
    return s;
  }
  var S = fit();
  window.addEventListener('resize', function () { S = fit(); });

  var cam = mk(stage, { x: 0, y: 0, w: W, h: H, css: { transformOrigin: '50% 50%' } });
  var cursor = '<svg width="20" height="28" viewBox="-1 -1 19 28"><path d="M0 0v22l6-5.5 4.5 9.5 3.5-1.5-4.3-9H17.5z" fill="#1A1714" stroke="#fff" stroke-width="1.5"/></svg>';
  var badgeCol = { 'NEW': '#2E7D32', 'MOST POPULAR': '#6A1B9A', 'HOT \ud83d\udd25': '#E65100', 'BEST VALUE!': '#D32F2F', 'LIMITED': '#F9A825' };
  var plans = [['Basic', '\u20a62,900', '\u20a64,500', 'SD \u00b7 1 screen \u00b7 Ads', null], ['Basic+', '\u20a63,900', '\u20a65,900', 'HD \u00b7 1 screen \u00b7 Ads', 'NEW'], ['Standard', '\u20a64,900', '\u20a67,500', 'HD \u00b7 2 screens', 'MOST POPULAR'], ['Standard Plus', '\u20a65,900', '\u20a68,900', 'HD \u00b7 2 screens \u00b7 Downloads', 'HOT \ud83d\udd25'], ['Premium', '\u20a67,900', '\u20a611,900', '4K \u00b7 4 screens', 'BEST VALUE!'], ['Premium Max', '\u20a68,900', '\u20a612,900', '4K \u00b7 4 screens \u00b7 Extras', null], ['Ultra', '\u20a69,900', '\u20a614,900', '4K \u00b7 5 screens', 'LIMITED'], ['Ultra Family', '\u20a612,900', '\u20a618,900', '4K \u00b7 6 screens \u00b7 Kids', 'BEST VALUE!']];
  var cleanP = [['Basic', '\u20a62,900', 'SD \u00b7 1 screen'], ['Standard', '\u20a64,900', 'HD \u00b7 2 screens \u00b7 No ads'], ['Premium', '\u20a67,900', '4K \u00b7 4 screens \u00b7 No ads']];
  function chips(parent, list, gap, pad, fs) {
    var x = 0;
    list.forEach(function (c) {
      var on = c[1];
      var e = mk(parent, { x: x, y: 0, h: 36, r: 18, bg: on ? '#1A1714' : '#F1EFEB', html: c[0], css: { padding: '0 ' + pad + 'px', lineHeight: '36px', fontFamily: F.s, fontWeight: 500, fontSize: fs + 'px', color: on ? '#fff' : '#1A1714', whiteSpace: 'nowrap' } });
      x += e.offsetWidth + gap;
    });
  }

  var OUT = 'cubic-bezier(.16,1,.3,1)', CINE = 'cubic-bezier(.65,0,.2,1)', IO = 'cubic-bezier(.45,0,.55,1)', SPRING = 'cubic-bezier(.34,1.56,.64,1)', BOUNCE = 'cubic-bezier(.3,1.9,.6,1)', IN = 'cubic-bezier(.5,0,.75,0)';
  var anims = [], timers = [], T0 = 0, killed = false;
  var st = new Map();
  var queue = [];
  var el = {};
  if (!mobile) buildDesktop(); else buildMobile();
  buildEnding();
    if (!mobile) timeDesktop(); else timeMobile();
  var end = timeEnding();
  call(end, function () { finish(false); });
  var started = false;
  function go() { if (started) return; started = true; run(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); setTimeout(go, 1200);
  skip.addEventListener('click', function () { killed = true; anims.forEach(function (a) { a.cancel(); }); timers.forEach(clearTimeout); finish(true); });

  /* ================= desktop scene ================= */
  function buildDesktop() {
    var win = mk(cam, { x: 160, y: 90, w: 1120, h: 720, r: 18, bg: '#fff', css: { overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,.5)' } });
    el.banner = mk(win, { x: 0, y: 0, w: 1120, h: 40, bg: '#D32F2F' });
    var bt = tx(el.banner, '\u26a1&nbsp; FLASH SALE \u00b7 70% OFF EVERYTHING \u00b7 ENDS IN 02:14:59 &nbsp;\u26a1', 0, 11, 14, F.m, '#fff'); center(bt, 1120);
    tx(win, 'StreamPlus', 48, 56, 22, F.d, '#1A1714', { fw: 700 });
    tx(win, 'Movies &nbsp;&nbsp; Series &nbsp;&nbsp; Kids &nbsp;&nbsp; Sign in', 760, 61, 15, F.s, '#4A4642', { fw: 500 });
    tx(win, 'Choose your plan', 48, 104, 30, F.d, '#1A1714', { fw: 700 });
    el.fine = tx(win, '*Prices may change. T&amp;Cs apply. Auto-renews.', 330, 116, 14, F.s, '#8A867F');
    el.chipsOld = mk(win, { x: 48, y: 152, w: 800, h: 36 });
    chips(el.chipsOld, [['Monthly', 1], ['Yearly &nbsp;\u221220%'], ['Weekly'], ['Family'], ['Student'], ['Business']], 8, 16, 14);
    el.cards = []; el.badges = [];
    plans.forEach(function (p, i) {
      var r = Math.floor(i / 4), c = i % 4, x = 48 + c * 260, y = 204 + r * 212;
      var cd = mk(win, { x: x, y: y, w: 244, h: 196, r: 14, bg: '#fff', b: '1.5px solid #E2DED8' });
      tx(cd, p[0], 18, 18, 18, F.s, '#1A1714', { fw: 700 });
      tx(cd, p[2], 18, 50, 14, F.m, '#8A867F', { css: { textDecoration: 'line-through' } });
      tx(cd, p[1] + '/mo', 18, 68, 26, F.d, '#1A1714', { fw: 700 });
      tx(cd, p[3], 18, 108, 14, F.s, '#6B6863');
      var sb = mk(cd, { x: 18, y: 144, w: 208, h: 36, r: 10, b: '1px solid rgba(26,23,20,.25)' }); var st = tx(sb, 'Select', 0, 9, 14, F.s, '#1A1714', { fw: 500 }); center(st, 206);
      el.cards.push(cd);
      if (p[4]) { var bd = mk(win, { y: y - 10, h: 24, r: 12, bg: badgeCol[p[4]], html: p[4], css: { padding: '0 10px', lineHeight: '24px', fontFamily: F.m, fontSize: '12px', color: p[4] === 'LIMITED' ? '#1A1714' : '#fff', whiteSpace: 'nowrap' } }); bd.style.left = (x + 244 - bd.offsetWidth - 12) + 'px'; el.badges.push(bd); }
    });
    el.chat = mk(win, { x: 1032, y: 566, w: 60, h: 60, r: 30, bg: '#1565C0', html: '<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:22px">\ud83d\udcac</div><div style="position:absolute;left:42px;top:-2px;width:20px;height:20px;border-radius:10px;background:#D32F2F;color:#fff;font:12px/20px var(--f-mono);text-align:center">1</div>' });
    el.cookie = mk(win, { x: 0, y: 664, w: 1120, h: 56, bg: '#1A1714' });
    tx(el.cookie, 'We use cookies to improve your experience and for marketing.', 48, 19, 14, F.s, '#D6D1C9');
    mk(el.cookie, { x: 820, y: 11, w: 120, h: 34, r: 8, bg: '#FAF9F7', html: 'Accept all', css: { font: '700 14px/34px var(--f-sans)', textAlign: 'center', color: '#1A1714' } });
    mk(el.cookie, { x: 952, y: 11, w: 100, h: 34, r: 8, b: '1px solid rgba(250,249,247,.4)', html: 'Settings', css: { font: '500 14px/32px var(--f-sans)', textAlign: 'center', color: '#FAF9F7' } });
    el.shade = mk(win, { x: 0, y: 0, w: 1120, h: 720, bg: 'rgba(26,23,20,.45)', css: { opacity: 0 } });
    el.pop = mk(win, { x: 340, y: 215, w: 440, h: 290, r: 18, bg: '#fff', css: { boxShadow: '0 20px 50px rgba(0,0,0,.3)', opacity: 0 } });
    tx(el.pop, 'Wait! Don\u2019t leave yet \ud83d\ude22', 28, 28, 24, F.d, '#1A1714', { fw: 700 });
    tx(el.pop, 'Get 10% off your first month.', 28, 66, 16, F.s, '#4A4642');
    var em = mk(el.pop, { x: 28, y: 102, w: 384, h: 44, r: 10, b: '1.5px solid #D9D5CF' }); tx(em, 'Enter your email', 14, 11, 15, F.s, '#8A867F');
    mk(el.pop, { x: 28, y: 158, w: 384, h: 48, r: 10, bg: '#E65100', html: 'Claim my 10% off', css: { font: '700 16px/48px var(--f-sans)', textAlign: 'center', color: '#fff' } });
    var nt = tx(el.pop, 'No thanks, I don\u2019t like saving money', 0, 226, 14, F.s, '#8A867F', { fw: 500 }); center(nt, 440);
    tx(el.pop, '\u00d7', 404, 14, 24, F.s, '#8A867F');
    el.chipsNew = mk(win, { x: 450, y: 150, w: 220, h: 40, r: 20, bg: '#F1EFEB', css: { opacity: 0 } });
    mk(el.chipsNew, { x: 4, y: 4, w: 108, h: 32, r: 16, bg: '#1A1714', html: 'Monthly', css: { font: '500 14px/32px var(--f-sans)', color: '#fff', textAlign: 'center' } });
    tx(el.chipsNew, 'Yearly', 112, 11, 14, F.s, '#1A1714', { fw: 500, w: 104, align: 'center' });
    el.clean = [];
    cleanP.forEach(function (p, i) {
      var rec = i === 1, x = 86 + i * 324;
      var cd = mk(win, { x: x, y: rec ? 212 : 232, w: 300, h: rec ? 320 : 280, r: 18, bg: '#fff', b: rec ? '2px solid #1A1714' : '1.5px solid #E2DED8', css: { opacity: 0 } });
      var oy = rec ? 62 : 28;
      if (rec) mk(cd, { x: 24, y: 22, h: 26, r: 13, bg: '#1F4E5F', html: 'RECOMMENDED', css: { padding: '0 12px', font: '12px/26px var(--f-mono)', color: '#fff' } });
      tx(cd, p[0], 24, oy, 20, F.s, '#1A1714', { fw: 700 });
      var pr = tx(cd, p[1], 24, oy + 32, 40, F.d, '#1A1714', { fw: 700, ls: -1 });
      tx(cd, '/month', 24 + pr.offsetWidth + 6, oy + 54, 15, F.s, '#6B6863');
      tx(cd, p[2], 24, oy + 96, 15, F.s, '#4A4642');
      el.clean.push(cd);
      if (rec) {
        el.cta = mk(cd, { x: 24, y: 248, w: 252, h: 52, r: 14, bg: '#1A1714', html: 'Start free trial', css: { font: '700 16px/52px var(--f-sans)', color: '#FAF9F7', textAlign: 'center' } });
        el.done = mk(cd, { x: 24, y: 248, w: 252, h: 52, r: 14, bg: '#1F7A4D', html: '\u2713&nbsp; You\u2019re in', css: { font: '700 16px/52px var(--f-sans)', color: '#fff', textAlign: 'center', opacity: 0 } });
      }
    });
    el.cursor = mk(cam, { x: 720, y: 580, html: cursor, css: { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.25))', opacity: 0 } });
    el.dim = mk(stage, { x: 0, y: 0, w: W, h: H, bg: '#0B0A09', css: { opacity: 0 } });
    el.vig = mk(stage, { x: 0, y: 0, w: W, h: H, bg: 'radial-gradient(closest-side, rgba(0,0,0,0) 55%, rgba(0,0,0,.4))', css: { opacity: 0 } });
    el.msg1 = tx(stage, 'Too many choices slow people down.', 0, 400, 64, F.d, '#FAF9F7', { fw: 700, ls: -2 }); center(el.msg1, W);
    el.cLab = tx(stage, 'STILL DECIDING', 160, 46, 14, F.m, '#A8A39B', { css: { opacity: 0 } });
    el.cVal = tx(stage, '0.0s', 300, 46, 14, F.m, '#E8A07A', { css: { opacity: 0 } });
  }

  /* ================= mobile scene ================= */
  function buildMobile() {
    var pg = mk(cam, { x: 0, y: 0, w: 402, h: 874, bg: '#fff', css: { overflow: 'hidden' } });
    tx(pg, '9:41', 28, 14, 15, F.s, '#1A1714', { fw: 700 });
    tx(pg, '\u25cf\u25cf\u25cf \u25ae', 318, 14, 14, F.s, '#1A1714');
    el.banner = mk(pg, { x: 0, y: 44, w: 402, h: 34, bg: '#D32F2F' });
    var bt = tx(el.banner, '\u26a1 70% OFF \u00b7 ENDS IN 02:14:59 \u26a1', 0, 8, 14, F.m, '#fff'); center(bt, 402);
    tx(pg, 'StreamPlus', 24, 92, 20, F.d, '#1A1714', { fw: 700 });
    tx(pg, '\u2630', 356, 88, 22, F.s, '#1A1714');
    tx(pg, 'Choose your plan', 24, 140, 28, F.d, '#1A1714', { fw: 700 });
    el.fine = tx(pg, '*Prices may change. T&amp;Cs apply.', 24, 180, 14, F.s, '#8A867F');
    el.chipsOld = mk(pg, { x: 24, y: 212, w: 600, h: 36 });
    chips(el.chipsOld, [['Monthly', 1], ['Yearly \u221220%'], ['Weekly'], ['Family'], ['Student']], 8, 14, 14);
    el.row = mk(pg, { x: 24, y: 264, w: 8 * 244, h: 310 });
    el.cards = [];
    plans.forEach(function (p, i) {
      var cd = mk(el.row, { x: i * 244, y: 0, w: 230, h: 300, r: 16, bg: '#fff', b: '1.5px solid #E2DED8' });
      if (p[4]) mk(cd, { x: 16, y: 16, h: 26, r: 13, bg: badgeCol[p[4]], html: p[4], css: { padding: '0 10px', font: '12px/26px var(--f-mono)', color: p[4] === 'LIMITED' ? '#1A1714' : '#fff', whiteSpace: 'nowrap' } });
      tx(cd, p[0], 18, 58, 19, F.s, '#1A1714', { fw: 700 });
      tx(cd, p[2], 18, 92, 14, F.m, '#8A867F', { css: { textDecoration: 'line-through' } });
      tx(cd, p[1] + '/mo', 18, 112, 30, F.d, '#1A1714', { fw: 700 });
      tx(cd, p[3], 18, 160, 15, F.s, '#6B6863', { w: 194, lh: 1.35 });
      var sb = mk(cd, { x: 18, y: 238, w: 194, h: 44, r: 12, b: '1px solid rgba(26,23,20,.25)' }); var st = tx(sb, 'Select', 0, 12, 15, F.s, '#1A1714', { fw: 500 }); center(st, 192);
      el.cards.push(cd);
    });
    el.promo = mk(pg, { x: 24, y: 592, w: 354, h: 64, r: 14, bg: '#FFF3C4' }); tx(el.promo, '\ud83c\udf81&nbsp; Refer a friend, get 1 month free!', 16, 21, 15, F.s, '#5D4300', { fw: 500 });
    el.compare = tx(pg, 'Compare all 8 plans \u203a', 24, 676, 15, F.s, '#1565C0', { fw: 500 });
    el.chat = mk(pg, { x: 322, y: 700, w: 56, h: 56, r: 28, bg: '#1565C0', html: '<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:22px">\ud83d\udcac</div><div style="position:absolute;left:38px;top:-2px;width:20px;height:20px;border-radius:10px;background:#D32F2F;color:#fff;font:12px/20px var(--f-mono);text-align:center">1</div>' });
    el.cookie = mk(pg, { x: 0, y: 778, w: 402, h: 96, bg: '#1A1714' });
    tx(el.cookie, 'We use cookies to improve your experience and for marketing.', 24, 16, 14, F.s, '#D6D1C9', { w: 230, lh: 1.35 });
    mk(el.cookie, { x: 282, y: 22, w: 96, h: 40, r: 10, bg: '#FAF9F7', html: 'Accept', css: { font: '700 14px/40px var(--f-sans)', color: '#1A1714', textAlign: 'center' } });
    el.shade = mk(pg, { x: 0, y: 0, w: 402, h: 874, bg: 'rgba(26,23,20,.45)', css: { opacity: 0 } });
    el.sheet = mk(pg, { x: 0, y: 484, w: 402, h: 420, bg: '#fff', css: { borderRadius: '24px 24px 0 0' } });
    mk(el.sheet, { x: 181, y: 12, w: 40, h: 4, r: 2, bg: '#D9D5CF' });
    tx(el.sheet, 'Wait! Don\u2019t leave yet \ud83d\ude22', 24, 40, 24, F.d, '#1A1714', { fw: 700 });
    tx(el.sheet, 'Get 10% off your first month.', 24, 78, 16, F.s, '#4A4642');
    var em = mk(el.sheet, { x: 24, y: 116, w: 354, h: 48, r: 12, b: '1.5px solid #D9D5CF' }); tx(em, 'Enter your email', 16, 13, 15, F.s, '#8A867F');
    mk(el.sheet, { x: 24, y: 180, w: 354, h: 54, r: 12, bg: '#E65100', html: 'Claim my 10% off', css: { font: '700 16px/54px var(--f-sans)', color: '#fff', textAlign: 'center' } });
    var nt = tx(el.sheet, 'No thanks, I don\u2019t like saving money', 0, 256, 14, F.s, '#8A867F', { fw: 500 }); center(nt, 402);
    el.chipsNew = mk(pg, { x: 24, y: 212, w: 220, h: 40, r: 20, bg: '#F1EFEB', css: { opacity: 0 } });
    mk(el.chipsNew, { x: 4, y: 4, w: 108, h: 32, r: 16, bg: '#1A1714', html: 'Monthly', css: { font: '500 14px/32px var(--f-sans)', color: '#fff', textAlign: 'center' } });
    tx(el.chipsNew, 'Yearly', 112, 11, 14, F.s, '#1A1714', { fw: 500, w: 104, align: 'center' });
    el.clean = [];
    [['Basic', '\u20a62,900', 'SD \u00b7 1 screen', 272, 92, false], ['Standard', '\u20a64,900', 'HD \u00b7 2 screens \u00b7 No ads', 380, 150, true], ['Premium', '\u20a67,900', '4K \u00b7 4 screens \u00b7 No ads', 546, 92, false]].forEach(function (c) {
      var cd = mk(pg, { x: 24, y: c[3], w: 354, h: c[4], r: 16, bg: '#fff', b: c[5] ? '2px solid #1A1714' : '1.5px solid #E2DED8', css: { opacity: 0 } });
      var oy = 20;
      if (c[5]) { mk(cd, { x: 20, y: 18, h: 26, r: 13, bg: '#1F4E5F', html: 'RECOMMENDED', css: { padding: '0 12px', font: '12px/26px var(--f-mono)', color: '#fff' } }); oy = 58; }
      tx(cd, c[0], 20, oy, 19, F.s, '#1A1714', { fw: 700 });
      var pr = tx(cd, c[1], 0, oy - 6, 28, F.d, '#1A1714', { fw: 700 }); pr.style.left = 'auto'; pr.style.right = '20px';
      tx(cd, c[2], 20, oy + 32, 15, F.s, '#6B6863');
      el.clean.push(cd);
    });
    el.cta = mk(pg, { x: 24, y: 770, w: 354, h: 58, r: 16, bg: '#1A1714', html: 'Start free trial', css: { font: '700 17px/58px var(--f-sans)', color: '#FAF9F7', textAlign: 'center', opacity: 0 } });
    el.done = mk(pg, { x: 24, y: 770, w: 354, h: 58, r: 16, bg: '#1F7A4D', html: '\u2713&nbsp; You\u2019re in', css: { font: '700 17px/58px var(--f-sans)', color: '#fff', textAlign: 'center', opacity: 0 } });
    el.cancel = tx(pg, 'Cancel anytime', 0, 836, 14, F.s, '#8A867F', { css: { opacity: 0 } }); center(el.cancel, 402);
    el.touch = mk(cam, { x: 0, y: 0, w: 44, h: 44, r: 22, bg: 'rgba(26,23,20,.28)', css: { opacity: 0 } });
    el.rip = mk(cam, { x: 0, y: 0, w: 44, h: 44, r: 22, bg: 'rgba(26,23,20,.25)', css: { opacity: 0 } });
    el.pill = mk(stage, { x: 24, y: 724, w: 196, h: 34, r: 17, bg: '#1A1714', css: { boxShadow: '0 6px 16px rgba(0,0,0,.25)', opacity: 0 } });
    el.cLab = tx(el.pill, 'STILL DECIDING', 14, 9, 13, F.m, '#A8A39B');
    el.cVal = tx(el.pill, '0.0s', 140, 9, 13, F.m, '#E8A07A');
    el.dim = mk(stage, { x: 0, y: 0, w: W, h: H, bg: '#0B0A09', css: { opacity: 0 } });
    el.vig = mk(stage, { x: 0, y: 0, w: W, h: H, bg: 'radial-gradient(closest-side, rgba(0,0,0,0) 50%, rgba(0,0,0,.4))', css: { opacity: 0 } });
    el.msg1 = tx(stage, 'Too many choices slow people down.', 24, 380, 38, F.d, '#FAF9F7', { fw: 700, ls: -1.2, w: 354, lh: 1.05, align: 'center' });
  }

  /* ================= ending (both) ================= */
  function buildEnding() {
    el.black = mk(stage, { x: -W, y: -H, w: W * 3, h: H * 3, bg: '#0B0A09' });
    if (!mobile) {
      el.msg2 = tx(stage, 'Fewer choices. Faster decisions.', 0, 400, 64, F.d, '#FAF9F7', { fw: 700, ls: -2 }); center(el.msg2, W);
      el.su = tx(stage, 'Sulaimon', 0, 350, 128, F.d, '#FAF9F7', { fw: 700, ls: -5 });
      el.to = tx(stage, 'Toheeb', 0, 350, 128, F.d, '#FAF9F7', { fw: 700, ls: -5 });
      var gap = 36, tw = el.su.offsetWidth + gap + el.to.offsetWidth, x0 = (W - tw) / 2;
      el.su.style.left = x0 + 'px'; el.to.style.left = (x0 + el.su.offsetWidth + gap) + 'px';
      el.role = tx(stage, 'Product Designer', 0, 500, 56, F.i, '#D9774F', { css: { fontStyle: 'italic' } }); center(el.role, W);
      el.wel = tx(stage, '<span style="display:inline-block;width:40px;height:1px;background:#A8A39B;vertical-align:middle;margin-right:14px"></span>TAKE A LOOK AROUND<span style="display:inline-block;width:40px;height:1px;background:#A8A39B;vertical-align:middle;margin-left:14px"></span>', 0, 640, 16, F.m, '#A8A39B', { ls: 2 }); center(el.wel, W);
    } else {
      el.msg2 = tx(stage, 'Fewer choices. Faster decisions.', 24, 392, 38, F.d, '#FAF9F7', { fw: 700, ls: -1.2, w: 354, lh: 1.05, align: 'center' });
      el.su = tx(stage, 'Sulaimon', 0, 330, 72, F.d, '#FAF9F7', { fw: 700, ls: -3, lh: .95 }); center(el.su, W);
      el.to = tx(stage, 'Toheeb', 0, 398, 72, F.d, '#FAF9F7', { fw: 700, ls: -3, lh: .95 }); center(el.to, W);
      el.role = tx(stage, 'Product Designer', 0, 500, 34, F.i, '#D9774F', { css: { fontStyle: 'italic' } }); center(el.role, W);
      el.wel = tx(stage, '<span style="display:inline-block;width:28px;height:1px;background:#A8A39B;vertical-align:middle;margin-right:12px"></span>TAKE A LOOK AROUND<span style="display:inline-block;width:28px;height:1px;background:#A8A39B;vertical-align:middle;margin-left:12px"></span>', 0, 580, 14, F.m, '#A8A39B', { ls: 2 }); center(el.wel, W);
    }
    [el.msg2, el.su, el.to, el.role, el.wel].forEach(function (e) { e.style.opacity = 0; });
  }

  /* ---------- tiny timeline engine (Web Animations API, no library) ---------- */
  function state(e) { if (!st.has(e)) st.set(e, { x: 0, y: 0, scale: 1, opacity: parseFloat(getComputedStyle(e).opacity), filter: 'blur(0px)', backgroundColor: getComputedStyle(e).backgroundColor, color: getComputedStyle(e).color, letterSpacing: getComputedStyle(e).letterSpacing }); return st.get(e); }
  function frame(s, keys) { var f = {}; keys.forEach(function (k) { if (k === 'x' || k === 'y') f.translate = s.x + 'px ' + s.y + 'px'; else if (k === 'scale') f.scale = String(s.scale); else f[k] = s[k]; }); return f; }
  function at(t, targets, vars, dur, ease) { (targets.length !== undefined && !targets.nodeType ? Array.prototype.slice.call(targets) : [targets]).forEach(function (e, i) { queue.push({ t: t + (vars.stagger || 0) * i, e: e, v: vars, d: dur || 0.001, ease: ease || 'linear', seq: queue.length }); }); }
  function fromTo(t, targets, from, to, dur, ease, stagger) { Array.prototype.slice.call(targets).forEach(function (e, i) { at(t + (stagger || 0) * i - 0.0005, e, Object.assign({}, from), 0.001); at(t + (stagger || 0) * i, e, Object.assign({}, to), dur, ease); }); }
  function call(t, fn) { queue.push({ t: t, fn: fn, seq: queue.length }); }
  function setText(t, e, s, color) { call(t, function () { e.textContent = s; if (color) e.style.color = color; }); }
  function words(t, e, dur, dist) { at(t, e, { opacity: 1 }); fromTo(t, splitWords(e), { y: dist || 24, opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)' }, dur * 0.6, OUT, dur * 0.4 / 5); }
  function path(target, pts, rx, ry) {
    at(pts[0][0], target, { x: pts[0][1] - rx, y: pts[0][2] - ry });
    for (var i = 1; i < pts.length; i++) { var p = pts[i], q = pts[i - 1]; if (p[3] === 'hold') continue; at(q[0], target, { x: p[1] - rx, y: p[2] - ry }, p[0] - q[0], p[3] || IO); }
  }
  function run() {
    queue.sort(function (a, b) { return a.t - b.t || a.seq - b.seq; });
    T0 = performance.now();
    queue.forEach(function (q) {
      if (q.fn) { timers.push(setTimeout(function () { if (!killed) q.fn(); }, q.t * 1000)); return; }
      var s = state(q.e), keys = Object.keys(q.v).filter(function (k) { return k !== 'stagger'; });
      var from = frame(s, keys);
      keys.forEach(function (k) { s[k] = q.v[k]; });
      var to = frame(s, keys);
      anims.push(q.e.animate([from, to], { delay: q.t * 1000, duration: Math.max(1, q.d * 1000), easing: q.ease, fill: 'forwards' }));
    });
  }
  /* ================= desktop timeline ================= */
  function timeDesktop() {
    at(0, el.black, { opacity: 1 }); at(0, el.black, { opacity: 0 }, 0.5, OUT);
    var S0 = 1.9;
    at(0, cam, { scale: S0, y: -S0 * (390 - 450) });
    at(0, cam, { scale: 1, y: 0 }, 2.0, CINE);
    at(2.0, cam, { scale: 1.03, x: -6 }, 2.2, IO);
    at(4.2, cam, { scale: 1.08, x: 0, filter: 'blur(14px)' }, 1.7, IO);
    at(5.9, cam, { scale: 1, filter: 'blur(0px)' }, 0.5, CINE);
    at(4.2, [el.dim], { opacity: 0.62 }, 0.4, OUT); at(5.8, el.dim, { opacity: 0 }, 0.5, OUT);
    at(4.2, el.vig, { opacity: 1 }, 0.4, OUT); at(5.8, el.vig, { opacity: 0 }, 0.5, OUT);
    at(0, el.msg1, { opacity: 0 }); words(4.6, el.msg1, 0.8, 28); at(5.6, el.msg1, { opacity: 0 }, 0.3, OUT);
    for (var k = 0.6; k < 4.2; k += 0.6) { at(k, el.banner, { opacity: 0.72 }, 0.3, IO); at(k + 0.3, el.banner, { opacity: 1 }, 0.3, IO); }
    at(6.0, el.banner, { opacity: 0, y: -40 }, 0.35, IN);
    function hov(c, a, z) { at(a, c, { backgroundColor: '#F6F4F0', y: -4 }, 0.15, OUT); at(z, c, { backgroundColor: '#FFFFFF', y: 0 }, 0.15, OUT); }
    hov(el.cards[1], 0.75, 1.2); hov(el.cards[2], 1.45, 1.85); hov(el.cards[6], 1.95, 2.15); hov(el.cards[4], 3.15, 3.5); hov(el.cards[1], 3.6, 4.05);
    at(2.15, el.shade, { opacity: 1 }, 0.15, OUT); at(2.85, el.shade, { opacity: 0 }, 0.2, OUT);
    at(0, el.pop, { scale: 0.88 }); at(2.15, el.pop, { opacity: 1 }, 0.1); at(2.15, el.pop, { scale: 1 }, 0.35, SPRING); at(2.85, el.pop, { opacity: 0, scale: 0.94 }, 0.15, IN);
    at(6.1, el.cookie, { y: 60 }, 0.35, IN);
    at(6.2, el.chat, { scale: 0, opacity: 0 }, 0.25, IN);
    at(6.15, el.fine, { opacity: 0 }, 0.2, OUT);
    el.badges.forEach(function (b, i) { at(6.2 + i * 0.04, b, { opacity: 0, y: -8 }, 0.25, OUT); });
    at(6.3, el.chipsOld, { opacity: 0 }, 0.2, OUT);
    at(0, el.chipsNew, { scale: 0.92 }); at(6.55, el.chipsNew, { opacity: 1, scale: 1 }, 0.45, SPRING);
    [7, 5, 3, 1, 6, 4, 2, 0].forEach(function (i, k) { at(6.3 + k * 0.06, el.cards[i], { opacity: 0, scale: 0.94 }, 0.3, OUT); });
    el.clean.forEach(function (c, i) { at(0, c, { y: 30 }); at(i === 1 ? 6.85 : 6.95, c, { opacity: 1, y: 0 }, 0.6, OUT); });
    at(7.9, el.cta, { scale: 0.96 }, 0.08, OUT); at(7.98, el.cta, { scale: 1 }, 0.22, SPRING);
    at(0, el.done, { scale: 0.96 }); at(8.05, el.done, { opacity: 1 }, 0.15, OUT); at(8.05, el.done, { scale: 1 }, 0.4, BOUNCE);
    at(0.3, [el.cLab, el.cVal], { opacity: 1 }, 0.3, OUT);
    for (var i = 0; i <= 8; i++) setText(0.3 + i * 0.5, el.cVal, (i * 0.5).toFixed(1) + 's');
    at(6.0, [el.cLab, el.cVal], { opacity: 0 }, 0.2, OUT);
    setText(7.3, el.cLab, 'DECIDED IN', '#7BC59A'); setText(7.3, el.cVal, '0.0s', '#7BC59A'); call(7.3, function () { el.cVal.style.left = '260px'; });
    at(7.35, [el.cLab, el.cVal], { opacity: 1 }, 0.2, OUT); setText(7.9, el.cVal, '0.5s');
    at(8.6, [el.cLab, el.cVal], { opacity: 0 }, 0.3, OUT);
    var RX = 720, RY = 580;
    path(el.cursor, [[0, 790, 400], [0.5, 760, 402], [0.9, 600, 392], [1.2, 592, 398], [1.6, 850, 392], [1.85, 846, 398], [2.1, 850, 600], [2.4, 780, 520], [2.7, 720, 556, OUT], [3.1, 740, 560], [3.4, 330, 602], [3.7, 560, 420], [3.95, 596, 396, OUT], [4.15, 604, 402], [6.2, 604, 402, 'hold'], [6.7, 1080, 720], [7.4, 1080, 720, 'hold'], [7.85, RX, RY, CINE]], RX, RY);
    at(0, el.cursor, { opacity: 1 }, 0.4, OUT);
    at(2.72, el.cursor, { scale: 0.8 }, 0.08, OUT); at(2.8, el.cursor, { scale: 1 }, 0.15, SPRING);
    at(7.9, el.cursor, { scale: 0.8 }, 0.08, OUT); at(7.98, el.cursor, { scale: 1 }, 0.2, SPRING);
    at(8.6, el.black, { opacity: 1 }, 0.4, IO);
  }

  /* ================= mobile timeline ================= */
  function timeMobile() {
    at(0, el.black, { opacity: 1 }); at(0, el.black, { opacity: 0 }, 0.5, OUT);
    var S0 = 1.8;
    at(0, cam, { scale: S0, y: -S0 * (420 - 437) });
    at(0, cam, { scale: 1, y: 0 }, 1.8, CINE);
    at(1.8, cam, { scale: 1.02 }, 3.2, IO);
    at(5.0, cam, { scale: 1.07, filter: 'blur(12px)' }, 1.5, IO);
    at(6.5, cam, { scale: 1, filter: 'blur(0px)' }, 0.4, CINE);
    at(5.0, [el.dim], { opacity: 0.62 }, 0.4, OUT); at(6.4, el.dim, { opacity: 0 }, 0.45, OUT);
    at(5.0, el.vig, { opacity: 1 }, 0.4, OUT); at(6.4, el.vig, { opacity: 0 }, 0.45, OUT);
    at(0, el.msg1, { opacity: 0 }); words(5.2, el.msg1, 0.7, 22); at(6.2, el.msg1, { opacity: 0 }, 0.25, OUT);
    for (var k = 0.6; k < 4.8; k += 0.6) { at(k, el.banner, { opacity: 0.7 }, 0.3, IO); at(k + 0.3, el.banner, { opacity: 1 }, 0.3, IO); }
    at(6.9, el.banner, { opacity: 0, y: -34 }, 0.3, IN);
    at(2.25, el.row, { x: -244 }, 0.4, OUT); at(3.0, el.row, { x: -488 }, 0.4, OUT); at(4.4, el.row, { x: -244 }, 0.4, OUT);
    function hv(c, a, z) { at(a, c, { backgroundColor: '#F6F4F0' }, 0.1, OUT); at(z, c, { backgroundColor: '#FFFFFF' }, 0.15, OUT); }
    hv(el.cards[0], 1.85, 2.15); hv(el.cards[1], 2.7, 2.95); hv(el.cards[1], 4.85, 5.0);
    at(3.45, el.shade, { opacity: 1 }, 0.15, OUT); at(4.0, el.shade, { opacity: 0 }, 0.25, OUT);
    at(0, el.sheet, { y: 420 }); at(3.45, el.sheet, { y: 0 }, 0.4, SPRING); at(4.0, el.sheet, { y: 420 }, 0.3, IN);
    at(6.95, el.cookie, { y: 100 }, 0.3, IN);
    at(7.0, el.chat, { scale: 0, opacity: 0 }, 0.25, IN);
    [el.fine, el.promo, el.compare, el.chipsOld].forEach(function (n, i) { at(6.95 + i * 0.05, n, { opacity: 0 }, 0.25, OUT); });
    at(0, el.chipsNew, { scale: 0.9 }); at(7.3, el.chipsNew, { opacity: 1, scale: 1 }, 0.45, SPRING);
    at(7.05, el.row, { opacity: 0, scale: 0.95 }, 0.3, OUT);
    el.clean.forEach(function (c, i) { at(0, c, { y: 24 }); at(7.4 + i * 0.08, c, { opacity: 1, y: 0 }, 0.6, OUT); });
    at(0, el.cta, { y: 40 }); at(7.6, el.cta, { opacity: 1, y: 0 }, 0.5, OUT);
    at(8.55, el.cta, { scale: 0.97 }, 0.07, OUT); at(8.62, el.cta, { scale: 1 }, 0.23, SPRING);
    at(7.75, el.cancel, { opacity: 1 }, 0.25, OUT);
    at(0, el.done, { scale: 0.96 }); at(8.65, el.done, { opacity: 1 }, 0.15, OUT); at(8.65, el.done, { scale: 1 }, 0.4, BOUNCE);
    var RX = 201 - 22, RY = 799 - 22;
    [el.touch, el.rip].forEach(function (e) { e.style.left = RX + 'px'; e.style.top = RY + 'px'; });
    var pts = [[1.6, 140, 430], [2.2, 300, 428], [2.65, 90, 432, OUT], [2.75, 150, 432], [3.0, 310, 436], [3.4, 100, 438, OUT], [3.8, 201, 746], [4.3, 90, 440], [4.8, 320, 442, OUT], [4.95, 170, 440], [5.05, 176, 436]];
    function P(t, x, y) { return { x: x - 22 - RX, y: y - 22 - RY }; }
    at(0, [el.touch, el.rip], P(0, 140, 430));
    for (var i = 1; i < pts.length; i++) at(pts[i - 1][0], [el.touch, el.rip], P(0, pts[i][1], pts[i][2]), pts[i][0] - pts[i - 1][0], pts[i][3] || IO);
    at(7.9, [el.touch, el.rip], P(0, 300, 640));
    at(8.0, [el.touch, el.rip], P(0, 201, 799), 0.5, CINE);
    at(1.6, el.touch, { opacity: 1 }, 0.2, OUT); at(5.05, el.touch, { opacity: 0 }, 0.25, OUT); at(8.0, el.touch, { opacity: 1 }, 0.2, OUT); at(8.9, el.touch, { opacity: 0 }, 0.2, OUT);
    [1.9, 2.75, 3.95, 4.97, 8.55].forEach(function (t) { at(t - 0.001, el.rip, { opacity: 0.3, scale: 0.4 }); at(t, el.rip, { opacity: 0, scale: 2.2 }, 0.4, OUT); });
    at(0.4, el.pill, { opacity: 1 }, 0.3, OUT); at(6.9, el.pill, { opacity: 0 }, 0.2, OUT);
    for (var j = 0; j <= 9; j++) setText(0.5 + j * 0.5, el.cVal, (j * 0.5).toFixed(1) + 's');
    setText(7.9, el.cLab, 'DECIDED IN', '#7BC59A'); setText(7.9, el.cVal, '0.0s', '#7BC59A'); call(7.9, function () { el.cVal.style.left = '110px'; });
    at(8.0, el.pill, { opacity: 1 }, 0.2, OUT); setText(8.55, el.cVal, '0.5s'); at(9.0, el.pill, { opacity: 0 }, 0.2, OUT);
    at(9.2, el.black, { opacity: 1 }, 0.4, IO);
  }

  /* ================= ending + hand-off to Home ================= */
  function timeEnding() {
    var t0 = mobile ? 9.65 : 9.0;
    var tS = t0 + (mobile ? 1.2 : 1.3), tN = tS + 0.45, tR = tN + 0.75, tW = tR + 0.45, tT = tW + 0.9;
    at(t0 - 0.05, cam, { opacity: 0 });
    words(t0, el.msg2, 0.75, 22);
    var sc = mobile ? 0.42 : 0.34;
    var nameTop = parseFloat(el.su.style.top);
    var mh = el.msg2.offsetHeight, mc = parseFloat(el.msg2.style.top) + mh / 2;
    var dy = (nameTop - 14 - (mh * sc) / 2) - mc;
    at(tS, el.msg2, { scale: sc, y: dy, color: '#A8A39B' }, 0.6, CINE);
    at(tN, [el.su, el.to], { opacity: 1 });
    fromTo(tN, splitChars(el.su), { y: 40, opacity: 0, scale: 0.7, filter: 'blur(14px)' }, { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }, 0.5, OUT, 0.035);
    fromTo(tN + 0.28, splitChars(el.to), { y: 40, opacity: 0, scale: 0.7, filter: 'blur(14px)' }, { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }, 0.5, OUT, 0.035);
    at(tR, el.role, { opacity: 1 });
    fromTo(tR, splitWords(el.role), { y: 16, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)' }, 0.4, OUT, 0.08);
    fromTo(tW, [el.wel], { opacity: 0, y: 10, letterSpacing: '6px' }, { opacity: 1, y: 0, letterSpacing: '2px' }, 0.6, OUT);
    /* hand-off */
    at(tT, [el.msg2, el.role, el.wel], { opacity: 0 }, 0.4, OUT);
    at(tT, el.su, { opacity: 0, x: -30, filter: 'blur(12px)' }, 0.6, OUT);
    call(tT + 0.2, function () {
      /* measure the real logo and glide "Toheeb" onto it */
      var lr = realLogo.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      var tr = el.to.getBoundingClientRect();
      var targetX = (lr.left + lr.width / 2 - sr.left) / S, targetY = (lr.top + lr.height / 2 - sr.top) / S;
      var curX = (tr.left + tr.width / 2 - sr.left) / S, curY = (tr.top + tr.height / 2 - sr.top) / S;
      var s = (lr.height * 0.95) / (tr.height);
      var stt = state(el.to);
      el.to.style.transformOrigin = '50% 50%';
      el.to.animate([{ translate: stt.x + 'px ' + stt.y + 'px', scale: '1' }, { translate: (stt.x + targetX - curX) + 'px ' + (stt.y + targetY - curY) + 'px', scale: String(s) }], { duration: 1400, easing: CINE, fill: 'forwards' });
      el.to.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, delay: 1300, easing: IO, fill: 'forwards' });
    });
    at(tT + 0.35, [el.black], { opacity: 0 }, 1.35, IO);
    call(tT + 0.35, function () { intro.style.transition = 'background-color 1.35s ease'; intro.style.backgroundColor = 'rgba(20,18,16,0)'; });
    fromTo(tT + 0.35, [homePage], { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1 }, 1.75, CINE);
    return tT + 2.4;
  }

  function finish(skipped) {
    try { sessionStorage.setItem('toheebIntroSeen', '1'); } catch (e) {}
    document.documentElement.style.overflow = '';
    if (skipped) {
      intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, easing: 'ease-out', fill: 'forwards' }).onfinish = cleanup;
      homePage.style.opacity = '1';
      homePage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
    } else cleanup();
    function cleanup() { intro.remove(); skip.remove(); homePage.getAnimations().forEach(function (a) { a.cancel(); }); homePage.style.opacity = ''; }
  }
})();
