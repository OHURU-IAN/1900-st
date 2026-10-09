/* ==========================================================================
   main.js — bootstrap. Order matters: records, then views, then motion.
   ========================================================================== */

(function (app) {
  "use strict";

  /* --- Sticky geometry ---------------------------------------------------- */

  /** The contents bar sticks directly beneath the masthead, whatever its height. */
  function trackMastheadHeight() {
    var masthead = document.querySelector(".masthead");

    function measure() {
      var height = Math.round(masthead.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--sticky-offset", height + "px");
      document.documentElement.style.setProperty("scroll-padding-top", height + 24 + "px");
    }

    measure();
    if ("ResizeObserver" in window) {
      new ResizeObserver(measure).observe(masthead);
    } else {
      window.addEventListener("resize", measure);
    }
  }

  /* --- Reveal targets ----------------------------------------------------- */

  function markReveals() {
    var selectors = [
      ".colophon-title",
      ".colophon-index",
      ".colophon-spec",
      ".section-head",
      ".archive-list li",
      ".artist-index li",
      ".enquiry",
      ".footer-grid"
    ];

    document.querySelectorAll(selectors.join(",")).forEach(function (node) {
      node.setAttribute("data-reveal", "");
    });
  }

  /* --- Enquiry form ------------------------------------------------------- */

  function fieldOf(input) {
    return input.closest(".field");
  }

  function setFieldError(input, message) {
    var field = fieldOf(input);
    var existing = field.querySelector(".field-error");

    field.classList.toggle("is-invalid", Boolean(message));
    input.setAttribute("aria-invalid", String(Boolean(message)));

    if (!message) {
      if (existing) existing.remove();
      return;
    }
    if (existing) {
      existing.textContent = message;
      return;
    }
    var note = document.createElement("p");
    note.className = "field-error";
    note.textContent = message;
    field.appendChild(note);
  }

  function wireEnquiry() {
    var form = document.getElementById("enquiryForm");
    var name = document.getElementById("enquiryName");
    var email = document.getElementById("enquiryEmail");
    var status = document.getElementById("formStatus");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var problems = 0;

      if (!name.value.trim()) {
        setFieldError(name, "Tell us who is asking");
        problems += 1;
      } else {
        setFieldError(name, "");
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        setFieldError(email, "A reachable email, please");
        problems += 1;
      } else {
        setFieldError(email, "");
      }

      if (problems) {
        status.textContent = "";
        (problems && fieldOf(name).classList.contains("is-invalid") ? name : email).focus();
        return;
      }

      var count = app.shortlist.list().length;
      status.textContent =
        "Enquiry noted" +
        (count ? " with " + count + (count === 1 ? " work" : " works") + " attached" : "") +
        ". This catalogue is a demonstration, so nothing was actually sent.";
      form.reset();
    });
  }

  /* --- Boot --------------------------------------------------------------- */

  function boot() {
    trackMastheadHeight();

    app.shortlist.init();
    app.entry.init();
    app.panels.init();
    app.catalogue.init();

    markReveals();
    app.motion.init();

    wireEnquiry();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.P1900);
