/* ==========================================================================
   catalogue.js — builds the plate grid and keeps it in step with the
   medium filter, the search field and the sort order.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var state = { filter: "all", query: "", sort: "plate" };

  var el = {};
  var plateNodes = [];

  /* --- Markup ------------------------------------------------------------- */

  function buildPlate(work) {
    var esc = app.plates.escapeAttr;
    var no = app.record.plateNo(work.no);
    var node = document.createElement("article");

    node.className = "plate";
    node.dataset.no = String(work.no);
    node.dataset.medium = work.medium;
    node.dataset.format = work.format;
    node.dataset.state = work.state;
    node.setAttribute("data-reveal", "");
    node.style.setProperty("--medium-ink", "var(--ink-" + work.medium + ")");

    var stamp =
      work.state === "available"
        ? ""
        : '<span class="plate-stamp">' + esc(app.record.stateLabel(work)) + "</span>";

    node.innerHTML =
      '<div class="plate-art">' +
      app.plates.render(work) +
      stamp +
      '<span class="plate-slip"><span>View entry</span><span aria-hidden="true">&rarr;</span></span>' +
      "</div>" +
      '<div class="plate-caption">' +
      '<span class="plate-head">' +
      '<span class="plate-no">No. ' + no + "</span>" +
      '<span class="plate-medium">' + esc(app.record.mediumLabel(work.medium)) + "</span>" +
      "</span>" +
      '<h3 class="plate-title"><button type="button" class="plate-open">' +
      esc(work.title) +
      "</button></h3>" +
      '<p class="plate-artist">' + esc(work.artist) + "</p>" +
      '<p class="plate-meta">' + esc(work.materials) + ", " + work.year + " &middot; " +
      esc(work.dimensions) + "</p>" +
      '<p class="plate-price"><span>' + esc(app.record.priceLabel(work)) + "</span>" +
      '<span class="plate-state">' + esc(app.record.stateLabel(work)) + "</span></p>" +
      "</div>" +
      '<div class="plate-actions">' +
      '<button type="button" class="plate-add" aria-pressed="false">Add to shortlist</button>' +
      "</div>";

    node.querySelector(".plate-open").addEventListener("click", function () {
      app.entry.open(work.no);
    });

    node.querySelector(".plate-add").addEventListener("click", function () {
      app.shortlist.toggle(work.no);
    });

    return node;
  }

  function build() {
    var fragment = document.createDocumentFragment();

    plateNodes = app.works.map(function (work) {
      var node = buildPlate(work);
      fragment.appendChild(node);
      return node;
    });

    el.grid.appendChild(fragment);
  }

  /* --- Matching ----------------------------------------------------------- */

  function matchesQuery(work, query) {
    if (!query) return true;
    var haystack = [
      work.title,
      work.artist,
      work.materials,
      app.record.mediumLabel(work.medium),
      work.edition,
      String(work.year)
    ]
      .join(" ")
      .toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function sortValue(work) {
    if (state.sort === "title") return work.title.toLowerCase();
    if (state.sort === "price-asc" || state.sort === "price-desc") {
      // Works without a price sit at the end of either direction.
      return typeof work.price === "number" ? work.price : Infinity;
    }
    return work.no;
  }

  function compare(a, b) {
    var va = sortValue(a);
    var vb = sortValue(b);

    if (state.sort === "price-desc") {
      if (va === Infinity && vb === Infinity) return a.no - b.no;
      if (va === Infinity) return 1;
      if (vb === Infinity) return -1;
      return vb - va;
    }
    if (va < vb) return -1;
    if (va > vb) return 1;
    return 0;
  }

  /* --- Applying ----------------------------------------------------------- */

  function apply() {
    var query = state.query.trim().toLowerCase();
    var visible = [];

    app.works.forEach(function (work, index) {
      var inMedium = state.filter === "all" || work.medium === state.filter;
      var hit = inMedium && matchesQuery(work, query);
      plateNodes[index].hidden = !hit;
      if (hit) visible.push(work);
    });

    visible.sort(compare).forEach(function (work, position) {
      nodeFor(work.no).style.order = String(position);
    });

    el.resultCount.textContent = String(visible.length);
    el.emptyState.hidden = visible.length > 0;
    updateFilterCounts(query);
    app.motion.refresh();
  }

  function updateFilterCounts(query) {
    Object.keys(el.counts).forEach(function (medium) {
      var total = app.works.filter(function (work) {
        var inMedium = medium === "all" || work.medium === medium;
        return inMedium && matchesQuery(work, query);
      }).length;
      el.counts[medium].textContent = String(total);
    });
  }

  function nodeFor(no) {
    for (var i = 0; i < plateNodes.length; i += 1) {
      if (plateNodes[i].dataset.no === String(no)) return plateNodes[i];
    }
    return null;
  }

  /* --- Controls ----------------------------------------------------------- */

  function setFilter(medium) {
    state.filter = medium;
    el.filters.forEach(function (button) {
      var active = button.dataset.filter === medium;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    apply();
  }

  function setQuery(value) {
    state.query = value;
    if (el.search.value !== value) el.search.value = value;
    apply();
  }

  function reset() {
    state.sort = "plate";
    el.sort.value = "plate";
    setQuery("");
    setFilter("all");
  }

  /** Reflect a shortlist change on the grid's add buttons. */
  function syncShortlistButtons() {
    plateNodes.forEach(function (node) {
      var on = app.shortlist.has(node.dataset.no);
      var button = node.querySelector(".plate-add");
      button.setAttribute("aria-pressed", String(on));
      button.textContent = on ? "On your shortlist" : "Add to shortlist";
    });
  }

  function init() {
    el.grid = document.getElementById("plateGrid");
    el.search = document.getElementById("searchInput");
    el.sort = document.getElementById("sortSelect");
    el.resultCount = document.getElementById("resultCount");
    el.emptyState = document.getElementById("emptyState");
    el.filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));

    el.counts = {};
    document.querySelectorAll("[data-count-for]").forEach(function (node) {
      el.counts[node.dataset.countFor] = node;
    });

    build();

    el.filters.forEach(function (button) {
      button.addEventListener("click", function () {
        setFilter(button.dataset.filter);
      });
    });

    el.search.addEventListener("input", function () {
      setQuery(el.search.value);
    });

    el.sort.addEventListener("change", function () {
      state.sort = el.sort.value;
      apply();
    });

    document.getElementById("resetButton").addEventListener("click", reset);
    document.querySelectorAll("[data-reset]").forEach(function (button) {
      button.addEventListener("click", reset);
    });

    document.addEventListener("shortlist:change", syncShortlistButtons);

    apply();
    syncShortlistButtons();
  }

  app.catalogue = {
    init: init,
    setFilter: setFilter,
    setQuery: setQuery,
    reset: reset
  };
})(window.P1900);
