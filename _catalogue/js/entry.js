/* ==========================================================================
   entry.js — the catalogue entry dialog: one work, at length.
   Uses the native <dialog>, so Escape, focus trapping and focus return
   come from the platform rather than from hand-written key handling.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var el = {};
  var current = null;

  function specRow(term, value) {
    return (
      "<div><dt>" + term + "</dt><dd>" + app.plates.escapeAttr(value) + "</dd></div>"
    );
  }

  function paint(work) {
    var esc = app.plates.escapeAttr;

    current = work;
    el.plate.innerHTML = app.plates.render(work);
    el.no.textContent = "Plate No. " + app.record.plateNo(work.no);
    el.title.textContent = work.title;
    el.artist.textContent = work.artist;

    el.spec.innerHTML =
      specRow("Medium", app.record.mediumLabel(work.medium)) +
      specRow("Materials", work.materials) +
      specRow("Year", String(work.year)) +
      specRow("Dimensions", work.dimensions) +
      specRow("Edition", work.edition) +
      specRow("Provenance", work.provenance) +
      specRow("Status", app.record.stateLabel(work));

    el.note.textContent = work.note;
    el.price.textContent = app.record.priceLabel(work);
    el.price.setAttribute("aria-label", "Price: " + app.record.priceLabel(work));
    el.dialog.setAttribute("aria-label", "Plate " + app.record.plateNo(work.no) + ", " + work.title);

    syncShortlistButton();
  }

  function syncShortlistButton() {
    if (!current) return;
    var on = app.shortlist.has(current.no);
    el.add.setAttribute("aria-pressed", String(on));
    el.add.textContent = on ? "Remove from shortlist" : "Add to shortlist";
  }

  function step(delta) {
    if (!current) return;
    var order = app.works;
    var at = order.indexOf(current);
    var next = order[(at + delta + order.length) % order.length];
    paint(next);
    el.body.scrollTop = 0;
  }

  function open(no) {
    var work = app.record.byNo(no);
    if (!work) return;
    paint(work);
    if (!el.dialog.open) {
      el.dialog.showModal();
      app.panels.lockScroll(true);
    }
    el.close.focus();
  }

  function close() {
    if (el.dialog.open) el.dialog.close();
  }

  function init() {
    el.dialog = document.getElementById("entryDialog");
    el.plate = document.getElementById("entryPlate");
    el.body = el.dialog.querySelector(".entry-body");
    el.no = document.getElementById("entryNo");
    el.title = document.getElementById("entryTitle");
    el.artist = document.getElementById("entryArtist");
    el.spec = document.getElementById("entrySpec");
    el.note = document.getElementById("entryNote");
    el.price = document.getElementById("entryPrice");
    el.add = document.getElementById("entryShortlist");
    el.close = document.getElementById("entryClose");

    el.close.addEventListener("click", close);

    el.add.addEventListener("click", function () {
      if (current) app.shortlist.toggle(current.no);
    });

    document.getElementById("entryPrev").addEventListener("click", function () {
      step(-1);
    });
    document.getElementById("entryNext").addEventListener("click", function () {
      step(1);
    });

    // Click outside the entry card closes it.
    el.dialog.addEventListener("click", function (event) {
      if (event.target === el.dialog) close();
    });

    el.dialog.addEventListener("close", function () {
      app.panels.lockScroll(false);
      current = null;
    });

    el.dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
    });

    document.addEventListener("shortlist:change", syncShortlistButton);
  }

  app.entry = { init: init, open: open, close: close };
})(window.P1900);
