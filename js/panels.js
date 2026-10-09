/* ==========================================================================
   panels.js — the two side panels, the scrim behind them, and the single
   scroll lock shared with the entry dialog.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var panels = {};
  var scrim = null;
  var openName = null;
  var lockCount = 0;

  /* --- Scroll lock -------------------------------------------------------- */

  function lockScroll(on) {
    lockCount = Math.max(0, lockCount + (on ? 1 : -1));
    document.documentElement.classList.toggle("is-locked", lockCount > 0);
  }

  /* --- Open / close ------------------------------------------------------- */

  function setPanelState(panel, isOpen) {
    panel.node.classList.toggle("is-open", isOpen);
    panel.node.setAttribute("aria-hidden", String(!isOpen));
    panel.trigger.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      panel.node.removeAttribute("inert");
    } else {
      panel.node.setAttribute("inert", "");
    }
  }

  function open(name) {
    var panel = panels[name];
    if (!panel || openName === name) return;
    if (openName) close();

    openName = name;
    setPanelState(panel, true);
    scrim.hidden = false;
    // Next frame, so the opacity transition has a starting value to run from.
    requestAnimationFrame(function () {
      scrim.classList.add("is-visible");
    });
    lockScroll(true);
    panel.closer.focus();
  }

  function close() {
    if (!openName) return;
    var panel = panels[openName];

    setPanelState(panel, false);
    scrim.classList.remove("is-visible");
    lockScroll(false);
    openName = null;

    window.setTimeout(function () {
      if (!openName) scrim.hidden = true;
    }, 280);

    panel.trigger.focus();
  }

  function toggle(name) {
    if (openName === name) {
      close();
    } else {
      open(name);
    }
  }

  /* --- Wiring ------------------------------------------------------------- */

  function register(name, nodeId, triggerId, closerId) {
    var panel = {
      node: document.getElementById(nodeId),
      trigger: document.getElementById(triggerId),
      closer: document.getElementById(closerId)
    };
    panels[name] = panel;

    panel.trigger.addEventListener("click", function () {
      toggle(name);
    });
    panel.closer.addEventListener("click", close);
    setPanelState(panel, false);
  }

  function init() {
    scrim = document.getElementById("scrim");

    register("contents", "drawer", "menuButton", "closeMenuButton");
    register("shortlist", "shortlistPanel", "shortlistButton", "closeShortlistButton");

    scrim.addEventListener("click", close);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && openName) close();
    });

    // Contents links: jump to the section, and where a link stands for a
    // medium, set that filter on the way through.
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      link.addEventListener("click", function () {
        var filter = link.dataset.applyFilter;
        if (filter) app.catalogue.setFilter(filter);
        close();
      });
    });

    document.querySelectorAll("[data-close-shortlist]").forEach(function (node) {
      node.addEventListener("click", close);
    });

    // Artist rows search the catalogue for that name, which is visible in the
    // search field rather than being a hidden filter state.
    document.querySelectorAll(".artist-row").forEach(function (row) {
      row.addEventListener("click", function () {
        app.catalogue.setFilter("all");
        app.catalogue.setQuery(row.dataset.artist);
        document.getElementById("catalogue").scrollIntoView({ block: "start" });
      });
    });
  }

  app.panels = { init: init, open: open, close: close, lockScroll: lockScroll };
})(window.P1900);
