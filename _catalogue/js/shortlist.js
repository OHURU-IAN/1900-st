/* ==========================================================================
   shortlist.js — the collector's slip. Holds plate numbers, survives a
   reload, and broadcasts "shortlist:change" whenever it moves.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var STORAGE_KEY = "p1900.shortlist.v1";

  var selected = [];
  var el = {};

  /* --- Persistence -------------------------------------------------------- */

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw).filter(function (no) {
        return app.record.byNo(no) !== null;
      });
    } catch (error) {
      // Private browsing, disabled storage, or corrupt JSON: start empty
      // rather than break the page.
      return [];
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch (error) {
      /* Nothing to do — the shortlist simply will not persist. */
    }
  }

  /* --- State -------------------------------------------------------------- */

  function has(no) {
    return selected.indexOf(Number(no)) !== -1;
  }

  function list() {
    return selected
      .map(function (no) {
        return app.record.byNo(no);
      })
      .filter(Boolean)
      .sort(function (a, b) {
        return a.no - b.no;
      });
  }

  function announce() {
    save();
    render();
    document.dispatchEvent(new CustomEvent("shortlist:change"));
  }

  function toggle(no) {
    var value = Number(no);
    var at = selected.indexOf(value);
    if (at === -1) {
      selected.push(value);
    } else {
      selected.splice(at, 1);
    }
    announce();
  }

  function remove(no) {
    var at = selected.indexOf(Number(no));
    if (at === -1) return;
    selected.splice(at, 1);
    announce();
  }

  function clear() {
    selected = [];
    announce();
  }

  /* --- Totals ------------------------------------------------------------- */

  function totalLabel(works) {
    var priced = works.filter(function (work) {
      return typeof work.price === "number" && work.state !== "sold";
    });
    var unpriced = works.length - priced.length;
    var sum = priced.reduce(function (running, work) {
      return running + work.price;
    }, 0);

    if (!priced.length) {
      return unpriced ? "On request" : "—";
    }

    var label = "$" + sum.toLocaleString("en-US");
    return unpriced ? label + " + " + unpriced + " on request" : label;
  }

  /* --- View --------------------------------------------------------------- */

  function render() {
    var works = list();
    var esc = app.plates.escapeAttr;

    el.count.textContent = String(works.length).padStart(2, "0");
    el.trigger.classList.toggle("has-items", works.length > 0);

    el.empty.hidden = works.length > 0;
    el.foot.hidden = works.length === 0;
    el.items.innerHTML = "";

    works.forEach(function (work) {
      var item = document.createElement("li");
      item.innerHTML =
        '<span class="shortlist-no">' + app.record.plateNo(work.no) + "</span>" +
        '<span><span class="shortlist-name">' + esc(work.title) + "</span>" +
        '<span class="shortlist-price">' + esc(work.artist) + " &middot; " +
        esc(app.record.priceLabel(work)) + "</span></span>" +
        '<button type="button" class="shortlist-remove" aria-label="Remove ' +
        esc(work.title) + ' from your shortlist">&#10005;</button>';

      item.querySelector("button").addEventListener("click", function () {
        remove(work.no);
      });

      el.items.appendChild(item);
    });

    el.total.textContent = totalLabel(works);

    if (el.attached) {
      el.attached.classList.toggle("has-items", works.length > 0);
      el.attached.textContent = works.length
        ? "Attached: " +
          works
            .map(function (work) {
              return "No. " + app.record.plateNo(work.no) + " " + work.title;
            })
            .join(", ") +
          "."
        : "No works attached — your shortlist is empty.";
    }
  }

  function init() {
    el.count = document.getElementById("shortlistCount");
    el.trigger = document.getElementById("shortlistButton");
    el.items = document.getElementById("shortlistItems");
    el.empty = document.getElementById("shortlistEmpty");
    el.foot = document.getElementById("shortlistFoot");
    el.total = document.getElementById("shortlistTotal");
    el.attached = document.getElementById("enquiryAttached");

    selected = load();
    document.getElementById("clearShortlist").addEventListener("click", clear);
    render();
  }

  app.shortlist = {
    init: init,
    has: has,
    list: list,
    toggle: toggle,
    remove: remove,
    clear: clear
  };
})(window.P1900);
