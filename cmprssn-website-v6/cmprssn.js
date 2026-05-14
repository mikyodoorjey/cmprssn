/* CMPRSSN — vanilla behavior layer for the v6 HTML site.
 *
 * Replaces cmprssn-v4.js (React). Every initializer is opt-in via DOM
 * presence (querySelectorAll returns empty -> no-op), so every page can
 * include this single file safely.
 *
 * What's in here:
 *   initReveal()          .reveal              fade-up on viewport entry
 *   initCompressHeadline().compress-on-enter   letter-spacing tween
 *   initNav()             .nav-shell           scroll state + wordmark/logo compress
 *   initMobileNav()       .hamburger           mobile sheet open/close
 *   initCountUp()         [data-countup]       number animation
 *   initMarquee()         .quote-track         clones children for seamless loop
 *   initMapTerminal()     .map-terminal        typewriter + scroll-progress slider
 *
 * Convention: every init returns early if its target isn't found. Nothing
 * is mounted, nothing is rendered. Pages declare behavior by including the
 * right markup (e.g. add class="reveal" on anything that should fade in).
 */
(function () {
  'use strict';

  // Animations always run on this site; we don't honor prefers-reduced-motion.
  // (See cmprssn-tokens.css + index.html — the matching @media rules were
  // removed in tandem with this constant.)
  const prefersReducedMotion = false;

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = v => Math.max(0, Math.min(1, v));

  /* -------------------------------------------------------------- */
  /* .reveal — fade-up on viewport entry. Supports data-delay (ms). */
  /* -------------------------------------------------------------- */
  function initReveal() {
    const targets = document.querySelectorAll('.reveal:not(.is-in)');
    if (!targets.length) return;
    if (prefersReducedMotion) {
      targets.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        if (delay) el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
    targets.forEach(el => io.observe(el));
  }

  /* ----------------------------------------------------------------------- */
  /* .compress-on-enter — same observer, slightly higher threshold so the    */
  /* letter-spacing tween fires when the headline is properly in view.       */
  /* ----------------------------------------------------------------------- */
  function initCompressHeadline() {
    const targets = document.querySelectorAll('.compress-on-enter:not(.is-in)');
    if (!targets.length) return;
    if (prefersReducedMotion) {
      targets.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
    targets.forEach(el => io.observe(el));
  }

  /* ----------------------------------------------------------------------- */
  /* Nav — scrolled state + wordmark/logo compression.                       */
  /*                                                                         */
  /* The nav markup expects:                                                 */
  /*   <header class="nav-shell">                                            */
  /*     <a class="brand" href="/">                                          */
  /*       <span class="brand-logo">...inline SVG with two paths...</span>   */
  /*       <span class="brand-wordmark">...inline SVG with <text>...</span>  */
  /*     </a>                                                                */
  /*     ...                                                                 */
  /*   </header>                                                             */
  /*                                                                         */
  /* This handler reads scroll progress (0 at top -> 1 at bottom), toggles   */
  /* .is-scrolled past a threshold, and tweens the SVG attributes on the     */
  /* wordmark <text> and the two logo <path>s.                               */
  /* ----------------------------------------------------------------------- */
  function initNav() {
    const shells = document.querySelectorAll('.nav-shell');
    if (!shells.length) return;

    const SCROLL_THRESHOLD = 16;

    // Cache per-shell elements + initial sizes so we can lerp from them.
    const shellEntries = Array.from(shells).map(shell => {
      const wordmarkText = shell.querySelector('.brand-wordmark text');
      const logoSpan = shell.querySelector('.brand-logo');
      const logoCPath = shell.querySelector('.brand-logo path[data-logo="c"]');
      const logoNPath = shell.querySelector('.brand-logo path[data-logo="n"]');
      const baseSize = wordmarkText
        ? parseFloat(wordmarkText.getAttribute('font-size')) || 20
        : 20;
      return { shell, wordmarkText, logoSpan, logoCPath, logoNPath, baseSize };
    });

    let lastProgress = -1;
    let lastScrolled = null;
    let rafQueued = false;

    function update() {
      rafQueued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? clamp01(window.scrollY / max) : 0;
      const scrolled = window.scrollY > SCROLL_THRESHOLD;

      const progressChanged = Math.abs(progress - lastProgress) > 0.001;
      const scrolledChanged = scrolled !== lastScrolled;
      if (!progressChanged && !scrolledChanged) return;
      lastProgress = progress;
      lastScrolled = scrolled;

      shellEntries.forEach(entry => {
        if (scrolledChanged) {
          entry.shell.classList.toggle('is-scrolled', scrolled);
        }
        if (!progressChanged) return;

        // Wordmark — continuous weight via stroke-width tween, no font swap.
        if (entry.wordmarkText) {
          const fontSize = lerp(entry.baseSize, entry.baseSize - 3, progress);
          const spacingEm = lerp(0.32, 0.06, progress);
          const stroke = lerp(1.0, 0.0, progress);
          const spacingPx = spacingEm * fontSize;
          entry.wordmarkText.setAttribute('font-size', fontSize);
          entry.wordmarkText.setAttribute('letter-spacing', spacingPx);
          entry.wordmarkText.setAttribute('stroke-width', stroke);
        }

        // Logo — paths tighten slightly, whole mark scales down a touch.
        if (entry.logoSpan) {
          const scale = lerp(1, 0.88, progress);
          entry.logoSpan.style.transform = 'scale(' + scale + ')';
        }
        if (entry.logoCPath || entry.logoNPath) {
          const stroke = lerp(8, 5, progress);
          const nLeft = lerp(32, 40, progress);
          const nTopY = lerp(28, 34, progress);
          const nBottomY = lerp(72, 66, progress);
          const nRight = lerp(68, 60, progress);
          const cGapTop = lerp(35, 42, progress);
          const cGapBot = lerp(65, 58, progress);
          if (entry.logoCPath) {
            entry.logoCPath.setAttribute(
              'd',
              'M95 ' + cGapTop + ' L95 20 A15 15 0 0 0 80 5 L20 5 A15 15 0 0 0 5 20 L5 80 A15 15 0 0 0 20 95 L80 95 A15 15 0 0 0 95 80 L95 ' + cGapBot
            );
            entry.logoCPath.setAttribute('stroke-width', stroke);
          }
          if (entry.logoNPath) {
            entry.logoNPath.setAttribute(
              'd',
              'M' + nLeft + ' ' + nTopY + ' V' + nBottomY + ' L' + nRight + ' ' + nTopY + ' V' + nBottomY
            );
            entry.logoNPath.setAttribute('stroke-width', stroke);
          }
        }
      });
    }

    function onScroll() {
      if (rafQueued) return;
      rafQueued = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  /* ----------------------------------------------------------------------- */
  /* Mobile nav — hamburger toggles .mobile-sheet open/closed, locks body    */
  /* scroll while open, closes on Esc, on overlay click, and on sheet-link   */
  /* click. Markup expects .hamburger + .mobile-sheet to exist on the page.  */
  /* ----------------------------------------------------------------------- */
  function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const sheet = document.querySelector('.mobile-sheet');
    if (!hamburger || !sheet) return;

    let open = false;

    function setOpen(v) {
      open = v;
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      sheet.classList.toggle('is-open', open);
      sheet.setAttribute('aria-hidden', String(!open));
      document.documentElement.style.overflow = open ? 'hidden' : '';
    }

    hamburger.addEventListener('click', () => setOpen(!open));

    sheet.addEventListener('click', e => {
      // close when a sheet link is tapped
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', e => {
      if (open && e.key === 'Escape') setOpen(false);
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Count-up — element opts in with data-countup="80" and optional:        */
  /*   data-decimals="1"  data-suffix="%"  data-prefix=""  data-duration="1400"*/
  /* The text content is replaced with the animated value on intersect.     */
  /* ----------------------------------------------------------------------- */
  function initCountUp() {
    const targets = document.querySelectorAll('[data-countup]');
    if (!targets.length) return;

    targets.forEach(el => {
      const value = parseFloat(el.dataset.countup);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = parseInt(el.dataset.duration || '1400', 10);
      el.style.fontVariantNumeric = 'tabular-nums';

      if (prefersReducedMotion) {
        el.textContent = prefix + value.toFixed(decimals) + suffix;
        return;
      }

      let fired = false;
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting || fired) return;
          fired = true;
          io.disconnect();
          const start = performance.now();
          const ease = t => 1 - Math.pow(1 - t, 3);
          const tick = now => {
            const t = clamp01((now - start) / duration);
            const v = value * ease(t);
            el.textContent = prefix + v.toFixed(decimals) + suffix;
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = prefix + value.toFixed(decimals) + suffix;
          };
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Marquee — clones each .quote-track's direct children once so the CSS    */
  /* @keyframes loop (translateX -50%) stays seamless. Author writes the     */
  /* quotes once; JS handles the duplication.                                */
  /* ----------------------------------------------------------------------- */
  function initMarquee() {
    const tracks = document.querySelectorAll('.quote-track:not([data-marquee-cloned])');
    if (!tracks.length) return;
    tracks.forEach(track => {
      const originals = Array.from(track.children);
      originals.forEach(node => {
        const clone = node.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
      track.setAttribute('data-marquee-cloned', '1');
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Map-terminal — used on the home page. Two behaviors:                    */
  /*                                                                         */
  /*   1. [data-stream] children inside .map-terminal get typed out, one     */
  /*      after the other, on first viewport entry.                          */
  /*   2. A .ruler-cursor element inside the section has its left-position   */
  /*      driven from scroll progress through the section (0 at entry, 1 at  */
  /*      exit). The section can opt-in via .map-terminal[data-slider].      */
  /* ----------------------------------------------------------------------- */
  function initMapTerminal() {
    const roots = document.querySelectorAll('.map-terminal');
    if (!roots.length) return;

    roots.forEach(root => {
      initTypewriter(root);
      initScrollSlider(root);
    });
  }

  function initTypewriter(root) {
    const streams = Array.from(root.querySelectorAll('[data-stream]'));
    if (!streams.length) return;

    // Stash the original text and blank the spans so they can be typed in.
    streams.forEach(s => {
      s.dataset.streamText = s.textContent;
      s.textContent = '';
    });

    if (prefersReducedMotion) {
      streams.forEach(s => { s.textContent = s.dataset.streamText; });
      return;
    }

    const SPEED = 28;
    const PAUSE = 320;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    let cancelled = false;
    let done = false;

    async function typeSpan(span) {
      span.classList.add('is-typing');
      const text = span.dataset.streamText || '';
      for (let i = 1; i <= text.length; i++) {
        if (cancelled) return;
        span.textContent = text.slice(0, i);
        await sleep(SPEED);
      }
      span.classList.remove('is-typing');
    }

    function backfillUntyped() {
      streams.forEach(span => {
        if (!span.textContent && span.dataset.streamText) {
          span.textContent = span.dataset.streamText;
        }
      });
    }

    async function run() {
      for (const span of streams) {
        if (cancelled) return;
        if (getComputedStyle(span).display === 'none') continue;
        await typeSpan(span);
        if (cancelled) return;
        await sleep(PAUSE);
      }
      backfillUntyped();
      done = true;
    }

    // Re-show any hidden-at-resize spans once the run is finished.
    window.addEventListener('resize', () => { if (done) backfillUntyped(); });

    const io = new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) {
        obs.disconnect();
        run();
      }
    }, { threshold: 0.15 });
    io.observe(root);
  }

  function initScrollSlider(root) {
    const cursor = root.querySelector('.ruler-cursor');
    if (!cursor) return;

    let rafId = null;
    let inView = false;

    function compute() {
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height + vh;
      const scrolled = vh - r.top;
      const p = clamp01(scrolled / total);
      cursor.style.left = (p * 100) + '%';
    }

    function tick() {
      compute();
      rafId = inView ? requestAnimationFrame(tick) : null;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        inView = e.isIntersecting;
        if (inView && rafId == null) rafId = requestAnimationFrame(tick);
      });
    }, { rootMargin: '50% 0px' });

    compute();
    io.observe(root);
  }

  /* -------------------------------------------------------------- */
  /* Boot — run every initializer once the DOM is ready.            */
  /* -------------------------------------------------------------- */
  function boot() {
    initReveal();
    initCompressHeadline();
    initNav();
    initMobileNav();
    initCountUp();
    initMarquee();
    initMapTerminal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Surface a small public API in case a page needs to re-run after dynamic
  // content insertion (e.g. injecting more .reveal elements).
  window.CMPRSSN = {
    initReveal,
    initCompressHeadline,
    initCountUp,
    initMarquee,
  };
})();
