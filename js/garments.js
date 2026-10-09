/* ==========================================================================
   garments.js â€” draws each garment as SVG from its record: cut, print and a
   four-stop palette (shell, rib, trim, print). Every cut shares one 200Ã—240
   box and hangs from the same baseline, so the grid lines up at the hem.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var EDGE = 'stroke="var(--garment-edge)" stroke-width="1.2" stroke-linejoin="round"';

  function part(d, fill) {
    return '<path d="' + d + '" fill="' + fill + '" ' + EDGE + "/>";
  }

  function stroke(d, colour, width) {
    return (
      '<path d="' + d + '" fill="none" stroke="' + colour + '" stroke-width="' + (width || 1.4) +
      '" stroke-linecap="square"/>'
    );
  }

  /* --- The printed mark ---------------------------------------------------- */

  function printMark(anchor, colour) {
    var cx = anchor[0];
    var cy = anchor[1];
    var w = anchor[2];
    var h = w * 0.62;

    return (
      '<g fill="' + colour + '" style="font-family: var(--font)">' +
      '<rect x="' + (cx - w / 2) + '" y="' + (cy - h / 2) + '" width="' + w + '" height="' + h +
      '" fill="none" stroke="' + colour + '" stroke-width="' + (w / 24).toFixed(2) + '"/>' +
      '<text x="' + cx + '" y="' + (cy + h * 0.06) + '" text-anchor="middle" font-size="' +
      (h * 0.44).toFixed(2) + '" font-weight="600">1900</text>' +
      '<text x="' + cx + '" y="' + (cy + h * 0.36) + '" text-anchor="middle" font-size="' +
      (h * 0.22).toFixed(2) + '" letter-spacing="' + (w / 30).toFixed(2) + '">ST</text>' +
      "</g>"
    );
  }

  /* --- Cuts -----------------------------------------------------------------
     Each cut returns its parts and the anchors its prints sit on:
     [centre x, centre y, width]. A cut without an anchor for a print falls
     back to its chest anchor. */

  var LONG_SLEEVE_BODY =
    "M62 46 L84 36 Q100 48 116 36 L138 46 L172 150 L156 156 L144 104 L144 214 L56 214 L56 104 L44 156 L28 150 Z";
  var CREW_COLLAR = "M84 36 Q100 48 116 36 L112 33 Q100 43 88 33 Z";
  var HEM_RIB = "M56 214 H144 V228 H56 Z";
  var CUFF_LEFT = "M28 150 L44 156 L40 170 L24 164 Z";
  var CUFF_RIGHT = "M172 150 L156 156 L160 170 L176 164 Z";

  function longSleeve(p) {
    return (
      part(LONG_SLEEVE_BODY, p.shell) +
      part(CUFF_LEFT, p.rib) +
      part(CUFF_RIGHT, p.rib) +
      part(HEM_RIB, p.rib)
    );
  }

  var cuts = {
    tee: {
      widen: 1.1,
      anchors: { chest: [100, 82, 26], back: [100, 130, 64] },
      draw: function (p) {
        return (
          part(
            "M62 44 L84 34 Q100 46 116 34 L138 44 L176 76 L160 100 L144 88 L144 226 L56 226 L56 88 L40 100 L24 76 Z",
            p.shell
          ) +
          part("M84 34 Q100 46 116 34 L112 31 Q100 41 88 31 Z", p.rib) +
          stroke("M42 97 L27 75 M158 97 L173 75", p.trim, 1.2)
        );
      }
    },

    crewneck: {
      widen: 1.2,
      anchors: { chest: [100, 86, 26], back: [100, 130, 64] },
      draw: function (p) {
        return longSleeve(p) + part(CREW_COLLAR, p.rib);
      }
    },

    "zip-hoodie": {
      widen: 1.2,
      anchors: { chest: [124, 88, 20], back: [100, 128, 62] },
      draw: function (p, print) {
        var hood = part("M80 42 Q72 8 100 6 Q128 8 120 42 Z", p.rib);
        // The back print is shown from behind: a flat hood, no zip, no pocket.
        if (print === "back") {
          return hood + longSleeve(p) + part("M80 42 Q100 54 120 42 L116 38 Q100 48 84 38 Z", p.rib);
        }
        return (
          hood +
          part("M88 40 Q86 18 100 16 Q114 18 112 40 Z", p.trim) +
          longSleeve(p) +
          stroke("M64 180 L80 154 H96 M136 180 L120 154 H104", p.trim, 1.4) +
          stroke("M100 40 V214", p.trim, 2.6) +
          '<rect x="97" y="58" width="6" height="11" fill="' + p.print + '"/>'
        );
      }
    },

    jacket: {
      widen: 1.1,
      anchors: { chest: [126, 92, 20], back: [100, 132, 64] },
      draw: function (p) {
        return (
          part(
            "M58 50 L82 36 L118 36 L142 50 L178 158 L160 164 L146 108 L146 222 L54 222 L54 108 L40 164 L22 158 Z",
            p.shell
          ) +
          part("M82 36 L86 20 L114 20 L118 36 L100 46 Z", p.trim) +
          part("M95 44 H105 V222 H95 Z", p.trim) +
          part("M22 158 L40 164 L37 175 L19 169 Z", p.trim) +
          part("M178 158 L160 164 L163 175 L181 169 Z", p.trim) +
          stroke("M54 214 H146", p.rib, 1.6) +
          stroke("M64 132 H86 M114 132 H136", p.rib, 1.4) +
          '<circle cx="58" cy="214" r="2.6" fill="' + p.print + '"/>' +
          '<circle cx="142" cy="214" r="2.6" fill="' + p.print + '"/>'
        );
      }
    },

    sweatpant: {
      anchors: { thigh: [76, 82, 18], chest: [76, 82, 18] },
      draw: function (p) {
        return (
          part("M58 38 H142 L150 206 L110 206 L100 88 L90 206 L50 206 Z", p.shell) +
          part("M58 24 H142 V38 H58 Z", p.rib) +
          part("M50 206 H90 L89 226 H52 Z", p.rib) +
          part("M110 206 H150 L148 226 H111 Z", p.rib) +
          stroke("M96 38 L93 60 M104 38 L107 60", p.trim, 1.6) +
          stroke("M60 52 Q66 70 64 92 M140 52 Q134 70 136 92", p.trim, 1.1)
        );
      }
    },

    cargo: {
      anchors: { thigh: [74, 76, 16], chest: [74, 76, 16] },
      draw: function (p) {
        return (
          part("M58 36 H142 L148 226 L108 226 L100 92 L92 226 L52 226 Z", p.shell) +
          part("M58 22 H142 V36 H58 Z", p.trim) +
          part("M54 120 H82 V164 H56 Z", p.rib) +
          part("M118 120 H146 L144 164 H118 Z", p.rib) +
          stroke("M54 130 H82 M118 130 H146", p.trim, 1.2) +
          stroke("M70 22 V36 M100 22 V36 M130 22 V36", p.shell, 2)
        );
      }
    },

    shorts: {
      anchors: { thigh: [76, 156, 16], chest: [76, 156, 16] },
      draw: function (p) {
        return (
          part("M58 130 H142 L152 224 L108 226 L100 168 L92 226 L48 224 Z", p.shell) +
          part("M58 116 H142 V130 H58 Z", p.rib) +
          stroke("M96 130 L93 150 M104 130 L107 150", p.trim, 1.6)
        );
      }
    },

    cap: {
      anchors: { chest: [100, 190, 22] },
      draw: function (p) {
        return (
          part("M58 212 Q58 158 100 156 Q142 158 142 212 Z", p.shell) +
          stroke("M100 157 V212 M78 163 Q71 186 73 212 M122 163 Q129 186 127 212", p.trim, 1) +
          '<circle cx="100" cy="157" r="3.2" fill="' + p.trim + '"/>' +
          part("M58 212 Q100 204 142 212 L178 221 Q150 232 100 228 Q70 226 58 220 Z", p.rib)
        );
      }
    },

    beanie: {
      anchors: { chest: [100, 210, 22] },
      draw: function (p) {
        var ribs = "";
        for (var x = 68; x <= 132; x += 8) {
          ribs += "M" + x + " 150 V192 ";
        }
        return (
          part("M60 196 Q60 132 100 130 Q140 132 140 196 Z", p.shell) +
          '<g opacity="0.45">' + stroke(ribs, p.trim, 1) + "</g>" +
          part("M56 190 H144 V228 H56 Z", p.rib)
        );
      }
    }
  };

  /* --- Public ---------------------------------------------------------------- */

  /** SVG markup for a garment. Decorative: the name always sits beside it. */
  function draw(product) {
    var cut = cuts[product.cut] || cuts.tee;
    var base = cut.anchors[product.print] || cut.anchors.chest;
    var widen = cut.widen || 1;
    // Widening stretches the cloth about the centre line, but not the print.
    var anchor = [100 + (base[0] - 100) * widen, base[1], base[2]];
    var p = product.palette;

    return (
      '<svg viewBox="0 0 200 240" aria-hidden="true" focusable="false">' +
      '<ellipse cx="100" cy="231" rx="' + 62 * widen + '" ry="4" fill="var(--garment-shadow)"/>' +
      '<g transform="translate(100 0) scale(' + widen + ' 1) translate(-100 0)">' +
      cut.draw(p, product.print) +
      "</g>" +
      printMark(anchor, p.print) +
      "</svg>"
    );
  }

  /** The house mark for the rail. Inherits the ink colour, so it follows the theme. */
  function emblem() {
    return (
      '<svg viewBox="0 0 216 76" aria-hidden="true" focusable="false" fill="currentColor"' +
      ' style="font-family: var(--font)">' +
      '<rect x="1.5" y="1.5" width="213" height="73" fill="none" stroke="currentColor" stroke-width="3"/>' +
      '<text x="14" y="28" font-size="15" letter-spacing="4">PROJECT</text>' +
      '<text x="14" y="62" font-size="31" font-weight="600" letter-spacing="2">1900 ST</text>' +
      "</svg>"
    );
  }

  app.garments = { draw: draw, emblem: emblem };
})(window.P1900);
