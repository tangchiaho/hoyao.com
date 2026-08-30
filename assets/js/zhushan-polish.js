/** 竹山開飯了 V4.3 — light polish + private outcomes preview */
(function () {
  "use strict";

  function boot() {
    removeDuplicateProductionCredit();
    softenProjectSignature();
    injectBambooField();
    hideUnreadyWishAction();
    initPreview();
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
      [8,62,14],[19,86,17],[31,72,15],[44,94,19],[57,78,16],
      [69,88,21],[80,68,14],[90,82,18]
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
    var isPreview = new URLSearchParams(window.location.search).get("preview") === "1";
    if (cfg.googleFormUrl || isPreview) return;
    var btn = document.getElementById("zs-keep-wish-btn");
    if (!btn) return;
    var action = btn.closest(".zs-thought-action");
    if (action) action.hidden = true;
  }

  function initPreview() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("preview") !== "1") return;
    document.documentElement.classList.add("zs-preview-mode");
    enablePreviewWish();
    fetch("/assets/data/zhushan-preview.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("preview"); return r.json(); })
      .then(renderPreview)
      .catch(function () {});
  }

  function enablePreviewWish() {
    var btn = document.getElementById("zs-keep-wish-btn");
    var input = document.getElementById("zs-thought-input");
    var soon = document.getElementById("zs-wish-soon");
    if (!btn || !input) return;
    var action = btn.closest(".zs-thought-action");
    if (action) action.hidden = false;
    btn.disabled = false;
    if (soon) soon.hidden = true;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var msg = input.value.trim();
      if (!msg) { input.focus(); return; }
      var old = action.querySelector(".zs-preview-wish-status");
      if (old) old.remove();
      var p = document.createElement("p");
      p.className = "zs-preview-wish-status";
      p.textContent = "已加入本次視覺預覽；不會保存為正式資料。";
      action.appendChild(p);
      var n = document.querySelector('[data-preview-metric="wishes"]');
      if (n) n.textContent = String((parseInt(n.textContent, 10) || 0) + 1);
    });
  }

  function renderPreview(data) {
    var section = document.getElementById("outcomes");
    if (!section || !data) return;
    section.hidden = false;
    section.classList.add("zs-reveal", "is-in");
    section.innerHTML =
      '<p class="zs-section__label">Participation</p>' +
      '<h2 class="zs-section__title">作品留下的不只是觀看</h2>' +
      '<p class="zs-preview-note">視覺預覽資料・僅用來確認正式成果頁的呈現方式</p>' +
      '<p class="zs-impact-lead">一件作品如何讓人停下來、留下話、重新看見竹材，也重新認識一個地方。展覽結束後，這些參與會被整理成可追溯的作品紀錄。</p>' +
      renderMetrics(data.summary || {}) +
      renderRegions(data.regions || []) +
      renderInsights(data.insights || []) +
      renderInterests(data.interests || []) +
      renderVoices(data.voices || []) +
      renderShares(data.shares || []);
    countUpMetrics(section);
  }

  function renderMetrics(s) {
    var items = [
      [s.participants || 0, "人次", "參與作品／現場互動", "participants"],
      [s.wishes || 0, "則", "留下竹願", "wishes"],
      [s.regions || 0, "個", "參與者來源地區", "regions"],
      [s.validSurveys || 0, "份", "有效參與觀察", "surveys"]
    ];
    return '<div class="zs-impact-grid">' + items.map(function (it) {
      return '<div class="zs-impact-metric"><div><span class="zs-impact-number" data-target="' + it[0] + '" data-preview-metric="' + it[3] + '">0</span><span class="zs-impact-unit">' + it[1] + '</span></div><div class="zs-impact-label">' + it[2] + '</div></div>';
    }).join("") + '</div>';
  }

  function renderRegions(items) {
    if (!items.length) return "";
    return '<div class="zs-impact-block"><p class="zs-impact-kicker">Where people came from</p><div class="zs-region-cloud">' +
      items.map(function (x) { return '<span class="zs-region-item">' + esc(x.name) + '<small>' + Number(x.count || 0) + '</small></span>'; }).join("") +
      '</div></div>';
  }

  function renderInsights(items) {
    if (!items.length) return "";
    return '<div class="zs-impact-block"><p class="zs-impact-kicker">Participation observations</p><div class="zs-insight-grid">' +
      items.map(function (x) { return '<div class="zs-insight"><strong>' + esc(x.value) + '</strong><span>' + esc(x.label) + '</span></div>'; }).join("") +
      '</div></div>';
  }

  function renderInterests(items) {
    if (!items.length) return "";
    return '<div class="zs-impact-block"><p class="zs-impact-kicker">People want to see bamboo used in</p><div class="zs-interest-list">' +
      items.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join("") +
      '</div></div>';
  }

  function renderVoices(items) {
    if (!items.length) return "";
    return '<div class="zs-impact-block"><p class="zs-impact-kicker">Voices</p><div class="zs-voice-list">' +
      items.map(function (x) { return '<blockquote class="zs-voice"><p>「' + esc(x.message) + '」</p><footer>' + esc(x.meta || '') + '</footer></blockquote>'; }).join("") +
      '</div></div>';
  }

  function renderShares(items) {
    if (!items.length) return "";
    return '<div class="zs-impact-block"><p class="zs-impact-kicker">Community moments</p><div class="zs-voice-list">' +
      items.map(function (x) { return '<blockquote class="zs-voice"><p>「' + esc(x.text) + '」</p><footer>' + esc(x.meta || '') + '</footer></blockquote>'; }).join("") +
      '</div></div>';
  }

  function countUpMetrics(root) {
    var els = root.querySelectorAll(".zs-impact-number[data-target]");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    els.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-target"), 10) || 0;
      if (reduce) { el.textContent = String(target); return; }
      var start = performance.now();
      var dur = 850;
      function tick(now) {
        var p = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
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
