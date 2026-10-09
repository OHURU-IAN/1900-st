/* ==========================================================================
   plates.js — generative plate images.

   No photography exists for a fictional catalogue, so each work is drawn:
   a small deterministic composition derived from the plate number, with a
   different recipe per medium. Same plate number always yields the same
   image, in the grid and in the entry dialog alike.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var GROUND = "#fbf8f2";

  var INKS = {
    painting: ["#b0392b", "#b0392b", "#8a3a24", "#8a6a2a", "#2c4560", "#17130f"],
    print: ["#2c4560", "#b0392b", "#5a6b41", "#17130f"],
    sculpture: ["#5a6b41", "#3a342c", "#8a6a2a", "#17130f"],
    photo: ["#8a6a2a", "#2c4560", "#17130f"]
  };

  var FORMATS = {
    portrait: { w: 800, h: 1000 },
    square: { w: 800, h: 800 },
    wide: { w: 1200, h: 760 }
  };

  var uid = 0;

  /* --- Deterministic randomness ------------------------------------------ */

  function makeRng(seed) {
    var t = seed + 0x6d2b79f5;
    return function () {
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function between(rng, min, max) {
    return min + rng() * (max - min);
  }

  function pick(rng, list) {
    return list[Math.floor(rng() * list.length) % list.length];
  }

  function round(value) {
    return Math.round(value * 10) / 10;
  }

  /* --- Shared furniture --------------------------------------------------- */

  /** Faint corner ticks — the crop marks of a printed plate. */
  function cropMarks(w, h) {
    var t = Math.min(w, h) * 0.045;
    var m = Math.min(w, h) * 0.028;
    var corners = [
      [m, m, 1, 1],
      [w - m, m, -1, 1],
      [m, h - m, 1, -1],
      [w - m, h - m, -1, -1]
    ];
    return corners
      .map(function (c) {
        return (
          '<path d="M' +
          round(c[0]) +
          " " +
          round(c[1]) +
          "h" +
          round(t * c[2]) +
          "M" +
          round(c[0]) +
          " " +
          round(c[1]) +
          "v" +
          round(t * c[3]) +
          '" stroke="#17130f" stroke-opacity="0.32" stroke-width="1.5" fill="none"/>'
        );
      })
      .join("");
  }

  /* --- Recipes ------------------------------------------------------------ */

  /** Painting: overlapping fields, one insistent horizon, dragged marks. */
  function painting(rng, w, h) {
    var inks = INKS.painting;
    var out = "";
    var fields = 4 + Math.floor(rng() * 3);
    var i;

    for (i = 0; i < fields; i += 1) {
      var fw = between(rng, w * 0.35, w * 0.95);
      var fh = between(rng, h * 0.22, h * 0.7);
      var x = between(rng, -w * 0.12, w - fw * 0.55);
      var y = between(rng, -h * 0.08, h - fh * 0.5);
      out +=
        '<rect x="' +
        round(x) +
        '" y="' +
        round(y) +
        '" width="' +
        round(fw) +
        '" height="' +
        round(fh) +
        '" fill="' +
        pick(rng, inks) +
        '" opacity="' +
        round(between(rng, 0.24, 0.62)) +
        '" transform="rotate(' +
        round(between(rng, -6, 6)) +
        " " +
        round(x + fw / 2) +
        " " +
        round(y + fh / 2) +
        ')"/>';
    }

    var horizon = between(rng, h * 0.42, h * 0.68);
    out +=
      '<rect x="0" y="' +
      round(horizon) +
      '" width="' +
      w +
      '" height="' +
      round(between(rng, h * 0.02, h * 0.055)) +
      '" fill="#17130f" opacity="0.72"/>';

    for (i = 0; i < 8; i += 1) {
      var sy = between(rng, horizon - h * 0.24, horizon + h * 0.22);
      out +=
        '<rect x="' +
        round(between(rng, w * 0.05, w * 0.55)) +
        '" y="' +
        round(sy) +
        '" width="' +
        round(between(rng, w * 0.1, w * 0.38)) +
        '" height="' +
        round(between(rng, 2, 6)) +
        '" fill="#17130f" opacity="' +
        round(between(rng, 0.12, 0.3)) +
        '"/>';
    }

    return '<g style="mix-blend-mode:multiply">' + out + "</g>";
  }

  /** Print: flat shapes in two inks, deliberately out of register. */
  function printPlate(rng, w, h, id) {
    var inks = INKS.print.slice();
    var primary = pick(rng, inks);
    var secondary = pick(rng, inks.filter(function (ink) {
      return ink !== primary;
    }));
    var offset = between(rng, w * 0.012, w * 0.032);
    var shapes = "";
    var count = 2 + Math.floor(rng() * 2);

    for (var i = 0; i < count; i += 1) {
      var kind = rng();
      if (kind < 0.4) {
        shapes +=
          '<circle cx="' +
          round(between(rng, w * 0.28, w * 0.72)) +
          '" cy="' +
          round(between(rng, h * 0.28, h * 0.68)) +
          '" r="' +
          round(between(rng, w * 0.12, w * 0.3)) +
          '"/>';
      } else if (kind < 0.75) {
        var rw = between(rng, w * 0.22, w * 0.56);
        var rh = between(rng, h * 0.16, h * 0.5);
        shapes +=
          '<rect x="' +
          round(between(rng, w * 0.1, w - rw - w * 0.1)) +
          '" y="' +
          round(between(rng, h * 0.12, h - rh - h * 0.14)) +
          '" width="' +
          round(rw) +
          '" height="' +
          round(rh) +
          '"/>';
      } else {
        var cx = between(rng, w * 0.3, w * 0.7);
        var cy = between(rng, h * 0.3, h * 0.62);
        var r = between(rng, w * 0.14, w * 0.28);
        shapes +=
          '<path d="M' +
          round(cx) +
          " " +
          round(cy - r) +
          "L" +
          round(cx + r) +
          " " +
          round(cy + r) +
          "L" +
          round(cx - r) +
          " " +
          round(cy + r) +
          'Z"/>';
      }
    }

    var group = '<g id="shapes-' + id + '">' + shapes + "</g>";

    return (
      '<defs>' + group + "</defs>" +
      '<g style="mix-blend-mode:multiply">' +
      '<use href="#shapes-' + id + '" fill="' + secondary + '" opacity="0.68" transform="translate(' +
      round(-offset) + " " + round(offset * 0.7) + ')"/>' +
      '<use href="#shapes-' + id + '" fill="' + primary + '" opacity="0.82"/>' +
      "</g>" +
      '<rect x="' + round(w * 0.08) + '" y="' + round(h * 0.08) +
      '" width="' + round(w * 0.84) + '" height="' + round(h * 0.84) +
      '" fill="none" stroke="#17130f" stroke-opacity="0.2" stroke-width="1.5"/>'
    );
  }

  /** Sculpture: an object on a plinth line, with the shadow it casts. */
  function sculpture(rng, w, h) {
    var ink = pick(rng, INKS.sculpture);
    var floor = h * between(rng, 0.68, 0.78);
    var baseW = between(rng, w * 0.22, w * 0.4);
    var topW = baseW * between(rng, 0.45, 0.95);
    var height = between(rng, h * 0.3, h * 0.56);
    var cx = w * between(rng, 0.4, 0.6);
    var left = cx - baseW / 2;
    var topLeft = cx - topW / 2;
    var top = floor - height;
    var pale = rng() < 0.4;
    var throwLeft = rng() < 0.5;
    var out = "";

    out +=
      '<rect x="0" y="' + round(floor) + '" width="' + w + '" height="' +
      round(h - floor) + '" fill="' + ink + '" opacity="0.1"/>';
    out +=
      '<path d="M0 ' + round(floor) + "H" + w + '" stroke="#17130f" stroke-opacity="0.45" stroke-width="2"/>';

    // Cast shadow, thrown away from an implied window to one side.
    var reach = height * 0.85 * (throwLeft ? -1 : 1);
    out +=
      '<path d="M' + round(left) + " " + round(floor) +
      "L" + round(left + baseW) + " " + round(floor) +
      "L" + round(left + baseW + reach) + " " + round(floor + h * 0.1) +
      "L" + round(left + reach * 0.82) + " " + round(floor + h * 0.1) +
      'Z" fill="#17130f" opacity="0.16"/>';

    // The object: a lit face and a shaded face, cast or carved.
    out +=
      '<path d="M' + round(left) + " " + round(floor) +
      "L" + round(topLeft) + " " + round(top) +
      "L" + round(topLeft + topW) + " " + round(top) +
      "L" + round(left + baseW) + " " + round(floor) +
      'Z" fill="' + (pale ? GROUND : ink) + '" opacity="' + (pale ? "0.95" : "0.78") +
      '" stroke="#17130f" stroke-opacity="' + (pale ? "0.6" : "0") + '" stroke-width="2"/>';
    out +=
      '<path d="M' + round(cx) + " " + round(floor) +
      "L" + round(cx) + " " + round(top) +
      "L" + round(topLeft + topW) + " " + round(top) +
      "L" + round(left + baseW) + " " + round(floor) +
      'Z" fill="#17130f" opacity="' + (pale ? "0.12" : "0.22") + '"/>';

    // A smaller companion, set down beside it.
    var cw = baseW * between(rng, 0.24, 0.42);
    var ch = cw * between(rng, 0.6, 1.4);
    var cxx = throwLeft ? left + baseW + cw * between(rng, 0.8, 2.2) : left - cw * between(rng, 1.4, 2.8);
    out +=
      '<rect x="' + round(cxx) + '" y="' + round(floor - ch) + '" width="' + round(cw) +
      '" height="' + round(ch) + '" fill="' + (pale ? ink : GROUND) + '" opacity="' +
      (pale ? "0.7" : "0.9") + '" stroke="#17130f" stroke-opacity="0.4" stroke-width="1.5"/>';

    // Measuring hatch, as on a technical plate.
    for (var i = 0; i < 6; i += 1) {
      var y = top + ((floor - top) / 6) * i;
      out +=
        '<path d="M' + round(w * 0.06) + " " + round(y) + "h" + round(w * 0.04) +
        '" stroke="#17130f" stroke-opacity="0.3" stroke-width="1.5"/>';
    }

    return out;
  }

  /** Photograph: a tonal wash, a halftone screen, and one bright opening. */
  function photo(rng, w, h, id) {
    var ink = pick(rng, INKS.photo);
    var angle = Math.floor(between(rng, 0, 4)) * 45;
    var cell = between(rng, 12, 18);
    var winW = between(rng, w * 0.28, w * 0.5);
    var winH = between(rng, h * 0.22, h * 0.4);
    var floorAt = between(rng, 0.6, 0.76);
    var wallW = between(rng, 0.3, 0.55);
    var shaft = between(rng, 0.2, 0.62);
    var winX = between(rng, w * 0.12, w - winW - w * 0.12);
    var winY = between(rng, h * 0.18, h - winH - h * 0.24);

    return (
      "<defs>" +
      '<linearGradient id="wash-' + id + '" gradientTransform="rotate(' + angle + ' 0.5 0.5)">' +
      '<stop offset="0" stop-color="' + ink + '" stop-opacity="0.62"/>' +
      '<stop offset="1" stop-color="' + ink + '" stop-opacity="0.06"/>' +
      "</linearGradient>" +
      '<linearGradient id="ramp-' + id + '" gradientTransform="rotate(' + ((angle + 90) % 360) + ' 0.5 0.5)">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="1"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="1"/>' +
      "</linearGradient>" +
      '<mask id="screen-' + id + '"><rect width="' + w + '" height="' + h + '" fill="url(#ramp-' + id + ')"/></mask>' +
      '<pattern id="dots-' + id + '" width="' + round(cell) + '" height="' + round(cell) +
      '" patternUnits="userSpaceOnUse">' +
      '<circle cx="' + round(cell / 2) + '" cy="' + round(cell / 2) + '" r="' + round(cell * 0.26) +
      '" fill="#17130f"/></pattern>' +
      '<radialGradient id="vig-' + id + '">' +
      '<stop offset="0.55" stop-color="#17130f" stop-opacity="0"/>' +
      '<stop offset="1" stop-color="#17130f" stop-opacity="0.24"/>' +
      "</radialGradient>" +
      "</defs>" +
      '<rect width="' + w + '" height="' + h + '" fill="url(#wash-' + id + ')"/>' +
      // Tonal blocks: a floor, a far wall, a shaft of light. The screen then
      // has structure to sit over instead of reading as a flat test pattern.
      '<rect x="0" y="' + round(h * floorAt) + '" width="' + w + '" height="' + round(h * (1 - floorAt)) +
      '" fill="' + ink + '" opacity="0.34"/>' +
      '<rect x="' + round(w * 0.06) + '" y="' + round(h * 0.1) + '" width="' + round(w * wallW) +
      '" height="' + round(h * floorAt - h * 0.1) + '" fill="#17130f" opacity="0.16"/>' +
      '<path d="M' + round(w * shaft) + ' 0L' + round(w * (shaft + 0.22)) + ' 0L' +
      round(w * (shaft + 0.05)) + " " + round(h) + "L" + round(w * (shaft - 0.14)) + " " + round(h) +
      'Z" fill="' + GROUND + '" opacity="0.3"/>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#dots-' + id + ')" opacity="0.34" mask="url(#screen-' + id + ')"/>' +
      '<rect x="' + round(winX) + '" y="' + round(winY) + '" width="' + round(winW) + '" height="' + round(winH) +
      '" fill="' + GROUND + '" opacity="0.92"/>' +
      '<rect x="' + round(winX) + '" y="' + round(winY) + '" width="' + round(winW) + '" height="' + round(winH) +
      '" fill="none" stroke="#17130f" stroke-opacity="0.5" stroke-width="2"/>' +
      '<path d="M' + round(winX + winW / 2) + " " + round(winY) + "v" + round(winH) +
      '" stroke="#17130f" stroke-opacity="0.3" stroke-width="1.5"/>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#vig-' + id + ')"/>'
    );
  }

  var RECIPES = {
    painting: painting,
    print: printPlate,
    sculpture: sculpture,
    photo: photo
  };

  /* --- Public ------------------------------------------------------------- */

  /**
   * Render a work as an SVG string.
   * @param {object} work a record from P1900.works
   * @returns {string} standalone inline SVG markup
   */
  function render(work) {
    var size = FORMATS[work.format] || FORMATS.square;
    var w = size.w;
    var h = size.h;
    var rng = makeRng(work.no * 7919 + work.title.length * 131);
    var recipe = RECIPES[work.medium] || painting;
    uid += 1;
    var id = work.no + "-" + uid;

    return (
      '<svg viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' +
      escapeAttr("Plate " + app.record.plateNo(work.no) + ", " + work.title +
        " — a drawn stand-in for " + work.materials.toLowerCase() + " by " + work.artist) +
      '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="' + w + '" height="' + h + '" fill="' + GROUND + '"/>' +
      recipe(rng, w, h, id) +
      cropMarks(w, h) +
      "</svg>"
    );
  }

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  app.plates = { render: render, escapeAttr: escapeAttr };
})(window.P1900);
