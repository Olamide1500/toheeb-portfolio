/* Dot field (desktop only).
   Faint dots sit behind the page. The cursor reveals them like a soft torch, only in empty space:
   never behind words, buttons or images. While you rest on text to read, it steps back.
 */
(function () {
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var GAP = 24, R = 150, BASE = .04, PAD = 12;
  var OUTLINE = false; /* dotted outline around links: switched off, it added noise */
  var CLICK = 'a[href], button, [role="button"], .sv-thumb, [data-ex], .tile--m, .tile--d';
  var READ = 'p, h1, h2, h3, h4, li, dd, dt, blockquote, figcaption';
  var QUIET = 'p, h1, h2, h3, h4, li, dt, dd, blockquote, figcaption, label, img, figure, video, canvas:not(.dotfield), svg, a, button, input, textarea, select, .label, .btn, .tile, .card, .chip, .tag, .wk-tags, .status, .logo, .nav, .dock, .mode, .facts, .short, .cta, .srow, .ppanel, .shot, .shots, .plabel';
  var SKIP = '.sv-sheet, .sv-view, .ex-view, .menu, .pick';

  function make() {
    var cv, ctx, raf = 0, on = false, dpr = 1, W = 0, H = 0;
    var mx = -999, my = -999, px = -999, py = -999, inside = false, energy = 0, last = 0;
    var zones = [], zonesAt = 0, cols = 0, rows = 0, mask = null;
    var ring = null, ringT = 0, ringR = { l: 0, t: 0, r: 0, b: 0, rad: 0 }, ringTo = null, hovered = null;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); zonesAt = 0;
    }
    /* collect blocks where dots must never appear: anything with words, images or controls */
    function collect() {
      var list = [], seen = new Set();
      document.querySelectorAll(QUIET).forEach(function (el) { if (!el.closest(SKIP)) { list.push(el); seen.add(el); } });
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return /\S/.test(n.nodeValue) ? 1 : 2; } });
      var n; while ((n = walker.nextNode())) { var p = n.parentElement; if (p && !seen.has(p) && !p.closest(SKIP) && p.tagName !== 'SCRIPT' && p.tagName !== 'STYLE') { seen.add(p); list.push(p); } }
      return list;
    }
    var quietEls = [];
    function refreshZones() {
      if (!quietEls.length || performance.now() - zonesAt > 1500) { quietEls = collect(); }
      zones = [];
      for (var i = 0; i < quietEls.length; i++) {
        var b = quietEls[i].getBoundingClientRect();
        if (!b.width || b.bottom < -40 || b.top > H + 40) continue;
        zones.push(b);
      }
      zonesAt = performance.now();
    }
    function buildMask(offY) {
      cols = Math.ceil(W / GAP) + 1; rows = Math.ceil(H / GAP) + 2;
      if (!mask || mask.length !== cols * rows) mask = new Uint8Array(cols * rows); else mask.fill(0);
      for (var i = 0; i < zones.length; i++) {
        var z = zones[i];
        var c0 = Math.max(0, Math.ceil((z.left - 8 - 12) / GAP)), c1 = Math.min(cols - 1, Math.floor((z.right + 8 - 12) / GAP));
        var r0 = Math.max(0, Math.ceil((z.top - 6 - 12 - offY) / GAP)), r1 = Math.min(rows - 1, Math.floor((z.bottom + 6 - 12 - offY) / GAP));
        for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) mask[r * cols + c] = 1;
      }
    }
    function nearestOnRing(x, y, q) {
      var ix = Math.max(q.l + q.rad, Math.min(q.r - q.rad, x)), iy = Math.max(q.t + q.rad, Math.min(q.b - q.rad, y));
      var vx = x - ix, vy = y - iy, d = Math.sqrt(vx * vx + vy * vy) || 1;
      return [ix + vx / d * q.rad, iy + vy / d * q.rad];
    }
    function target() {
      var el = document.elementFromPoint(mx, my);
      if (!el || el.closest(SKIP)) return { read: false, click: null };
      return { read: !!el.closest(READ) && !el.closest(CLICK), click: OUTLINE ? el.closest(CLICK) : null };
    }
    function frame(now) {
      raf = 0;
      if (!on) return;
      var busy = document.documentElement.style.overflow === 'hidden';
      var k = reduce ? 1 : .14;
      px += (mx - px) * k; py += (my - py) * k;
      var t = inside && !busy ? target() : { read: false, click: null };
      energy += ((inside && !busy && !t.read ? 1 : 0) - energy) * .08;
      /* the outline: slides between targets and fades in and out */
      if (t.click !== hovered) {
        hovered = t.click;
        if (hovered) {
          var b = hovered.getBoundingClientRect(), rad = parseFloat(getComputedStyle(hovered).borderTopLeftRadius) || 0;
          ringTo = { l: b.left - PAD, t: b.top - PAD, r: b.right + PAD, b: b.bottom + PAD, rad: Math.min(rad + PAD, (b.height + PAD * 2) / 2, (b.width + PAD * 2) / 2) };
          if (ringT < .05) { ringR = { l: ringTo.l, t: ringTo.t, r: ringTo.r, b: ringTo.b, rad: ringTo.rad }; }
        }
      }
      if (hovered) { var hb = hovered.getBoundingClientRect(); ringTo.l = hb.left - PAD; ringTo.t = hb.top - PAD; ringTo.r = hb.right + PAD; ringTo.b = hb.bottom + PAD; }
      ringT += ((hovered && !busy ? 1 : 0) - ringT) * .12;
      if (ringTo) { var s = .22; ringR.l += (ringTo.l - ringR.l) * s; ringR.t += (ringTo.t - ringR.t) * s; ringR.r += (ringTo.r - ringR.r) * s; ringR.b += (ringTo.b - ringR.b) * s; ringR.rad += (ringTo.rad - ringR.rad) * s; }

      refreshZones();
      var offY = -(window.scrollY % GAP);
      buildMask(offY);
      ctx.clearRect(0, 0, W, H);
      var showRing = ringT > .01 && ringTo;
      for (var r = 0; r < rows; r++) {
        var gy = 12 + offY + r * GAP;
        for (var c = 0; c < cols; c++) {
          var gx = 12 + c * GAP;
          var onRing = 0, rx = gx, ry = gy;
          if (showRing && gx > ringR.l - GAP && gx < ringR.r + GAP && gy > ringR.t - GAP && gy < ringR.b + GAP) {
            var np = nearestOnRing(gx, gy, ringR), dd = Math.hypot(gx - np[0], gy - np[1]);
            var outside = gx < ringR.l + ringR.rad || gx > ringR.r - ringR.rad || gy < ringR.t + ringR.rad || gy > ringR.b - ringR.rad;
            if (dd < GAP * .55 && (outside || dd < GAP * .55)) { onRing = ringT; rx = gx + (np[0] - gx) * ringT; ry = gy + (np[1] - gy) * ringT; }
          }
          if (!onRing && mask[r * cols + c]) continue;
          var dx = gx - px, dy = gy - py, d = Math.sqrt(dx * dx + dy * dy);
          var f = d < R ? (1 - d / R) : 0; f = f * f * (3 - 2 * f) * energy;
          var push = f * 2, ox = d ? dx / d * push : 0, oy = d ? dy / d * push : 0;
          var x = onRing ? rx : gx + ox, y = onRing ? ry : gy + oy;
          var heat = Math.max(f * .7, onRing * .85);
          var a = onRing ? BASE + onRing * .6 : BASE + f * .3;
          ctx.fillStyle = heat > .02 ? 'rgba(' + Math.round(26 + 191 * heat) + ',' + Math.round(23 + 96 * heat) + ',' + Math.round(20 + 59 * heat) + ',' + a + ')' : 'rgba(26,23,20,' + BASE + ')';
          ctx.beginPath(); ctx.arc(x, y, onRing ? 1.3 + onRing * .5 : .9 + f * .45, 0, 6.2832); ctx.fill();
        }
      }
      last = now;
      /* keep animating while something is moving; otherwise rest (no work while idle) */
      var settling = Math.abs(mx - px) + Math.abs(my - py) > .3 || Math.abs((inside ? 1 : 0) - energy) > .01 || Math.abs((hovered ? 1 : 0) - ringT) > .01;
      if (settling) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && on) raf = requestAnimationFrame(frame); }
    function move(e) { if (e.pointerType && e.pointerType !== 'mouse') return; mx = e.clientX; my = e.clientY; if (!inside) { inside = true; px = mx; py = my; } kick(); }
    function leave() { inside = false; kick(); }
    function scroll() { zonesAt = 0; kick(); }
    function vis() { if (!document.hidden) kick(); }
    return {
      on: function () {
        if (on || !fine || reduce) return;
        on = true;
        cv = document.createElement('canvas'); cv.className = 'dotfield'; cv.setAttribute('aria-hidden', 'true');
        cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:-1';
        document.body.prepend(cv); ctx = cv.getContext('2d'); size();
        document.documentElement.classList.add('has-dotfield');
        addEventListener('resize', size); addEventListener('pointermove', move, { passive: true });
        document.documentElement.addEventListener('mouseleave', leave); addEventListener('scroll', scroll, { passive: true });
        document.addEventListener('visibilitychange', vis);
        kick();
      },
      off: function () {
        on = false; if (raf) cancelAnimationFrame(raf); raf = 0; cv && cv.remove();
        document.documentElement.classList.remove('has-dotfield');
        removeEventListener('resize', size); removeEventListener('pointermove', move);
        document.documentElement.removeEventListener('mouseleave', leave); removeEventListener('scroll', scroll);
        document.removeEventListener('visibilitychange', vis);
      }
    };
  }
  window.DotField = make();
  if (!window.DOTFIELD_MANUAL) window.DotField.on();
})();
