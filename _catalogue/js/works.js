/* ==========================================================================
   works.js — the catalogue record. Single source of truth for every plate.
   Everything downstream (grid, dialog, shortlist, enquiry) reads from here.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var MEDIUM_LABELS = {
    painting: "Painting",
    print: "Print",
    sculpture: "Sculpture",
    photo: "Photography"
  };

  var works = [
    {
      no: 1,
      title: "Study in Black",
      artist: "Margit Sand",
      medium: "painting",
      materials: "Oil on canvas",
      year: 2026,
      dimensions: "1400 × 1100 mm",
      edition: "Unique",
      price: 4200,
      state: "available",
      format: "portrait",
      note:
        "Begun as a portrait and abandoned twice. What survives is the ground: eleven layers of black that never quite agree on which black they are.",
      provenance: "Direct from the artist's studio, Aarhus."
    },
    {
      no: 2,
      title: "Signal Proof",
      artist: "Rui Kestrel",
      medium: "print",
      materials: "Screenprint on Somerset satin",
      year: 2025,
      dimensions: "700 × 500 mm",
      edition: "Edition of 30, plus 5 AP",
      price: 650,
      state: "available",
      format: "square",
      note:
        "Pulled fast, deliberately out of register. The misalignment is the subject; a clean pull was printed once and destroyed.",
      provenance: "Published by the studio press, 2025."
    },
    {
      no: 3,
      title: "Floor Relic",
      artist: "H. Anselm",
      medium: "sculpture",
      materials: "Cast plaster and dry pigment",
      year: 2024,
      dimensions: "420 × 310 × 290 mm",
      edition: "Unique",
      price: null,
      state: "available",
      format: "square",
      note:
        "Cast from a hollow in a workshop floor. It is shown on the ground, unlit, and should be walked around before it is looked at.",
      provenance: "Exhibited: Kunsthalle annexe, Basel, 2024."
    },
    {
      no: 4,
      title: "Night Window",
      artist: "Iva Reyes",
      medium: "photo",
      materials: "Archival pigment print",
      year: 2025,
      dimensions: "900 × 600 mm",
      edition: "Edition of 7",
      price: 1100,
      state: "reserved",
      format: "wide",
      note:
        "A twelve-minute exposure of a room the artist did not enter. The only movement recorded is the light itself, and it moves slowly.",
      provenance: "Reserved for a private collection, pending condition report."
    },
    {
      no: 5,
      title: "Red Room Field",
      artist: "Margit Sand",
      medium: "painting",
      materials: "Acrylic and charcoal on canvas",
      year: 2026,
      dimensions: "1600 × 1200 mm",
      edition: "Unique",
      price: 3800,
      state: "available",
      format: "portrait",
      note:
        "The charcoal was laid last and left unfixed. It will continue to move for a year or so, which the artist considers finished behaviour.",
      provenance: "Direct from the artist's studio, Aarhus."
    },
    {
      no: 6,
      title: "Small Poster Set",
      artist: "Rui Kestrel",
      medium: "print",
      materials: "Risograph, set of four",
      year: 2025,
      dimensions: "420 × 594 mm each",
      edition: "Open edition",
      price: 220,
      state: "available",
      format: "portrait",
      note:
        "Made to be pinned, not framed. Sold as a set of four; the fourth sheet is the same as the first, printed on the wrong paper.",
      provenance: "Published by the studio press, 2025."
    },
    {
      no: 7,
      title: "City Negative",
      artist: "Iva Reyes",
      medium: "photo",
      materials: "Gelatin silver print",
      year: 2023,
      dimensions: "500 × 400 mm",
      edition: "Edition of 15",
      price: 900,
      state: "available",
      format: "square",
      note:
        "Printed from a negative that was scratched in transit. The scratch runs through the eighth floor of the building and stays there.",
      provenance: "Printed by the artist, 2023."
    },
    {
      no: 8,
      title: "Steel Marker",
      artist: "H. Anselm",
      medium: "sculpture",
      materials: "Steel, wax and graphite",
      year: 2024,
      dimensions: "1900 × 300 × 300 mm",
      edition: "Unique",
      price: null,
      state: "sold",
      format: "portrait",
      note:
        "A standing measure, waxed by hand every month for a year. The wax is now part of the work and should not be removed.",
      provenance: "Private collection, Zürich."
    },
    {
      no: 9,
      title: "Underpaint Map",
      artist: "Margit Sand",
      medium: "painting",
      materials: "Mixed media on linen",
      year: 2026,
      dimensions: "2100 × 1500 mm",
      edition: "Unique",
      price: 5400,
      state: "available",
      format: "wide",
      note:
        "The largest work in the issue and the only one that had to be rolled to leave the studio. The crease along the lower third is original.",
      provenance: "Direct from the artist's studio, Aarhus."
    },
    {
      no: 10,
      title: "Blue Edition",
      artist: "Rui Kestrel",
      medium: "print",
      materials: "Monotype on cotton rag",
      year: 2025,
      dimensions: "560 × 760 mm",
      edition: "Unique impression",
      price: 780,
      state: "available",
      format: "square",
      note:
        "Called an edition as a joke — a monotype cannot be one. Only this impression exists, and the plate was wiped immediately after.",
      provenance: "Published by the studio press, 2025."
    },
    {
      no: 11,
      title: "Empty Stage",
      artist: "Iva Reyes",
      medium: "photo",
      materials: "C-print, face-mounted",
      year: 2024,
      dimensions: "1200 × 900 mm",
      edition: "Edition of 12",
      price: 1350,
      state: "available",
      format: "wide",
      note:
        "Photographed at the hour between the get-out and the cleaners. Nothing is happening, which took a long time to arrange.",
      provenance: "Printed by the artist, 2024."
    },
    {
      no: 12,
      title: "Table Object",
      artist: "H. Anselm",
      medium: "sculpture",
      materials: "Ceramic with oxide glaze",
      year: 2026,
      dimensions: "380 × 220 × 220 mm",
      edition: "Unique",
      price: 2100,
      state: "available",
      format: "portrait",
      note:
        "Fired three times. The glaze crawled on the third firing and the artist stopped there, which is the only reason it is in this issue.",
      provenance: "Direct from the artist's studio, Basel."
    }
  ];

  /** "012" — plate numbers are always three figures in this catalogue. */
  function plateNo(no) {
    return String(no).padStart(3, "0");
  }

  /** Prices are indicative; works without one read "On request". */
  function priceLabel(work) {
    if (work.state === "sold") {
      return "Sold";
    }
    if (typeof work.price !== "number") {
      return "On request";
    }
    return "$" + work.price.toLocaleString("en-US");
  }

  function stateLabel(work) {
    if (work.state === "sold") return "Sold";
    if (work.state === "reserved") return "Reserved";
    return "Available";
  }

  function mediumLabel(medium) {
    return MEDIUM_LABELS[medium] || medium;
  }

  function byNo(no) {
    var target = Number(no);
    for (var i = 0; i < works.length; i += 1) {
      if (works[i].no === target) return works[i];
    }
    return null;
  }

  function countByMedium(medium) {
    if (medium === "all") return works.length;
    return works.filter(function (work) {
      return work.medium === medium;
    }).length;
  }

  app.works = works;
  app.record = {
    plateNo: plateNo,
    priceLabel: priceLabel,
    stateLabel: stateLabel,
    mediumLabel: mediumLabel,
    byNo: byNo,
    countByMedium: countByMedium
  };
})(window.P1900);
