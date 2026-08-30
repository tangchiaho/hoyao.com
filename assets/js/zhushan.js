/**
 * 竹山開飯了 — 作品專頁互動
 * 無 JS 時主要內容仍可閱讀；此檔負責竹願輪播、表單狀態、分析事件。
 */
(function () {
  "use strict";

  var cfg = window.ZHUSHAN_CONFIG || {};

  /* —— Analytics hooks（沿用全站 GA4 若存在） —— */
  function track(eventName, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params || {});
    }
  }

  function initScrollDepth() {
    if (!("IntersectionObserver" in window)) return;
    var marks = [25, 50, 75, 90];
    var fired = {};
    var sections = document.querySelectorAll(".zs-section[id]");
    if (!sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          var ratio = Math.round(entry.intersectionRatio * 100);
          marks.forEach(function (m) {
            if (ratio >= m && !fired[id + "-" + m]) {
              fired[id + "-" + m] = true;
              track("scroll_depth", { section: id, depth: m });
            }
          });
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 0.9] }
    );

    sections.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* —— Google Form 按鈕 —— */
  function initWishForm() {
    var btn = document.getElementById("zs-wish-form-btn");
    var note = document.getElementById("zs-wish-form-note");
    if (!btn) return;

    var url = cfg.googleFormUrl;
    if (url) {
      btn.disabled = false;
      btn.classList.remove("is-disabled");
      btn.removeAttribute("aria-disabled");
      if (note) note.hidden = true;
    } else {
      btn.disabled = true;
      btn.classList.add("is-disabled");
      if (note) note.hidden = false;
    }

    btn.addEventListener("click", function () {
      track("wish_form_open", { page: "zhushan" });
      if (cfg.googleFormUrl) {
        window.open(cfg.googleFormUrl, "_blank", "noopener");
      }
    });
  }

  /* —— 圖片與外部連結（由 config 覆寫，HTML 保留無 JS 內容） —— */
  function initMedia() {
    var hero = document.getElementById("zs-hero-img");
    if (hero && cfg.images && cfg.images.hero) {
      hero.src = cfg.images.hero.src;
      hero.alt = cfg.images.hero.alt;
      if (cfg.images.hero.width) hero.width = cfg.images.hero.width;
      if (cfg.images.hero.height) hero.height = cfg.images.hero.height;
    }

    if (cfg.images && cfg.images.process) {
      cfg.images.process.forEach(function (item) {
        var fig = document.querySelector('[data-process-id="' + item.id + '"]');
        if (!fig) return;
        var img = fig.querySelector("img");
        var cap = fig.querySelector("figcaption");
        if (img && item.src) {
          img.src = item.src;
          img.alt = item.alt || item.label || "";
        }
        if (cap && item.label) cap.textContent = item.label;
      });
    }

    var venue = document.getElementById("zs-venue-link");
    var venuePh = document.getElementById("zs-venue-link-placeholder");
    if (venue && cfg.externalLinks && cfg.externalLinks.venueStory) {
      venue.href = cfg.externalLinks.venueStory;
      venue.hidden = false;
      if (venuePh) venuePh.hidden = true;
    }
  }

  function initExternalLinks() {
    document.querySelectorAll("[data-zs-external]").forEach(function (link) {
      link.addEventListener("click", function () {
        track("external_link_click", {
          link_id: link.getAttribute("data-zs-external"),
          url: link.href,
        });
      });
    });
  }

  /* —— 製作影片 —— */
  function initVideo() {
    var wrap = document.getElementById("zs-video");
    if (!wrap || !cfg.video || !cfg.video.url) return;

    var poster = cfg.video.poster || "";
    var title = cfg.video.title || "從材料到作品";

    wrap.innerHTML =
      '<video class="zs-video__player" controls preload="metadata" playsinline' +
      (poster ? ' poster="' + poster + '"' : "") +
      ' width="1280" height="720">' +
      '<source src="' +
      cfg.video.url +
      '" type="video/mp4">' +
      "</video>";

    var video = wrap.querySelector("video");
    if (video) {
      video.addEventListener("play", function () {
        track("process_video_play", { page: "zhushan" });
      });
    }
  }

  /* —— 竹願 Live 輪播 —— */
  function initWishesWall() {
    var wall = document.getElementById("zs-wishes-wall");
    var countEl = document.getElementById("zs-wishes-count");
    if (!wall) return;

    var apiUrl = cfg.wishesApiUrl || cfg.wishesMockUrl;
    if (!apiUrl) return;

    fetch(apiUrl)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var items = (data.approved || []).filter(function (w) {
          return w.message;
        });
        if (countEl && data.totalCount != null) {
          countEl.textContent = String(data.totalCount);
        }
        if (!items.length) {
          wall.innerHTML =
            '<p class="zs-wishes__empty">竹願將在審核後陸續顯示。</p>';
          return;
        }
        renderWishesRotation(wall, items);
      })
      .catch(function () {
        wall.innerHTML =
          '<p class="zs-wishes__empty">竹願載入中，請稍後再試。</p>';
      });
  }

  function renderWishesRotation(container, items) {
    var index = 0;
    var display = document.createElement("div");
    display.className = "zs-wishes__display";
    display.setAttribute("aria-live", "polite");
    display.setAttribute("aria-atomic", "true");
    container.innerHTML = "";
    container.appendChild(display);

    function showNext() {
      var item = items[index % items.length];
      index += 1;
      var block = document.createElement("blockquote");
      block.className = "zs-wishes__quote is-entering";
      block.innerHTML =
        "<p>「" +
        escapeHtml(item.message) +
        "」</p>" +
        (item.relation
          ? '<footer class="zs-wishes__meta">' +
            escapeHtml(item.relation) +
            "</footer>"
          : "");

      display.innerHTML = "";
      display.appendChild(block);
      requestAnimationFrame(function () {
        block.classList.remove("is-entering");
        block.classList.add("is-visible");
      });
    }

    showNext();
    var reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      setInterval(showNext, 8000);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* —— 成果區塊 —— */
  function initOutcomes() {
    var section = document.getElementById("outcomes");
    if (!section || !cfg.outcomes) return;
    if (!cfg.outcomes.visible) return;
    section.hidden = false;
    var map = {
      exhibitionPeriod: cfg.outcomes.exhibitionPeriod,
      participants: cfg.outcomes.participants,
      digitalWishes: cfg.outcomes.digitalWishes,
      onsiteWishes: cfg.outcomes.onsiteWishes,
      pageViews: cfg.outcomes.pageViews,
    };
    Object.keys(map).forEach(function (key) {
      var el = section.querySelector('[data-outcome="' + key + '"]');
      if (el && map[key] != null && map[key] !== "") {
        el.textContent = String(map[key]);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    track("page_view", { page_title: "zhushan", page_location: cfg.canonicalUrl });
    initScrollDepth();
    initMedia();
    initWishForm();
    initExternalLinks();
    initVideo();
    initWishesWall();
    initOutcomes();
  });
})();
