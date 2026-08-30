/**
 * 竹山開飯了 V3 — 動態互動作品檔案
 */
(function () {
  "use strict";

  var cfg = window.ZHUSHAN_CONFIG || {};
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var animOn = cfg.animations && cfg.animations.enabled !== false && !reduceMotion;

  function track(eventName, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params || {});
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isRealSrc(src) {
    if (!src) return false;
    return src.indexOf("placeholder-") === -1;
  }

  function showSection(id, show) {
    var el = document.getElementById(id);
    var rule = document.getElementById(id + "-rule");
    if (el) el.hidden = !show;
    if (rule) rule.hidden = !show;
  }

  function initRevealAnimations() {
    if (!animOn || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".zs-reveal, .zs-reveal-child, .zs-hero-anim").forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }

    document.querySelectorAll(".zs-reveal, .zs-reveal-child").forEach(function (el) {
      el.classList.add("is-pending");
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.classList.add("is-in");
          el.classList.remove("is-pending");
          var children = el.querySelectorAll(".zs-reveal-child.is-pending");
          children.forEach(function (child, i) {
            window.setTimeout(function () {
              child.classList.add("is-in");
              child.classList.remove("is-pending");
            }, 80 * i);
          });
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    document.querySelectorAll(".zs-reveal").forEach(function (el) {
      io.observe(el);
    });
  }

  function initHeroMotion() {
    var nodes = document.querySelectorAll(".zs-hero-anim");
    if (!animOn) {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
    } else {
      nodes.forEach(function (el) {
        el.classList.add("is-pending");
        var delay = parseInt(el.getAttribute("data-hero-delay") || "0", 10);
        window.setTimeout(function () {
          el.classList.add("is-in");
          el.classList.remove("is-pending");
        }, delay);
      });
    }

    var hero = document.getElementById("zs-hero-img");
    if (hero && cfg.images && cfg.images.hero) {
      var h = cfg.images.hero;
      if (h.src) {
        hero.src = h.src;
        hero.alt = h.alt || "";
        if (h.width) hero.width = h.width;
        if (h.height) hero.height = h.height;
      }
      var cap = document.getElementById("zs-hero-caption");
      if (cap && h.caption) {
        cap.hidden = false;
        cap.textContent = h.caption;
      }
    }

    if (!animOn) return;
    var figure = document.getElementById("zs-hero-figure");
    if (!figure || !hero) return;

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var rect = figure.getBoundingClientRect();
        var viewH = window.innerHeight || 1;
        var p = (rect.top / viewH) * -16;
        p = Math.max(-16, Math.min(16, p));
        hero.style.transform = "translateY(" + p + "px)";
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initWishForm() {
    var section = document.getElementById("wish-form");
    var btn = document.getElementById("zs-wish-form-btn");
    if (!section || !btn) return;

    var url = cfg.googleFormUrl;
    if (!url) {
      showSection("wish-form", false);
      return;
    }

    showSection("wish-form", true);
    btn.addEventListener("click", function () {
      track("wish_form_open", { page: "zhushan" });
      window.open(url, "_blank", "noopener");
    });
  }

  function wishesSourceUrl() {
    if (cfg.useMockWishes === true && cfg.wishesMockUrl) {
      return cfg.wishesMockUrl;
    }
    if (cfg.dataMode === "static") {
      return cfg.staticWishesUrl || "/assets/data/zhushan-wishes.json";
    }
    return cfg.wishesApiUrl || "";
  }

  function initWishesWall() {
    var section = document.getElementById("wishes-live");
    var wall = document.getElementById("zs-wishes-wall");
    if (!section || !wall) return;

    var url = wishesSourceUrl();
    if (!url) {
      showSection("wishes-live", false);
      return;
    }

    wall.innerHTML = '<div class="zs-wishes__skeleton" aria-hidden="true"></div>';

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("wishes");
        return r.json();
      })
      .then(function (data) {
        var items = (data.approved || []).filter(function (w) {
          return w.message;
        });
        if (!items.length && !data.totalCount) {
          showSection("wishes-live", false);
          return;
        }
        showSection("wishes-live", true);
        var countEl = document.getElementById("zs-wishes-count");
        if (countEl) {
          countEl.textContent = String(data.totalCount != null ? data.totalCount : items.length);
        }
        if (!items.length) {
          wall.innerHTML = '<p class="zs-wishes__empty">竹願正在整理中。</p>';
          return;
        }
        renderWishesRotation(wall, items);
        initWishStats(data.stats || {}, data.totalCount != null ? data.totalCount : items.length);
      })
      .catch(function () {
        showSection("wishes-live", true);
        wall.innerHTML = '<p class="zs-wishes__empty">竹願正在整理中。</p>';
      });
  }

  function renderWishesRotation(container, items) {
    var index = 0;
    var paused = false;
    var timer = null;
    container.innerHTML = "";

    function paint(item) {
      var block = document.createElement("blockquote");
      block.className = "zs-wishes__quote";
      var meta = [];
      if (item.relation) meta.push(escapeHtml(item.relation));
      if (item.ageRange || item.age_range) {
        meta.push(escapeHtml(item.ageRange || item.age_range));
      }
      block.innerHTML =
        "<p>「" +
        escapeHtml(item.message) +
        "」</p>" +
        (meta.length
          ? '<footer class="zs-wishes__meta">' + meta.join("・") + "</footer>"
          : "");
      container.innerHTML = "";
      container.appendChild(block);
      requestAnimationFrame(function () {
        block.classList.add("is-visible");
      });
    }

    function showNext() {
      if (paused) return;
      paint(items[index % items.length]);
      index += 1;
    }

    paint(items[0]);
    index = 1;

    if (animOn && items.length > 1) {
      timer = window.setInterval(showNext, 8000);
      container.addEventListener("mouseenter", function () {
        paused = true;
      });
      container.addEventListener("mouseleave", function () {
        paused = false;
      });
      container.addEventListener("touchstart", function () {
        paused = true;
      }, { passive: true });
    }

    return timer;
  }

  function initWishStats(stats, total) {
    var wrap = document.getElementById("zs-wish-stats");
    if (!wrap || !stats) return;

    var parts = [];
    if (total) {
      parts.push(
        '<div class="zs-stats__item"><div class="zs-stats__value">' +
          total +
          '</div><div class="zs-stats__label">個竹願</div></div>'
      );
    }
    if (stats.firstVisitCount != null && total) {
      var pct = Math.round((stats.firstVisitCount / total) * 100);
      parts.push(
        '<div class="zs-stats__item"><div class="zs-stats__value">' +
          pct +
          '%</div><div class="zs-stats__label">第一次來到這個場域</div></div>'
      );
    }
    if (stats.localCount != null && total) {
      var loc = Math.round((stats.localCount / total) * 100);
      parts.push(
        '<div class="zs-stats__item"><div class="zs-stats__value">' +
          loc +
          '%</div><div class="zs-stats__label">來自竹山／南投</div></div>'
      );
    }
    if (stats.favorite) {
      var topFav = topKey(stats.favorite);
      if (topFav) {
        parts.push(
          '<div class="zs-stats__item"><div class="zs-stats__value">' +
            escapeHtml(topFav) +
            '</div><div class="zs-stats__label">最有感互動</div></div>'
        );
      }
    }

    var html = "";
    if (parts.length) {
      html += '<div class="zs-stats__grid">' + parts.join("") + "</div>";
    }
    if (stats.futureTheme) {
      html += renderBars("大家希望未來的竹山多一點什麼", stats.futureTheme);
    }

    if (!html) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    wrap.innerHTML = html;
    requestAnimationFrame(function () {
      wrap.querySelectorAll(".zs-bar__fill").forEach(function (el) {
        el.style.width = el.getAttribute("data-w") + "%";
      });
    });
  }

  function topKey(obj) {
    var best = "";
    var n = -1;
    Object.keys(obj).forEach(function (k) {
      if (obj[k] > n) {
        n = obj[k];
        best = k;
      }
    });
    return best;
  }

  function renderBars(title, obj) {
    var keys = Object.keys(obj);
    if (!keys.length) return "";
    var max = 0;
    keys.forEach(function (k) {
      if (obj[k] > max) max = obj[k];
    });
    keys.sort(function (a, b) {
      return obj[b] - obj[a];
    });
    var rows = keys
      .map(function (k) {
        var w = max ? Math.round((obj[k] / max) * 100) : 0;
        return (
          '<div class="zs-bar">' +
          '<span class="zs-bar__label">' +
          escapeHtml(k) +
          "</span>" +
          '<span class="zs-bar__n">' +
          obj[k] +
          "</span>" +
          '<div class="zs-bar__track"><div class="zs-bar__fill" data-w="' +
          w +
          '"></div></div>' +
          "</div>"
        );
      })
      .join("");
    return (
      '<div class="zs-bars"><p class="zs-bars__title">' +
      escapeHtml(title) +
      "</p>" +
      rows +
      "</div>"
    );
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    var chars = String(text).split("");
    var lines = [];
    var line = "";
    chars.forEach(function (ch) {
      var test = line + ch;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = ch;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function initWishCard() {
    var section = document.getElementById("wish-card");
    if (!section || !cfg.wishCard || cfg.wishCard.enabled === false) {
      if (section) showSection("wish-card", false);
      return;
    }

    var max = cfg.wishCard.maxLength || 70;
    var input = document.getElementById("zs-card-input");
    var count = document.getElementById("zs-card-count");
    var gen = document.getElementById("zs-card-generate");
    var canvas = document.getElementById("zs-card-canvas");
    var result = document.getElementById("zs-card-result");
    var textEl = document.getElementById("zs-card-text");
    var shareBtn = document.getElementById("zs-card-share");
    var dlBtn = document.getElementById("zs-card-download");
    var note = document.getElementById("zs-card-share-note");
    if (!input || !gen || !canvas) return;

    input.setAttribute("maxlength", String(max));
    input.addEventListener("input", function () {
      if (count) count.textContent = String(input.value.length);
    });

    gen.addEventListener("click", function () {
      var msg = input.value.trim();
      if (!msg) {
        input.focus();
        return;
      }
      drawWishCard(canvas, msg).then(function () {
        result.hidden = false;
        if (textEl) {
          textEl.textContent = "「" + msg + "」 — 我的竹願，2026・竹山";
        }
        track("wish_card_generate");
      });
    });

    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        shareWishCard(canvas, note);
      });
    }
    if (dlBtn) {
      dlBtn.addEventListener("click", function () {
        downloadWishCard(canvas);
      });
    }
  }

  function drawWishCard(canvas, message) {
    var ctx = canvas.getContext("2d");
    var w = 1080;
    var h = 1350;
    canvas.width = w;
    canvas.height = h;

    function paint() {
      ctx.fillStyle = "#F7F6F2";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = "#3d4a3a";
      ctx.lineWidth = 1;
      for (var i = 0; i < 18; i++) {
        ctx.beginPath();
        ctx.moveTo(40 + i * 62, 0);
        ctx.lineTo(10 + i * 62, h);
        ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle = "#8A8882";
      ctx.font = '28px "Noto Sans TC", "PingFang TC", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("竹山開飯了", w / 2, 180);

      ctx.fillStyle = "#5C5A54";
      ctx.font = '32px "Noto Serif TC", "PingFang TC", serif';
      ctx.fillText("竹子重生的永續花園", w / 2, 240);

      ctx.strokeStyle = "#D8D6D0";
      ctx.beginPath();
      ctx.moveTo(360, 300);
      ctx.lineTo(720, 300);
      ctx.stroke();

      ctx.fillStyle = "#111111";
      ctx.font = '48px "Noto Serif TC", "PingFang TC", serif';
      var lines = wrapCanvasText(ctx, "「" + message + "」", 780);
      var startY = 520 - ((lines.length - 1) * 32);
      lines.forEach(function (line, i) {
        ctx.fillText(line, w / 2, startY + i * 72);
      });

      ctx.fillStyle = "#8A8882";
      ctx.font = '24px "Noto Sans TC", "PingFang TC", sans-serif';
      ctx.fillText("我的竹願", w / 2, 980);
      ctx.fillText("2026・竹山", w / 2, 1024);

      ctx.fillStyle = "#3d4a3a";
      ctx.font = '26px "Noto Serif TC", serif';
      ctx.fillText(cfg.wishCard.hashtag || "#竹山開飯了", w / 2, 1120);

      ctx.fillStyle = "#8A8882";
      ctx.font = '22px "Noto Sans TC", sans-serif';
      ctx.fillText(cfg.wishCard.url || "hoyao.com/zhushan/", w / 2, 1170);
      ctx.font = '18px "Noto Sans TC", sans-serif';
      ctx.fillText("HOYAO", w / 2, 1280);
    }

    if (document.fonts && document.fonts.ready) {
      return document.fonts.ready.then(paint);
    }
    paint();
    return Promise.resolve();
  }

  function canvasToFile(canvas) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        resolve(new File([blob], "zhushan-wish.png", { type: "image/png" }));
      }, "image/png");
    });
  }

  function shareWishCard(canvas, note) {
    var text =
      "我在《竹山開飯了》留下了一個竹願。\n" +
      (cfg.wishCard.hashtag || "#竹山開飯了") +
      "\n" +
      (cfg.wishCard.url || "https://hoyao.com/zhushan/");

    canvasToFile(canvas).then(function (file) {
      var nav = navigator;
      if (nav.share) {
        var data = { title: "竹山開飯了", text: text, url: cfg.wishCard.url };
        var withFile = { title: data.title, text: data.text, files: [file] };
        var canFiles = nav.canShare && nav.canShare(withFile);
        nav
          .share(canFiles ? withFile : data)
          .then(function () {
            track("wish_card_share");
          })
          .catch(function () {
            if (note) note.hidden = false;
            downloadWishCard(canvas);
          });
        return;
      }
      if (note) note.hidden = false;
      downloadWishCard(canvas);
    });
  }

  function downloadWishCard(canvas) {
    var a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "zhushan-wish.png";
    a.click();
    track("wish_card_download");
  }

  function initCommunityShare() {
    var btn = document.getElementById("zs-community-share-btn");
    if (!btn) return;
    var url = cfg.communityShareFormUrl;
    if (!url) {
      btn.hidden = true;
      return;
    }
    btn.hidden = false;
    btn.addEventListener("click", function () {
      track("community_post_submit");
      window.open(url, "_blank", "noopener");
    });
  }

  function initCommunityMoments() {
    var section = document.getElementById("community-moments");
    var grid = document.getElementById("zs-moments");
    if (!section || !grid) return;
    var url = cfg.communityDataUrl;
    if (!url) {
      showSection("community-moments", false);
      return;
    }

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("community");
        return r.json();
      })
      .then(function (data) {
        var items = (data.items || []).filter(function (it) {
          return it.approved === true;
        }).slice(0, 12);
        if (!items.length) {
          showSection("community-moments", false);
          return;
        }
        showSection("community-moments", true);
        grid.innerHTML = items
          .map(function (it) {
            var img = it.image
              ? '<img src="' +
                escapeHtml(it.image) +
                '" alt="' +
                escapeHtml(it.text || "竹山片刻") +
                '" width="800" height="1000" loading="lazy">'
              : "";
            return (
              '<article class="zs-moment">' +
              img +
              (it.text ? "<p>「" + escapeHtml(it.text) + "」</p>" : "") +
              '<p class="zs-moment__meta">' +
              escapeHtml(it.handle || "") +
              (it.platform ? " ・ " + escapeHtml(it.platform) : "") +
              "</p>" +
              (it.url
                ? '<a href="' +
                  escapeHtml(it.url) +
                  '" rel="noopener" target="_blank" data-zs-external="community">查看原分享 →</a>'
                : "") +
              "</article>"
            );
          })
          .join("");
      })
      .catch(function () {
        showSection("community-moments", false);
      });
  }

  function initProcess() {
    var section = document.getElementById("process");
    var grid = document.getElementById("zs-process-grid");
    if (!section || !grid) return;

    var items = ((cfg.images && cfg.images.process) || []).filter(function (it) {
      return isRealSrc(it.src);
    });
    var videoUrl = cfg.video && cfg.video.url;

    if (!items.length && !videoUrl) {
      showSection("process", false);
      return;
    }

    showSection("process", true);
    grid.innerHTML = items
      .map(function (it) {
        var num = escapeHtml(it.id || "");
        var stage = it.stage ? escapeHtml(it.stage) + " ・ " : "";
        return (
          '<figure class="zs-process-item zs-reveal-child">' +
          (num ? '<span class="zs-process-item__num">' + num + "</span>" : "") +
          '<img src="' +
          escapeHtml(it.src) +
          '" width="' +
          (it.width || 800) +
          '" height="' +
          (it.height || 600) +
          '" alt="' +
          escapeHtml(it.alt || it.label || "") +
          '" loading="lazy" decoding="async">' +
          "<figcaption>" +
          stage +
          escapeHtml(it.label || "") +
          "</figcaption></figure>"
        );
      })
      .join("");

    var videoWrap = document.getElementById("zs-video");
    if (videoWrap && videoUrl) {
      videoWrap.hidden = false;
      videoWrap.innerHTML =
        '<video class="zs-video__player" controls preload="metadata" playsinline' +
        (cfg.video.poster ? ' poster="' + cfg.video.poster + '"' : "") +
        ' width="1280" height="720"><source src="' +
        videoUrl +
        '" type="video/mp4"></video>';
      var video = videoWrap.querySelector("video");
      if (video) {
        video.addEventListener("play", function () {
          track("process_video_play", { page: "zhushan" });
        });
      }
    }
  }

  function initVenue() {
    var fig = document.getElementById("zs-venue-figure");
    var img = document.getElementById("zs-venue-img");
    var venue = cfg.images && cfg.images.venue;
    if (fig && img && venue && isRealSrc(venue.src)) {
      fig.hidden = false;
      img.src = venue.src;
      img.alt = venue.alt || "";
      if (animOn) {
        var ticking = false;
        window.addEventListener(
          "scroll",
          function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
              var rect = fig.getBoundingClientRect();
              var viewH = window.innerHeight || 1;
              var p = (rect.top / viewH) * -18;
              p = Math.max(-20, Math.min(20, p));
              img.style.transform = "translateY(" + p + "px)";
              ticking = false;
            });
          },
          { passive: true }
        );
      }
    }

    var link = document.getElementById("zs-venue-link");
    if (link && cfg.externalLinks && cfg.externalLinks.venueStory) {
      link.href = cfg.externalLinks.venueStory;
      link.hidden = false;
    }
  }

  function initExternalLinks() {
    document.body.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-zs-external]");
      if (!a) return;
      track("external_link_click", {
        link_id: a.getAttribute("data-zs-external"),
        url: a.href,
      });
    });
  }

  function initScrollDepth() {
    if (!("IntersectionObserver" in window)) return;
    var marks = [25, 50, 75, 90];
    var fired = {};
    var sections = document.querySelectorAll(".zs-section[id]");
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          marks.forEach(function (m) {
            if (entry.intersectionRatio * 100 >= m && !fired[id + "-" + m]) {
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

  function initOutcomes() {
    var section = document.getElementById("outcomes");
    if (!section || !cfg.outcomes || !cfg.outcomes.visible) return;
    section.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    track("zhushan_project_view");
    initRevealAnimations();
    initHeroMotion();
    initWishForm();
    initWishesWall();
    initWishCard();
    initCommunityMoments();
    initCommunityShare();
    initProcess();
    initVenue();
    initExternalLinks();
    initScrollDepth();
    initOutcomes();
  });
})();
