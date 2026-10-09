/* ==========================================================================
   countdown.js — the drop clock. Theatre: the drop "closes" every Friday at
   18:00 local time and the next one starts counting straight away. The
   visible clock ticks each second; the screen-reader status speaks once a
   minute so it never chatters.
   ========================================================================== */

window.P1900 = window.P1900 || {};

(function (app) {
  "use strict";

  var CLOSE_DAY = 5; // Friday
  var CLOSE_HOUR = 18;
  var SECOND = 1000;
  var MINUTE = 60 * SECOND;
  var HOUR = 60 * MINUTE;
  var DAY = 24 * HOUR;

  var nodes = {};
  var target = null;
  var lastSpokenMinute = -1;

  function nextClose(now) {
    var close = new Date(now.getTime());
    close.setHours(CLOSE_HOUR, 0, 0, 0);
    close.setDate(close.getDate() + ((CLOSE_DAY - close.getDay() + 7) % 7));
    if (close <= now) close.setDate(close.getDate() + 7);
    return close;
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function plural(count, word) {
    return count + " " + word + (count === 1 ? "" : "s");
  }

  function tick() {
    var now = new Date();
    if (!target || now >= target) target = nextClose(now);

    var left = target - now;
    var days = Math.floor(left / DAY);
    var hours = Math.floor((left % DAY) / HOUR);
    var mins = Math.floor((left % HOUR) / MINUTE);
    var secs = Math.floor((left % MINUTE) / SECOND);

    nodes.days.textContent = pad(days);
    nodes.hours.textContent = pad(hours);
    nodes.mins.textContent = pad(mins);
    nodes.secs.textContent = pad(secs);

    var minuteMark = Math.floor(left / MINUTE);
    if (minuteMark !== lastSpokenMinute) {
      lastSpokenMinute = minuteMark;
      nodes.text.textContent =
        nodes.label.textContent + " " +
        [plural(days, "day"), plural(hours, "hour"), plural(mins, "minute")].join(", ");
    }
  }

  function init() {
    nodes = {
      label: document.querySelector(".dropbar-label"),
      days: document.getElementById("clockDays"),
      hours: document.getElementById("clockHours"),
      mins: document.getElementById("clockMins"),
      secs: document.getElementById("clockSecs"),
      text: document.getElementById("clockText")
    };
    nodes.label.textContent = "Drop " + pad(app.shopRecord.drop) + " closes in";

    tick();
    window.setInterval(tick, SECOND);
  }

  app.countdown = { init: init };
})(window.P1900);
