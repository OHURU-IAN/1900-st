/* ==========================================================================
   dom.js — the one element helper the views share. Text always goes in as
   textContent, never as markup.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  /**
   * @param {string} tag
   * @param {string} [className]
   * @param {string} [text]
   * @returns {HTMLElement}
   */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    if (tag === "button") node.type = "button";
    return node;
  }

  app.dom = { el: el };
})(window.P1900);
