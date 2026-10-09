/* ==========================================================================
   theme.js — light/dark. Follows the system until the reader picks one,
   then remembers the pick. The dark palette lives in tokens.css.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var STORAGE_KEY = "p1900.theme";
  var button = null;

  function stored() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function remember(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Storage blocked: the choice holds until the page is closed.
    }
  }

  function apply(theme) {
    var dark = theme === "dark";
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }

  function init() {
    button = document.getElementById("themeToggle");
    var system = window.matchMedia("(prefers-color-scheme: dark)");

    apply(stored() || (system.matches ? "dark" : "light"));

    system.addEventListener("change", function (event) {
      if (!stored()) apply(event.matches ? "dark" : "light");
    });

    button.addEventListener("click", function () {
      var next = button.getAttribute("aria-pressed") === "true" ? "light" : "dark";
      apply(next);
      remember(next);
    });
  }

  app.theme = { init: init };
})(window.P1900);
