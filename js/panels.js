/* ==========================================================================
   panels.js — the cart panel, the rail as a drawer on narrow screens, their
   scrims, and the single scroll lock shared with the product dialog.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var NARROW = "(max-width: 60rem)";
  var SCRIM_FADE_MS = 280;

  var panels = {};
  var openName = null;
  var lockCount = 0;
  var narrow = null;

  /* --- Scroll lock -------------------------------------------------------- */

  function lockScroll(on) {
    lockCount = Math.max(0, lockCount + (on ? 1 : -1));
    document.documentElement.classList.toggle("is-locked", lockCount > 0);
  }

  /* --- State --------------------------------------------------------------- */

  /** A panel that only exists as a drawer on some widths is "always on" otherwise. */
  function isDrawer(panel) {
    return !panel.narrowOnly || narrow.matches;
  }

  function setPanelState(panel, isOpen) {
    panel.node.classList.toggle("is-open", isOpen);
    panel.trigger.setAttribute("aria-expanded", String(isOpen));

    if (isOpen || !isDrawer(panel)) {
      panel.node.removeAttribute("inert");
      panel.node.removeAttribute("aria-hidden");
    } else {
      panel.node.setAttribute("inert", "");
      panel.node.setAttribute("aria-hidden", "true");
    }
  }

  function showScrim(scrim) {
    scrim.hidden = false;
    // Next frame, so the opacity transition has a starting value to run from.
    requestAnimationFrame(function () {
      scrim.classList.add("is-visible");
    });
  }

  function hideScrim(scrim) {
    scrim.classList.remove("is-visible");
    window.setTimeout(function () {
      if (!scrim.classList.contains("is-visible")) scrim.hidden = true;
    }, SCRIM_FADE_MS);
  }

  /* --- Open / close ---------------------------------------------------------- */

  function close(name, options) {
    if (!openName || (name && name !== openName)) return;
    var panel = panels[openName];
    var returnFocus = !options || options.returnFocus !== false;

    openName = null;
    setPanelState(panel, false);
    hideScrim(panel.scrim);
    lockScroll(false);

    if (returnFocus) panel.trigger.focus({ preventScroll: true });
  }

  function open(name) {
    var panel = panels[name];
    if (!panel || openName === name || !isDrawer(panel)) return;
    if (openName) close(openName, { returnFocus: false });

    openName = name;
    setPanelState(panel, true);
    showScrim(panel.scrim);
    lockScroll(true);
    panel.focusTarget().focus({ preventScroll: true });
  }

  function toggle(name) {
    if (openName === name) {
      close(name);
    } else {
      open(name);
    }
  }

  /* --- Wiring ----------------------------------------------------------------- */

  function register(name, config) {
    var panel = {
      node: document.getElementById(config.node),
      trigger: document.getElementById(config.trigger),
      scrim: document.getElementById(config.scrim),
      narrowOnly: Boolean(config.narrowOnly),
      focusTarget: config.focusTarget
    };
    panels[name] = panel;

    panel.trigger.addEventListener("click", function () {
      toggle(name);
    });
    panel.scrim.addEventListener("click", function () {
      close(name);
    });
    setPanelState(panel, false);
  }

  function init() {
    narrow = window.matchMedia(NARROW);

    register("cart", {
      node: "cartPanel",
      trigger: "cartButton",
      scrim: "scrim",
      focusTarget: function () {
        return document.getElementById("closeCartButton");
      }
    });

    register("rail", {
      node: "rail",
      trigger: "railToggle",
      scrim: "railScrim",
      narrowOnly: true,
      focusTarget: function () {
        return document.querySelector(".rail .rail-link.is-active") ||
          document.querySelector(".rail .rail-link");
      }
    });

    document.getElementById("closeCartButton").addEventListener("click", function () {
      close("cart");
    });

    // "Checkout" in the top bar opens the cart, where checkout actually lives.
    document.getElementById("checkoutLink").addEventListener("click", function (event) {
      event.preventDefault();
      open("cart");
    });

    // Information links in the drawer jump to their section and close it.
    document.querySelectorAll(".rail-pages a, .rail-icons a").forEach(function (link) {
      link.addEventListener("click", function () {
        close("rail", { returnFocus: false });
      });
    });

    // Crossing the breakpoint: the rail stops (or starts) being a drawer.
    narrow.addEventListener("change", function () {
      if (openName === "rail") close("rail", { returnFocus: false });
      setPanelState(panels.rail, false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && openName) close(openName);
    });
  }

  app.panels = { init: init, open: open, close: close, lockScroll: lockScroll };
})(window.P1900);
