/* ==========================================================================
   shop.js — the grid. Collection filters in the rail, the search field in
   the top bar, and the cards themselves. A search looks across the whole
   release; clearing it returns you to the collection you were in.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var NAMES = { new: "New", classics: "Classics", all: "Everything" };
  var NARROW_SEARCH = "(max-width: 40rem)";

  var record = null;
  var el = null;
  var nodes = {};
  var state = { filter: "new", query: "" };
  var visible = [];

  /* --- Selection ------------------------------------------------------------ */

  function matches(product, query) {
    var haystack = [product.name, product.colour, product.cut, product.collection]
      .join(" ")
      .toLowerCase();
    return query.split(/\s+/).every(function (word) {
      return haystack.indexOf(word) !== -1;
    });
  }

  function select() {
    var query = state.query.trim().toLowerCase();
    return app.products.filter(function (product) {
      return query ? matches(product, query) : record.inCollection(product, state.filter);
    });
  }

  /* --- Cards ---------------------------------------------------------------- */

  function isOneSize(product) {
    return record.sizeList(product).length === 1;
  }

  function buildCard(product) {
    var soldOut = record.isSoldOut(product);
    var name = record.title(product);
    var card = el("article", "product-card");
    card.dataset.id = product.id;
    if (soldOut) card.dataset.state = "soldout";

    var flagText = soldOut ? "Sold out" : product.flag;
    if (flagText) card.appendChild(el("span", "product-flag", flagText));

    var figure = el("div", "product-figure");
    figure.innerHTML = app.garments.draw(product);
    card.appendChild(figure);

    var caption = el("div", "product-caption");
    var heading = el("h2", "product-name");
    var open = el("button", "product-open", name);
    open.dataset.open = product.id;
    heading.appendChild(open);
    caption.appendChild(heading);
    caption.appendChild(el("p", "product-price", record.money(product.price)));
    card.appendChild(caption);

    if (!soldOut) {
      var oneSize = isOneSize(product);
      var quick = el("button", "quick-add", oneSize ? "Add to cart" : "Choose size");
      quick.dataset.quick = product.id;
      quick.setAttribute("aria-label", (oneSize ? "Add to cart: " : "Choose a size: ") + name);
      card.appendChild(quick);
    }

    return card;
  }

  /* --- Render --------------------------------------------------------------- */

  function render() {
    visible = select();
    var searching = Boolean(state.query.trim());

    nodes.grid.replaceChildren.apply(nodes.grid, visible.map(buildCard));
    nodes.name.textContent = searching ? "Search" : NAMES[state.filter];
    nodes.count.textContent = String(visible.length);
    nodes.clear.hidden = !searching;
    nodes.empty.hidden = visible.length > 0;

    nodes.filters.forEach(function (button) {
      var active = !searching && button.dataset.filter === state.filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setFilter(filter) {
    state = { filter: NAMES[filter] ? filter : "all", query: "" };
    nodes.input.value = "";
    render();
  }

  function setQuery(query) {
    state = { filter: state.filter, query: query };
    render();
  }

  function scrollToShop() {
    nodes.shop.scrollIntoView({ block: "start" });
  }

  /* --- Search (collapses to an icon on phones) ------------------------------ */

  function setSearchOpen(isOpen) {
    nodes.form.classList.toggle("is-open", isOpen);
    nodes.searchToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) nodes.input.focus();
  }

  function wireSearch() {
    var narrow = window.matchMedia(NARROW_SEARCH);

    nodes.searchToggle.addEventListener("click", function () {
      if (!narrow.matches) {
        nodes.input.focus();
        return;
      }
      setSearchOpen(!nodes.form.classList.contains("is-open"));
    });

    narrow.addEventListener("change", function () {
      setSearchOpen(false);
    });

    nodes.form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (narrow.matches) setSearchOpen(false);
      scrollToShop();
    });

    nodes.input.addEventListener("input", function () {
      setQuery(nodes.input.value);
    });

    nodes.input.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      nodes.input.value = "";
      setQuery("");
      if (narrow.matches) {
        setSearchOpen(false);
        nodes.searchToggle.focus();
      }
    });
  }

  /* --- Wiring ----------------------------------------------------------------- */

  function wireGrid() {
    nodes.grid.addEventListener("click", function (event) {
      var quick = event.target.closest("[data-quick]");
      var open = event.target.closest("[data-open]");

      if (quick) {
        var product = record.byId(quick.dataset.quick);
        if (isOneSize(product)) {
          app.cart.add(product.id, record.sizeList(product)[0]);
          app.panels.open("cart");
        } else {
          app.product.open(product.id);
        }
        return;
      }

      if (open) app.product.open(open.dataset.open);
    });
  }

  function wireFilters() {
    nodes.filters.forEach(function (button) {
      button.addEventListener("click", function () {
        setFilter(button.dataset.filter);
        app.panels.close("rail");
        scrollToShop();
      });
    });

    nodes.clear.addEventListener("click", function () {
      setFilter(state.filter);
      nodes.input.focus();
    });

    document.querySelectorAll("[data-reset]").forEach(function (button) {
      button.addEventListener("click", function () {
        setFilter("all");
      });
    });
  }

  function init() {
    record = app.shopRecord;
    el = app.dom.el;
    nodes = {
      shop: document.getElementById("shop"),
      grid: document.getElementById("productGrid"),
      name: document.getElementById("collectionName"),
      count: document.getElementById("resultCount"),
      clear: document.getElementById("clearSearch"),
      empty: document.getElementById("emptyState"),
      form: document.getElementById("searchForm"),
      input: document.getElementById("searchInput"),
      searchToggle: document.getElementById("searchToggle"),
      filters: Array.prototype.slice.call(document.querySelectorAll("[data-filter]"))
    };

    wireGrid();
    wireFilters();
    wireSearch();
    render();
  }

  /** Product ids in the order the grid shows them, for the dialog's prev/next. */
  function visibleIds() {
    return visible.map(function (product) {
      return product.id;
    });
  }

  app.shop = { init: init, setFilter: setFilter, visibleIds: visibleIds };
})(window.P1900);
