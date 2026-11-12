/* =====================================================================
   enhance.js — premium micro-interactions (vanilla JS, no libraries)
   Loaded after script.js. Never mutates page content; only adds polish.
   All motion features are gated on a fine pointer + no reduced-motion.
   ===================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var enableMotion = !reduceMotion && finePointer;

  var lerp = function (a, b, n) { return a + (b - a) * n; };

  /* ---------------------------------------------------------------
     1. Custom animated cursor (dot + lagging ring)
     --------------------------------------------------------------- */
  if (enableMotion) {
    var dot = document.createElement("div");
    var ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add("has-custom-cursor");

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my, visible = false;

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      if (!visible) { visible = true; dot.style.opacity = ring.style.opacity = "1"; }
    }, { passive: true });

    (function raf() {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(raf);
    })();

    var hoverSel = 'a, button, .button, .shadow__btn, .project-card, .upcoming-card, ' +
      '.journey-card, .github-stat-card, .pub-card, .download-label, .example-2 .icon-content a, ' +
      '.category-label, input, textarea, select, [onclick], .back2top-button';
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hoverSel)) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hoverSel) && !(e.relatedTarget && e.relatedTarget.closest(hoverSel)))
        ring.classList.remove("is-hover");
    });
    window.addEventListener("mousedown", function () { ring.classList.add("is-down"); });
    window.addEventListener("mouseup", function () { ring.classList.remove("is-down"); });
    document.addEventListener("mouseleave", function () { dot.style.opacity = ring.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { dot.style.opacity = ring.style.opacity = "1"; });
  }

  /* ---------------------------------------------------------------
     2. Cursor-following spotlight (all flagged cards) + 3D tilt (project/upcoming)
     --------------------------------------------------------------- */
  var spotlightCards = document.querySelectorAll(
    ".project-card, .upcoming-card, .journey-card, .github-stat-card, .pub-card"
  );
  spotlightCards.forEach(function (card) {
    var tiltable = enableMotion &&
      (card.classList.contains("project-card") || card.classList.contains("upcoming-card"));
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", px * 100 + "%");
      card.style.setProperty("--my", py * 100 + "%");
      if (tiltable) {
        var rotX = (0.5 - py) * 7;
        var rotY = (px - 0.5) * 7;
        card.style.transform =
          "perspective(900px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg) scale(1.02)";
      }
    });
    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    });
  });

  /* ---------------------------------------------------------------
     3. Magnetic buttons
     --------------------------------------------------------------- */
  if (enableMotion) {
    var magnetize = function (el, strength) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - r.left - r.width / 2;
        var dy = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + dx * strength + "px," + dy * strength + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    };
    ["a.shadow__btn", "#submitBtn", "#contact button"].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) magnetize(el, 0.28);
    });
  }

  /* ---------------------------------------------------------------
     4. Animated count-up for GitHub stats (runs once when value arrives)
     --------------------------------------------------------------- */
  ["githubRepos", "githubCurrentStreak", "githubLongestStreak", "githubCommits"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    var obs = new MutationObserver(function () {
      // Plain numbers ("69"), fallbacks ("65+") and streaks ("59 days").
      var m = el.textContent.trim().match(/^(\d+)(\+?|\s+days?)$/);
      if (!m) return;
      obs.disconnect();
      var target = parseInt(m[1], 10), suffix = m[2];
      if (reduceMotion || target === 0) { el.textContent = target + suffix; return; }
      // A unit stays visible while counting; a "+" only appears at the end.
      var unit = suffix === "+" ? "" : suffix;
      var t0 = performance.now(), dur = 1500;
      (function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + (p === 1 ? suffix : unit);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
    obs.observe(el, { childList: true, characterData: true, subtree: true });
  });

  /* ---------------------------------------------------------------
     5. Hero parallax + injected scroll cue
     --------------------------------------------------------------- */
  var hero = document.querySelector("section.min-vh-100");
  if (hero) {
    var cue = document.createElement("div");
    cue.className = "scroll-cue";
    cue.setAttribute("aria-hidden", "true");
    cue.innerHTML = "<span></span>";
    hero.appendChild(cue);

    if (enableMotion) {
      var heroContent = hero.querySelector(".container.text-center");
      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          if (heroContent && y < window.innerHeight) {
            heroContent.style.transform = "translateY(" + y * 0.22 + "px)";
            heroContent.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.75)));
          }
          cue.style.opacity = y > 60 ? "0" : "0.85";
          ticking = false;
        });
      }, { passive: true });
    }
  }

  /* ---------------------------------------------------------------
     6. Scroll-reveal for section headings + subtitles (+ accent bar)
     --------------------------------------------------------------- */
  var revealEls = [];
  document.querySelectorAll("section h2").forEach(function (h) {
    if (h.closest("#loading")) return;
    h.setAttribute("data-reveal", "");
    revealEls.push(h);
    // animated accent bar under centered titles (skip the long left-aligned about heading + email h2)
    var centered = h.parentElement && /text-center/.test(h.parentElement.className);
    if (centered) {
      var bar = document.createElement("span");
      bar.className = "title-accent";
      bar.setAttribute("aria-hidden", "true");
      h.insertAdjacentElement("afterend", bar);
    }
    var sub = h.nextElementSibling;
    if (sub && sub.tagName === "P") {
      sub.setAttribute("data-reveal", "");
      sub.style.transitionDelay = "0.08s";
      revealEls.push(sub);
    }
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("revealed"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("revealed");
          var bar = en.target.nextElementSibling;
          if (bar && bar.classList.contains("title-accent")) bar.classList.add("revealed");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------
     7. Lenis smooth scroll (glides the whole page; off for reduced-motion)
     --------------------------------------------------------------- */
  if (!reduceMotion && typeof Lenis !== "undefined") {
    var lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    window.lenis = lenis;

    if (window.gsap && window.ScrollTrigger) {
      // Keep GSAP ScrollTrigger in sync and drive Lenis from GSAP's ticker.
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })();
    }

    // Smooth-scroll in-page anchor links (View Projects, nav jumps, etc.)
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href === "#") return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    });
  }

  /* ---------------------------------------------------------------
     8. Sticky nav: scrolled state, mobile menu, active-section highlight
     --------------------------------------------------------------- */
  (function initNav() {
    var nav = document.getElementById("siteNav");
    if (!nav) return;
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    var linkEls = nav.querySelectorAll(".site-nav__link");

    // Condense the bar once the user scrolls past the hero top.
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Mobile menu open/close.
    var closeMenu = function () {
      if (!links) return;
      links.classList.remove("is-open");
      if (toggle) {
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
      document.body.classList.remove("nav-open");
      if (window.lenis) window.lenis.start();
    };
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = !links.classList.contains("is-open");
        links.classList.toggle("is-open", open);
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("nav-open", open);
        if (window.lenis) { open ? window.lenis.stop() : window.lenis.start(); }
      });
      links.addEventListener("click", function (e) {
        if (e.target.closest("a")) closeMenu();
      });
    }

    // Highlight the nav link for whichever section is in view.
    if ("IntersectionObserver" in window) {
      var map = {};
      linkEls.forEach(function (a) {
        var id = a.getAttribute("href");
        if (id && id.charAt(0) === "#" && document.querySelector(id)) map[id] = a;
      });
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          linkEls.forEach(function (a) { a.classList.remove("is-active"); });
          var active = map["#" + en.target.id];
          if (active) active.classList.add("is-active");
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      Object.keys(map).forEach(function (id) {
        var s = document.querySelector(id);
        if (s) spy.observe(s);
      });
    }
  })();

  /* ---------------------------------------------------------------
     9. Skill chips: "where I've used it" tooltip
     One shared tooltip shows a chip's data-used text on hover,
     keyboard focus or tap. Chips without data-used are left alone.
     --------------------------------------------------------------- */
  (function initSkillTips() {
    var chips = document.querySelectorAll(".skill-chip[data-used]");
    if (!chips.length) return;

    var tip = document.createElement("div");
    tip.className = "skill-tip";
    tip.id = "skillTip";
    tip.setAttribute("role", "tooltip");
    var label = document.createElement("span");
    label.className = "skill-tip__label";
    label.textContent = "Where I've used it";
    var text = document.createElement("span");
    tip.appendChild(label);
    tip.appendChild(text);
    document.body.appendChild(tip);

    var current = null;
    var GAP = 10;  // space between chip and tooltip
    var EDGE = 8;  // minimum distance from the viewport edge

    function show(chip) {
      current = chip;
      text.textContent = chip.getAttribute("data-used");
      chip.setAttribute("aria-describedby", tip.id);

      // Measure at the left edge so the width is not squeezed by the old position.
      tip.style.left = "0px";
      var rect = chip.getBoundingClientRect();
      var left = rect.left + rect.width / 2 - tip.offsetWidth / 2;
      left = Math.max(EDGE, Math.min(left, window.innerWidth - tip.offsetWidth - EDGE));
      var top = rect.top - tip.offsetHeight - GAP;
      if (top < EDGE) top = rect.bottom + GAP;  // no room above: show below

      tip.style.left = Math.round(left) + "px";
      tip.style.top = Math.round(top) + "px";
      tip.classList.add("is-visible");
    }

    function hide() {
      if (!current) return;
      current.removeAttribute("aria-describedby");
      current = null;
      tip.classList.remove("is-visible");
    }

    Array.prototype.forEach.call(chips, function (chip) {
      chip.setAttribute("tabindex", "0");
      chip.addEventListener("mouseenter", function () { show(chip); });
      chip.addEventListener("mouseleave", hide);
      chip.addEventListener("focus", function () { show(chip); });
      chip.addEventListener("blur", hide);
    });
    window.addEventListener("scroll", hide, { passive: true });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hide();
    });
  })();

})();
