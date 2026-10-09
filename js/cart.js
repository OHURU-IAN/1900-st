/* ==========================================================================
   cart.js — lines of { id, size, qty }, capped at the units held for that
   size. Kept in localStorage so a reload doesn't empty it; if storage is
   unavailable the cart simply lasts for the visit.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var STORAGE_KEY = "p1900.cart";
  var DEMO_NOTE =
    "This storefront is a demonstration. No payment is taken and nothing has been charged.";

  var record = null;
  var el = null;
  var nodes = {};
  var lines = [];

  /* --- Stock ------------------------------------------------------------------ */

  function unitsHeld(id, size) {
    var product = record.byId(id);
    return product && product.sizes[size] ? product.sizes[size] : 0;
  }

  /** Drops lines for products or sizes that no longer exist, and clamps quantities. */
  function sanitise(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(function (line) {
        return line && typeof line.id === "string" && typeof line.size === "string";
      })
      .map(function (line) {
        var qty = Math.min(Math.floor(Number(line.qty)) || 0, unitsHeld(line.id, line.size));
        return { id: line.id, size: line.size, qty: qty };
      })
      .filter(function (line) {
        return line.qty > 0;
      });
  }

  /* --- Storage ---------------------------------------------------------------- */

  function load() {
    try {
      return sanitise(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch (error) {
      return [];
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch (error) {
      // Storage blocked (private window, quota): the cart still works for this visit.
    }
  }

  /* --- Changes ---------------------------------------------------------------- */

  function commit(next) {
    lines = next;
    save();
    render();
  }

  function sameLine(id, size) {
    return function (line) {
      return line.id === id && line.size === size;
    };
  }

  function setQty(id, size, qty) {
    var capped = Math.max(0, Math.min(qty, unitsHeld(id, size)));
    var exists = lines.some(sameLine(id, size));
    var next = exists
      ? lines.map(function (line) {
          return sameLine(id, size)(line) ? { id: id, size: size, qty: capped } : line;
        })
      : lines.concat([{ id: id, size: size, qty: capped }]);

    commit(
      next.filter(function (line) {
        return line.qty > 0;
      })
    );
  }

  function qtyOf(id, size) {
    var line = lines.filter(sameLine(id, size))[0];
    return line ? line.qty : 0;
  }

  /** Adds one unit. Returns false when that size is already at its stock limit. */
  function add(id, size) {
    var current = qtyOf(id, size);
    if (current >= unitsHeld(id, size)) return false;
    setQty(id, size, current + 1);
    return true;
  }

  /* --- Render ----------------------------------------------------------------- */

  function qtyButton(label, symbol, action, line, disabled) {
    var button = el("button", "", symbol);
    button.dataset.action = action;
    button.dataset.id = line.id;
    button.dataset.size = line.size;
    button.setAttribute("aria-label", label);
    button.disabled = Boolean(disabled);
    return button;
  }

  function buildLine(line) {
    var product = record.byId(line.id);
    var name = record.title(product);
    var item = el("li");

    var thumb = el("span", "cart-thumb");
    thumb.innerHTML = app.garments.draw(product);
    item.appendChild(thumb);

    var detail = el("div");
    detail.appendChild(el("span", "cart-name", name));
    detail.appendChild(el("span", "cart-meta", "Size " + line.size));
    var qty = el("span", "cart-qty");
    qty.appendChild(qtyButton("One fewer " + name, "−", "dec", line));
    qty.appendChild(el("span", "", String(line.qty)));
    qty.appendChild(
      qtyButton("One more " + name, "+", "inc", line, line.qty >= unitsHeld(line.id, line.size))
    );
    detail.appendChild(qty);
    item.appendChild(detail);

    var total = el("div", "cart-line", record.money(product.price * line.qty));
    var remove = el("button", "cart-remove", "Remove");
    remove.dataset.action = "remove";
    remove.dataset.id = line.id;
    remove.dataset.size = line.size;
    remove.setAttribute("aria-label", "Remove " + name);
    total.appendChild(remove);
    item.appendChild(total);

    return item;
  }

  function render() {
    var count = lines.reduce(function (sum, line) {
      return sum + line.qty;
    }, 0);
    var subtotal = lines.reduce(function (sum, line) {
      return sum + record.byId(line.id).price * line.qty;
    }, 0);

    nodes.count.textContent = String(count);
    nodes.button.classList.toggle("has-items", count > 0);
    nodes.empty.hidden = count > 0;
    nodes.foot.hidden = count === 0;
    nodes.total.textContent = record.money(subtotal);
    nodes.note.textContent = nodes.note.dataset.base;
    nodes.items.replaceChildren.apply(nodes.items, lines.map(buildLine));
  }

  /* --- Wiring ------------------------------------------------------------------- */

  function wire() {
    nodes.items.addEventListener("click", function (event) {
      var button = event.target.closest("[data-action]");
      if (!button) return;

      var id = button.dataset.id;
      var size = button.dataset.size;
      var current = qtyOf(id, size);
      var action = button.dataset.action;

      if (action === "inc") setQty(id, size, current + 1);
      if (action === "dec") setQty(id, size, current - 1);
      if (action === "remove") setQty(id, size, 0);

      // Rows are rebuilt on every change: put focus back on the same control,
      // or on Close if that row (or that control) has gone.
      var again = nodes.items.querySelector(
        '[data-action="' + action + '"][data-id="' + CSS.escape(id) + '"][data-size="' +
          CSS.escape(size) + '"]'
      );
      (again && !again.disabled ? again : nodes.close).focus();
    });

    nodes.clear.addEventListener("click", function () {
      commit([]);
      nodes.close.focus();
    });

    nodes.checkout.addEventListener("click", function () {
      nodes.note.textContent = DEMO_NOTE;
    });
  }

  function init() {
    record = app.shopRecord;
    el = app.dom.el;
    nodes = {
      button: document.getElementById("cartButton"),
      close: document.getElementById("closeCartButton"),
      count: document.getElementById("cartCount"),
      items: document.getElementById("cartItems"),
      empty: document.getElementById("cartEmpty"),
      foot: document.getElementById("cartFoot"),
      total: document.getElementById("cartTotal"),
      clear: document.getElementById("clearCart"),
      checkout: document.getElementById("cartCheckout"),
      note: document.querySelector(".cart-note")
    };
    nodes.note.dataset.base = nodes.note.textContent;
    nodes.note.setAttribute("aria-live", "polite");

    lines = load();
    wire();
    render();
  }

  app.cart = { init: init, add: add, qtyOf: qtyOf };
})(window.P1900);
