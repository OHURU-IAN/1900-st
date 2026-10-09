/* ==========================================================================
   product.js — the product dialog. Native <dialog>, so focus trapping and
   Escape come from the browser; this module fills it, handles size choice,
   and steps through the pieces in the order the grid shows them.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var LOW_STOCK = 3;

  var record = null;
  var el = null;
  var nodes = {};
  var current = null;
  var chosen = null;
  var opener = null;

  /* --- Sizes ------------------------------------------------------------------ */

  function inStockSizes(product) {
    return record.sizeList(product).filter(function (size) {
      return product.sizes[size] > 0;
    });
  }

  function sizeNote(product) {
    if (record.isSoldOut(product)) return "Sold out";
    if (!chosen) return "Pick a size";
    var held = product.sizes[chosen];
    return held <= LOW_STOCK ? "Only " + held + " left" : "In stock";
  }

  function renderSizes(product) {
    var chips = record.sizeList(product).map(function (size) {
      var held = product.sizes[size];
      var chip = el("button", "size-chip", size);
      chip.dataset.size = size;
      chip.disabled = held === 0;
      chip.setAttribute("aria-pressed", String(size === chosen));
      if (held === 0) chip.setAttribute("aria-label", size + ", sold out");
      return chip;
    });

    nodes.sizeSet.replaceChildren.apply(nodes.sizeSet, chips);
    nodes.sizeNote.textContent = sizeNote(product);
  }

  /* --- Fill ------------------------------------------------------------------- */

  function renderSpec(product) {
    var rows = [
      ["Fabric", product.fabric],
      ["Fit", product.fit],
      ["Care", product.care],
      ["Colour", product.colour]
    ].map(function (row) {
      var wrap = el("div");
      wrap.appendChild(el("dt", "", row[0]));
      wrap.appendChild(el("dd", "", row[1]));
      return wrap;
    });
    nodes.spec.replaceChildren.apply(nodes.spec, rows);
  }

  function renderAdd(product) {
    var soldOut = record.isSoldOut(product);
    nodes.add.disabled = soldOut;
    nodes.add.textContent = soldOut ? "Sold out" : "Add to cart — " + record.money(product.price);
  }

  function fill(product) {
    current = product;
    var open = inStockSizes(product);
    // One-size pieces, or a single size left, need no choice.
    chosen = open.length === 1 && record.sizeList(product).length === 1 ? open[0] : null;

    nodes.figure.innerHTML = app.garments.draw(product);
    nodes.drop.textContent = "Drop " + String(record.drop).padStart(2, "0") +
      " · " + (product.collection === "new" ? "New" : "Classics");
    nodes.title.textContent = record.title(product);
    nodes.price.textContent = record.money(product.price);
    nodes.copy.textContent = product.copy;
    renderSizes(product);
    renderSpec(product);
    renderAdd(product);
    nodes.body.scrollTop = 0;
    nodes.inner.scrollTop = 0;
  }

  /* --- Open / close ------------------------------------------------------------- */

  function open(id) {
    var product = record.byId(id);
    if (!product) return;

    fill(product);
    if (!nodes.dialog.open) {
      opener = document.activeElement;
      nodes.dialog.showModal();
      app.panels.lockScroll(true);
    }
    nodes.close.focus();
  }

  function close() {
    if (nodes.dialog.open) nodes.dialog.close();
  }

  function step(direction) {
    var ids = app.shop.visibleIds();
    if (ids.indexOf(current.id) === -1) {
      ids = app.products.map(function (product) {
        return product.id;
      });
    }
    var index = (ids.indexOf(current.id) + direction + ids.length) % ids.length;
    fill(record.byId(ids[index]));
  }

  /* --- Add ---------------------------------------------------------------------- */

  function addToCart() {
    if (!chosen) {
      nodes.sizeNote.textContent = "Pick a size first";
      var first = nodes.sizeSet.querySelector(".size-chip:not([disabled])");
      if (first) first.focus();
      return;
    }

    if (!app.cart.add(current.id, chosen)) {
      nodes.sizeNote.textContent = "All " + current.sizes[chosen] + " in your cart already";
      return;
    }

    opener = null; // focus goes to the cart, not back to the card
    close();
    app.panels.open("cart");
  }

  /* --- Wiring --------------------------------------------------------------------- */

  function wire() {
    nodes.close.addEventListener("click", close);
    nodes.prev.addEventListener("click", function () {
      step(-1);
    });
    nodes.next.addEventListener("click", function () {
      step(1);
    });
    nodes.add.addEventListener("click", addToCart);

    nodes.sizeSet.addEventListener("click", function (event) {
      var chip = event.target.closest(".size-chip");
      if (!chip || chip.disabled) return;
      chosen = chip.dataset.size;
      renderSizes(current);
      nodes.sizeSet.querySelector('[aria-pressed="true"]').focus();
    });

    // The dialog has no padding, so a click on the dialog element itself is a
    // click on the backdrop.
    nodes.dialog.addEventListener("click", function (event) {
      if (event.target === nodes.dialog) close();
    });

    nodes.dialog.addEventListener("close", function () {
      app.panels.lockScroll(false);
      if (opener && document.body.contains(opener)) opener.focus();
      opener = null;
    });
  }

  function init() {
    record = app.shopRecord;
    el = app.dom.el;
    nodes = {
      dialog: document.getElementById("productDialog"),
      inner: document.querySelector(".product-inner"),
      body: document.querySelector(".product-body"),
      close: document.getElementById("productClose"),
      figure: document.getElementById("productFigure"),
      drop: document.getElementById("productDrop"),
      title: document.getElementById("productTitle"),
      price: document.getElementById("productPrice"),
      copy: document.getElementById("productCopy"),
      sizeSet: document.getElementById("sizeSet"),
      sizeNote: document.getElementById("sizeNote"),
      spec: document.getElementById("productSpec"),
      add: document.getElementById("productAdd"),
      prev: document.getElementById("productPrev"),
      next: document.getElementById("productNext")
    };
    nodes.sizeNote.setAttribute("aria-live", "polite");
    wire();
  }

  app.product = { init: init, open: open, close: close };
})(window.P1900);
