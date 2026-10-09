/* ==========================================================================
   motion.js — scroll reveals. One observer, staggered per row, and switched
   off entirely when the reader has asked for reduced motion.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var observer = null;
  var reduced = false;

  function revealAll() {
    document.querySelectorAll("[data-reveal]").forEach(function (node) {
      node.classList.add("is-revealed");
    });
  }

  /** Re-scan for anything newly added or newly unhidden. */
  function refresh() {
    if (!observer) return;
    document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach(function (node) {
      if (node.hidden) return;
      observer.observe(node);
    });
  }

  function init() {
    reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    var seen = 0;

    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          // A short stagger, capped so late arrivals never feel delayed.
          var delay = Math.min(seen % 3, 2) * 90;
          entry.target.style.setProperty("--reveal-delay", delay + "ms");
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
          seen += 1;
        });
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.05 }
    );

    // The negative bottom margin leaves a dead band that content sitting at
    // the very end of the document can never cross. Once the reader reaches
    // the bottom, reveal whatever is left.
    window.addEventListener(
      "scroll",
      function onScroll() {
        var atBottom =
          window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
        if (!atBottom) return;
        revealAll();
        window.removeEventListener("scroll", onScroll);
      },
      { passive: true }
    );

    // Everything above the fold is revealed immediately; the observer picks
    // up the rest as the reader travels down the page.
    document.querySelectorAll("[data-reveal]").forEach(function (node) {
      if (node.getBoundingClientRect().top < window.innerHeight * 0.9) {
        node.classList.add("is-revealed");
        seen += 1;
        return;
      }
      observer.observe(node);
    });
  }

  app.motion = { init: init, refresh: refresh, revealAll: revealAll };
})(window.P1900);
