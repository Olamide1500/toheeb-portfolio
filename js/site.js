/* Shared behaviour: smooth scrolling, gentle reveals, mobile menu */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Every new page starts at the top (unless the link asks for a section, like #screens).
     The browser and the viewer frame can keep the old scroll position, so we reset it ourselves. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function toTop() {
    var h = location.hash;
    if (h && h.length > 1 && /^#[\w-]+$/.test(h) && document.querySelector(h)) return;
    window.scrollTo(0, 0);
    try { document.documentElement.scrollIntoView({ block: 'start' }); } catch (e) {}
  }
  toTop();
  window.addEventListener('load', toTop);
  window.addEventListener('pageshow', function (e) { if (e.persisted) { toTop(); document.body.style.opacity = ''; } });

  /* Leaving for another page on this site: a short fade, so the jump to the top feels intentional */
  var home = !!document.querySelector('.home-page');
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var href = a.getAttribute('href');
    if (a.target === '_blank' || a.hasAttribute('download') || !/^[\w-]+\.html(#[\w-]+)?$/.test(href)) return;
    e.preventDefault();
    if (reduce) { location.href = href; return; }
    document.body.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }], { duration: 260, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' })
      .finished.then(function () { location.href = href; }, function () { location.href = href; });
    setTimeout(function () { location.href = href; }, 600);
  });
  if (!reduce && !home) document.body.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });

  /* Smooth scroll: mouse-wheel scrolling glides to a stop instead of jumping.
     Only on devices with a mouse/trackpad wheel; touch scrolling stays native. */
  var smooth = null;
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    var target = window.scrollY, current = window.scrollY, running = false, lock = false;
    var max = function () { return document.documentElement.scrollHeight - window.innerHeight; };
    var tick = function () {
      current += (target - current) * 0.11;
      if (Math.abs(target - current) < 0.4) { current = target; running = false; }
      lock = true; window.scrollTo(0, current); lock = false;
      if (running) requestAnimationFrame(tick);
    };
    var start = function () { if (!running) { running = true; requestAnimationFrame(tick); } };
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || smooth.stopped) return;
      var h = e.target.closest && e.target.closest('[data-drag]');
      if (h && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      var d = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      target = Math.max(0, Math.min(max(), target + d));
      start();
    }, { passive: false });
    window.addEventListener('scroll', function () { if (!lock && !running) { target = current = window.scrollY; } }, { passive: true });
    smooth = {
      stopped: false,
      scrollTo: function (el, offset) { target = Math.max(0, Math.min(max(), el.getBoundingClientRect().top + window.scrollY + (offset || 0))); current = window.scrollY; start(); },
      stop: function () { this.stopped = true; }, start: function () { this.stopped = false; }
    };
  }
  var lenis = smooth; window.siteScroll = smooth;
  /* Anchor links glide to their section */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-open-screens')) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, -24);
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });

  /* Reveal: only things that start below the first screen fade up once. Everything is visible without JS. */
  if (!reduce && 'IntersectionObserver' in window) {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('reveal-in');
          en.target.classList.remove('reveal-pending');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.documentElement.classList.add('js-reveal');
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.92) { el.classList.add('reveal-pending'); io.observe(el); }
    });
  }

  /* Back to top, in the footer */
  var fb = document.querySelector('.foot__bottom');
  if (fb) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'totop';
    b.innerHTML = '<span>Back to top</span><span class="totop__ic" aria-hidden="true"><svg viewBox="0 0 12 12" fill="none"><path d="M6 9.5v-7M3 5.5l3-3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 12 12" fill="none"><path d="M6 9.5v-7M3 5.5l3-3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
    fb.appendChild(b);
    b.addEventListener('click', function () {
      if (lenis) lenis.scrollTo(document.body, 0);
      else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var logo = document.querySelector('.logo'); if (logo) setTimeout(function () { logo.focus({ preventScroll: true }); }, 900);
    });
  }

  /* Mobile menu */
  var menu = document.getElementById('menu');
  var open = document.getElementById('menuOpen');
  var close = document.getElementById('menuClose');
  if (menu && open && close) {
    open.addEventListener('click', function () { menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false'); if (lenis) lenis.stop(); });
    close.addEventListener('click', function () { menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); if (lenis) lenis.start(); });
  }
})();
