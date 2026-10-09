/* ==========================================================================
   products.js — the release. Single source of truth for the whole storefront:
   grid, dialog, cart and archive all read from here.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var CURRENT_DROP = 7;

  var products = [
    {
      id: "st-zip-hoodie-black",
      name: "ST Zip Hoodie",
      colour: "Black",
      cut: "zip-hoodie",
      print: "chest",
      price: 120,
      collection: "new",
      flag: "New",
      palette: { shell: "#1c1c1c", rib: "#141414", trim: "#101010", print: "#ececec" },
      fabric: "430 gsm brushed-back loopback cotton",
      fit: "Boxy, drop shoulder. Take your usual size.",
      care: "Cold wash inside out. Do not tumble.",
      copy:
        "The heavyweight zip, cut short in the body and wide across the chest. Garment-dyed after making so the black settles unevenly — no two are the same depth.",
      sizes: { XS: 4, S: 12, M: 18, L: 14, XL: 6 }
    },
    {
      id: "st-zip-hoodie-pink",
      name: "ST Zip Hoodie",
      colour: "Pink",
      cut: "zip-hoodie",
      print: "back",
      price: 120,
      collection: "new",
      flag: "New",
      palette: { shell: "#f2a8c4", rib: "#e894b3", trim: "#d98aab", print: "#3a3a3a" },
      fabric: "430 gsm brushed-back loopback cotton",
      fit: "Boxy, drop shoulder. Take your usual size.",
      care: "Cold wash inside out. Do not tumble.",
      copy:
        "Same block as the black, dyed a colour that will fade and was always meant to. Full-width emblem across the back, printed in soft-hand ink so it moves with the fabric.",
      sizes: { XS: 3, S: 0, M: 9, L: 7, XL: 2 }
    },
    {
      id: "st-sweatpant-black",
      name: "ST Sweatpant",
      colour: "Black",
      cut: "sweatpant",
      print: "thigh",
      price: 110,
      collection: "new",
      flag: "New",
      palette: { shell: "#1c1c1c", rib: "#141414", trim: "#101010", print: "#ececec" },
      fabric: "430 gsm brushed-back loopback cotton",
      fit: "Wide leg, elasticated cuff. Sits on the hip.",
      care: "Cold wash inside out. Do not tumble.",
      copy:
        "Cut to match the zip hoodie in the same weight and dye lot. Deep side pockets, flat drawcord, no branding beyond the leg emblem.",
      sizes: { XS: 5, S: 14, M: 16, L: 11, XL: 5 }
    },
    {
      id: "st-sweatpant-bone",
      name: "ST Sweatpant",
      colour: "Bone",
      cut: "sweatpant",
      print: "thigh",
      price: 110,
      collection: "new",
      palette: { shell: "#e4dfd3", rib: "#d8d2c4", trim: "#cdc6b6", print: "#2a2a2a" },
      fabric: "430 gsm brushed-back loopback cotton",
      fit: "Wide leg, elasticated cuff. Sits on the hip.",
      care: "Cold wash inside out. Do not tumble.",
      copy:
        "Undyed shell, so the cotton keeps its own colour. It marks easily. That is the point, and it is not a fault.",
      sizes: { XS: 2, S: 8, M: 10, L: 6, XL: 0 }
    },
    {
      id: "tower-tee-bone",
      name: "Tower Tee",
      colour: "Bone",
      cut: "tee",
      print: "chest",
      price: 45,
      collection: "new",
      flag: "New",
      palette: { shell: "#e6e1d6", rib: "#dbd5c7", trim: "#cfc8b8", print: "#1f1f1f" },
      fabric: "260 gsm single jersey, tubular body",
      fit: "Straight, mid-weight. Size down for a lean fit.",
      care: "Cold wash. Warm iron on the reverse.",
      copy:
        "A tee with enough body to hold its shape after the first wash. Tubular knit, so there are no side seams to twist.",
      sizes: { XS: 8, S: 20, M: 24, L: 18, XL: 9 }
    },
    {
      id: "tower-tee-black",
      name: "Tower Tee",
      colour: "Black",
      cut: "tee",
      print: "chest",
      price: 45,
      collection: "new",
      palette: { shell: "#191919", rib: "#121212", trim: "#0d0d0d", print: "#ececec" },
      fabric: "260 gsm single jersey, tubular body",
      fit: "Straight, mid-weight. Size down for a lean fit.",
      care: "Cold wash. Warm iron on the reverse.",
      copy:
        "Sold through in four hours on the last release. This is the restock, and the last of the dye lot.",
      sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0 }
    },
    {
      id: "hazard-jacket-red",
      name: "Hazard Jacket",
      colour: "Signal Red",
      cut: "jacket",
      print: "chest",
      price: 220,
      collection: "new",
      flag: "1 of 60",
      palette: { shell: "#ab2018", rib: "#8f1a13", trim: "#7a1610", print: "#f2f2f2" },
      fabric: "Coated ripstop, taped seams, mesh lining",
      fit: "Oversized. Layers over the zip hoodie without pulling.",
      care: "Sponge clean. Never dry clean.",
      copy:
        "Sixty made, numbered inside the placket. Storm flap over a two-way zip, articulated elbow, hem cord that actually holds.",
      sizes: { XS: 0, S: 6, M: 12, L: 9, XL: 4 }
    },
    {
      id: "reservoir-crewneck-slate",
      name: "Reservoir Crewneck",
      colour: "Slate",
      cut: "crewneck",
      print: "chest",
      price: 95,
      collection: "classics",
      palette: { shell: "#59636e", rib: "#4b545e", trim: "#414952", print: "#e8e8e8" },
      fabric: "380 gsm loopback cotton, ribbed trims",
      fit: "Regular through the body, set-in sleeve.",
      care: "Cold wash inside out. Do not tumble.",
      copy:
        "The house crewneck, unchanged since the first drop. Ribbed collar taped at the back so it keeps its shape.",
      sizes: { XS: 4, S: 10, M: 15, L: 12, XL: 5 }
    },
    {
      id: "nightwatch-cargo-olive",
      name: "Nightwatch Cargo",
      colour: "Olive",
      cut: "cargo",
      print: "thigh",
      price: 130,
      collection: "classics",
      palette: { shell: "#4f5541", rib: "#454a38", trim: "#3b402f", print: "#e6e6e6" },
      fabric: "Washed cotton twill, 8.5 oz",
      fit: "Straight leg, sits low. Roomy through the thigh.",
      care: "Warm wash. Tumble low.",
      copy:
        "Two bellows pockets set back so they do not catch when you sit. Washed twice before it leaves the factory.",
      sizes: { XS: 2, S: 9, M: 13, L: 10, XL: 6 }
    },
    {
      id: "st-shorts-bone",
      name: "ST Shorts",
      colour: "Bone",
      cut: "shorts",
      print: "thigh",
      price: 70,
      collection: "classics",
      palette: { shell: "#e4dfd3", rib: "#d8d2c4", trim: "#cdc6b6", print: "#2a2a2a" },
      fabric: "430 gsm brushed-back loopback cotton",
      fit: "Above the knee, wide leg.",
      care: "Cold wash inside out. Do not tumble.",
      copy: "The sweatpant, cut off. Same weight, same waistband, half the length.",
      sizes: { S: 7, M: 11, L: 8, XL: 3 }
    },
    {
      id: "st-cap-black",
      name: "ST Cap",
      colour: "Black",
      cut: "cap",
      print: "chest",
      price: 40,
      collection: "classics",
      palette: { shell: "#1c1c1c", rib: "#141414", trim: "#0e0e0e", print: "#ececec" },
      fabric: "Washed cotton twill, six panel",
      fit: "One size, metal clasp at the back.",
      care: "Sponge clean only.",
      copy: "Low crown, pre-curved brim, no buckram. It packs flat and comes back out fine.",
      sizes: { "One size": 22 }
    },
    {
      id: "signal-beanie-grey",
      name: "Signal Beanie",
      colour: "Grey",
      cut: "beanie",
      print: "chest",
      price: 35,
      collection: "classics",
      palette: { shell: "#8d8d8d", rib: "#7c7c7c", trim: "#6c6c6c", print: "#161616" },
      fabric: "Lambswool, fine rib, turned cuff",
      fit: "One size, deep enough to cover the ear.",
      care: "Hand wash cool. Dry flat.",
      copy: "Knitted in a mill that has made nothing else for forty years. Woven label on the cuff.",
      sizes: { "One size": 0 }
    }
  ];

  /* --- Derived helpers ---------------------------------------------------- */

  function stockOf(product) {
    return Object.keys(product.sizes).reduce(function (total, size) {
      return total + product.sizes[size];
    }, 0);
  }

  function isSoldOut(product) {
    return stockOf(product) === 0;
  }

  function sizeList(product) {
    return Object.keys(product.sizes);
  }

  function money(amount) {
    return "£" + amount.toFixed(2);
  }

  function title(product) {
    return product.name + " [" + product.colour + "]";
  }

  function byId(id) {
    for (var i = 0; i < products.length; i += 1) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  function inCollection(product, collection) {
    return collection === "all" || product.collection === collection;
  }

  function countIn(collection) {
    return products.filter(function (product) {
      return inCollection(product, collection);
    }).length;
  }

  app.products = products;
  app.shopRecord = {
    drop: CURRENT_DROP,
    stockOf: stockOf,
    isSoldOut: isSoldOut,
    sizeList: sizeList,
    money: money,
    title: title,
    byId: byId,
    inCollection: inCollection,
    countIn: countIn
  };
})(window.P1900);
