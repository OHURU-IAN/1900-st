/* ==========================================================================
   main.js — bootstrap. Order matters: theme first (no flash of the wrong
   ground), then panels, then the views that open them, then motion.
   ========================================================================== */

(function (app) {
  "use strict";

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* --- Reveal targets ----------------------------------------------------- */

  function markReveals() {
    var selectors = [
      ".page h2",
      ".page-lede",
      ".archive-list li",
      ".page-columns > div",
      ".signup",
      ".foot"
    ];

    document.querySelectorAll(selectors.join(",")).forEach(function (node) {
      node.setAttribute("data-reveal", "");
    });
  }

  /* --- Newsletter --------------------------------------------------------- */

  function wireSignup() {
    var form = document.getElementById("signupForm");
    var email = document.getElementById("signupEmail");
    var field = email.closest(".field");
    var status = document.getElementById("signupStatus");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var valid = EMAIL.test(email.value.trim());
      field.classList.toggle("is-invalid", !valid);
      email.setAttribute("aria-invalid", String(!valid));

      if (!valid) {
        status.textContent = "A reachable email, please.";
        email.focus();
        return;
      }

      status.textContent =
        "Noted. This storefront is a demonstration, so no email was stored or sent.";
      form.reset();
    });
  }

  /* --- Boot --------------------------------------------------------------- */

  function boot() {
    app.theme.init();
    document.getElementById("markEmblem").innerHTML = app.garments.emblem();

    app.panels.init();
    app.cart.init();
    app.shop.init();
    app.product.init();
    app.countdown.init();

    wireSignup();
    markReveals();
    app.motion.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.P1900);
