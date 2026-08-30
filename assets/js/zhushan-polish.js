/** 竹山開飯了 V4.4 — production participation visuals */
(function () {
  "use strict";

  function boot() {
    removeDuplicateProductionCredit();
    softenProjectSignature();
    injectBambooField();
    hideUnreadyWishAction();
    moveOutcomesBeforeCredits();
    loadProductionOutcomes();
  }

  function removeDuplicateProductionCredit() {
    var terms = document.querySelectorAll(".zs-credits dt");
    for (var i = 0; i < terms.length; i++) {
      if ((terms[i].textContent || "").trim() === "企劃製作") {
        var dd = terms[i].nextElementSibling;
        terms[i].remove();
        if (dd && dd.tagName === "DD") dd.remove();
        break;
      }
    }
  }

  function softenProjectSignature() {
    var sig = document.getElementById("signature");
    if (!sig) return;
    var label = sig.querySelector(".zs-sig__label");
    if (label) label.textContent = "企劃製作";
  }

  function injectBambooField() {
    var hero = document.querySelector(".zs-hero");
    if (!hero || hero.querySelector(".zs-bamboo-field")) return;
    var field = document.createElement("div");
    field.className = "zs-bamboo-field";
    field.setAttribute("aria-hidden", "true");
    var stems = [
      [8,62,16],[19,86,19],[31,72,17],[44,94,21],
      [57,78,18],[69,88,22],[80,68,16],[90,82,20]
    ];
    stems.forEach(function (s) {
      var span = document.createElement("span");
      span.style.setProperty("--x", s[0] + "%");
      span.style.setProperty("--h", s[1] + "%");
      span.style.setProperty("--d", s[2] + "s");
      field.appendChild(span);
    });
    hero.appendChild(field);
  }

  function hideUnreadyWishAction() {
    var cfg = window.ZHUSHAN_CONFIG || {};
    if (cfg.googleFormUrl) return;
    var btn = document.getElementById("zs-keep-wish-btn");
    if (!btn) return;
    var action = btn.closest(".zs-thought-action");
    if (action) action.hidden = true;
  }

  function moveOutcomesBeforeCredits() {
    var section = document.getElementById("outcomes");
    var credits = document.getElementById("credits");
    if (!section || !credits || !credits.parentNode) return;
    var rule = document.createElement("hr");
    rule.className = "zs-rule zs-outcomes-rule is-in";
    credits.parentNode.insertBefore(rule, credits);
    credits.parentNode.insertBefore(section, credits);
  }

  function loadProductionOutcomes() {
    fetch("/assets/data/zhushan-outcomes.json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("outcomes");
        return r.json();
      })
      .then(renderOutcomes)
      .catch(function () {});
  }

  function renderOutcomes(data) {
    var section = document.getElementById("outcomes");
    if (!section || !data) return;
    section.hidden = false;
    section.classList.add("zs-reveal", "is-in");

    var html = '' +
      '<p class="zs-section__label">Participation</p>' +
      '<h2 class="zs-section__title">參與觀察</h2>' +
      '<p class="zs-impact-lead">作品不只被觀看，也透過竹語、竹願與歸土，留下人與材料、場域及竹山之間的關係。這些參與會持續整理，形成可追溯的作品紀錄。</p>' +
      '<p class="zs-data-status">展覽期間持續整理更新</p>';

    html += renderMetrics(data.summary || {});
    html += renderWishThemes(data.wishThemes || [], data.wishThemesNote || "");
    html += renderRegions(data.regions || []);
    html += renderRates(data.rates || []);
    html += renderInteractions(data.interactions || []);
    html += renderApplications(data.applications || []);
    html += renderVoices(data.voices || []);
    html += renderPublicDimensions(data.publicDimensions || []);

    section.innerHTML = html;
  }

  function renderMetrics(s) {
    var rows = [];
    if (isNum(s.participants)) rows.push([s.participants, "人次", "參與作品／現場互動"]);
    if (isNum(s.wishes)) rows.push([s.wishes, "則", "正式收錄竹願"]);
    if (isNum(s.regions)) rows.push([s.regions, "個", "參與者來源地區"]);
    if (isNum(s.validSurveys)) rows.push([s.validSurveys, "份", "有效參與觀察"]);
    if (!rows.length) return "";
    return '<div class="zs-impact-grid">' + rows.map(function (it) {
      return '<div class="zs-impact-metric"><div><span class="zs-impact-number">' + Number(it[0]) + '</span><span class="zs-impact-unit">' + it[1] + '</span></div><div class="zs-impact-label">' + it[2] + '</div></div>';
    }).join("") + '</div>';
  }

  function renderWishThemes(items, note) {
    if (!items.length) return "";
    var max = Math.max.apply(null, items.map(function (x) { return Number(x.count || 0); }).concat([1]));
    return '<div class="zs-impact-block">' +
      '<p class="zs-impact-kicker">目前公開竹願・主題觀察</p>' +
      '<div class="zs-dot-chart">' + items.map(function (x) {
        var count = Math.max(0, Number(x.count || 0));
        var dots = '';
        for (var i = 0; i < max; i++) {
          dots += '<span class="zs-dot ' + (i < count ? 'is-on' : '') + '"></span>';
        }
        return '<div class="zs-dot-row"><div class="zs-dot-label">' + esc(x.name) + '</div><div class="zs-dots" aria-label="' + esc(x.name) + ' ' + count + '">' + dots + '</div><div class="zs-dot-count">' + count + '</div></div>';
      }).join("") + '</div>' +
      (note ? '<p class="zs-data-note">' + esc(note) + '</p>' : '') +
      '</div>';
  }

  function renderRegions(items) {
    if (!items.length) return "";
    var max = Math.max.apply(null, items.map(function (x) { return Number(x.count || 0); }).concat([1]));
    return '<div class="zs-impact-block"><p class="zs-impact-kicker">參與從哪裡來</p><div class="zs-region-bars">' +
      items.map(function (x) {
        var c = Number(x.count || 0);
        var pct = Math.max(3, Math.round((c / max) * 100));
        return '<div class="zs-bar-row"><div class="zs-bar-row__label">' + esc(x.name) + '</div><div class="zs-bar-row__track"><span style="width:' + pct + '%"></span></div><div class="zs-bar-row__value">' + c + '</div></div>';
      }).join("") + '</div></div>';
  }

  function renderRates(items) {
    if (!items.length) return "";
    return '<div class="zs-impact-block"><p class="zs-impact-kicker">參與之後，有什麼改變</p><div class="zs-rate-grid">' +
      items.map(function (x) {
        var value = Math.max(0, Math.min(100, Number(x.value || 0)));
        var dots = '';
        for (var i = 0; i < 100; i++) dots += '<span class="zs-mini-dot ' + (i < value ? 'is-on' : '') + '"></span>';
        return '<article class="zs-rate"><div class="zs-rate__value">' + value + '%</div><div class="zs-rate__label">' + esc(x.label || '') + '</div><div class="zs-mini-matrix" aria-hidden="true">' + dots + '</div></article>';
      }).join("") + '</div></div>';
  }

  function renderInteractions(items) {
    if (!items.length) return "";
    var total = items.reduce(function (sum, x) { return sum + Number(x.count || 0); }, 0) || 1;
    return '<div class="zs-impact-block"><p class="zs-impact-kicker">最有感的互動</p><div class="zs-rank-bars">' +
      items.map(function (x) {
        var c = Number(x.count || 0);
        var pct = Math.round((c / total) * 100);
        return '<div class="zs-rank"><div class="zs-rank__head"><span>' + esc(x.name) + '</span><span>' + pct + '%</span></div><div class="zs-rank__track"><span style="width:' + pct + '%"></span></div></div>';
      }).join("") + '</div></div>';
  }

  function renderApplications(items) {
    if (!items.length) return "";
    return '<div class="zs-impact-block"><p class="zs-impact-kicker">希望竹材出現在哪裡</p><div class="zs-interest-list">' +
      items.map(function (x) { return '<span>' + esc(typeof x === "string" ? x : x.name) + '</span>'; }).join("") +
      '</div></div>';
  }

  function renderVoices(items) {
    if (!items.length) return "";
    return '<div class="zs-impact-block"><p class="zs-impact-kicker">留下來的話</p><div class="zs-voice-list">' +
      items.map(function (x) { return '<blockquote class="zs-voice"><p>「' + esc(x.message) + '」</p>' + (x.meta ? '<footer>' + esc(x.meta) + '</footer>' : '') + '</blockquote>'; }).join("") +
      '</div></div>';
  }

  function renderPublicDimensions(items) {
    if (!items.length) return "";
    return '<div class="zs-impact-block zs-method-block"><p class="zs-impact-kicker">這次作品持續記錄的面向</p>' +
      '<div class="zs-data-table">' + items.map(function (x) {
        return '<div class="zs-data-row"><div class="zs-data-row__key">' + esc(x.label) + '</div><div class="zs-data-row__value">' + esc(x.description) + '</div></div>';
      }).join("") + '</div></div>';
  }

  function isNum(v) {
    return typeof v === "number" && isFinite(v);
  }

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
