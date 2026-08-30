/**
 * 竹山開飯了 V4.6 — Bamboo Visual System
 * Native scroll only. Analytics scroll depth does not mutate visuals.
 */
(function () {
  "use strict";

  var cfg = window.ZHUSHAN_CONFIG || {};
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var animOn = cfg.animations && cfg.animations.enabled !== false && !reduceMotion;
  var MAX_LEN = (cfg.wishCard && cfg.wishCard.maxLength) || 70;

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

  function isSafeHttpUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
      var parsed = new URL(url, window.location.origin);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (err) {
      return false;
    }
  }

  function showSection(id, show) {
    var el = document.getElementById(id);
    var rule = document.getElementById(id + "-rule");
    if (el) el.hidden = !show;
    if (rule) {
      rule.hidden = !show;
      if (show) rule.removeAttribute("aria-hidden");
      else rule.setAttribute("aria-hidden", "true");
    }
  }

  /** Insert content without shifting scroll when section sits above viewport. */
  function mutatePreservingScroll(mutateFn) {
    var beforeY = window.scrollY || window.pageYOffset || 0;
    var beforeH = document.documentElement.scrollHeight;
    mutateFn();
    var afterH = document.documentElement.scrollHeight;
    var delta = afterH - beforeH;
    if (delta !== 0 && beforeY > 0) {
      var anchor = document.getElementById("outcomes");
      var top = anchor ? anchor.getBoundingClientRect().top + beforeY : 0;
      if (beforeY + 40 >= top) {
        window.scrollTo(0, beforeY + delta);
      }
    }
  }

  function shuffle(list) {
    var a = list.slice();
    var i;
    for (i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function nextRound(items, lastItem) {
    var round = shuffle(items);
    if (round.length > 1 && lastItem && round[0] === lastItem) {
      var k = 1 + Math.floor(Math.random() * (round.length - 1));
      var t = round[0];
      round[0] = round[k];
      round[k] = t;
    }
    return round;
  }

  function initHeroEntrance() {
    var nodes = document.querySelectorAll(".zs-hero-anim");
    if (!animOn) {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    nodes.forEach(function (el) {
      el.classList.add("is-pending");
      var delay = parseInt(el.getAttribute("data-hero-delay") || "0", 10);
      window.setTimeout(function () {
        el.classList.add("is-in");
        el.classList.remove("is-pending");
      }, delay);
    });
  }

  function initHeroMedia() {
    var figure = document.getElementById("zs-hero-figure");
    var hero = document.getElementById("zs-hero-img");
    var header = document.querySelector(".zs-hero");
    var visual = document.getElementById("zs-hero-visual");
    var h = cfg.images && cfg.images.hero;
    var real = h && isRealSrc(h.src);

    if (figure && hero && real) {
      figure.hidden = false;
      hero.src = h.src;
      hero.alt = h.alt || "";
      if (h.width) hero.width = h.width;
      if (h.height) hero.height = h.height;
      var cap = document.getElementById("zs-hero-caption");
      if (cap && h.caption) {
        cap.hidden = false;
        cap.textContent = h.caption;
      }
      if (header) header.classList.add("zs-hero--has-photo");
    } else {
      if (figure) figure.hidden = true;
      if (visual) visual.hidden = false;
    }
  }

  function spawnPassingLine(text) {
    var stage = document.getElementById("zs-reaction-stage");
    if (!stage) return false;
    var active = stage.querySelectorAll(".zs-danmaku");
    if (active.length >= 3) return false;

    var node = document.createElement("span");
    node.className = "zs-danmaku";
    node.setAttribute("aria-hidden", "true");
    node.textContent = text;

    /* Organic field — avoid fixed 3 lanes */
    var y = 12 + Math.random() * 68;
    var rot = (Math.random() * 0.4 - 0.2).toFixed(2);
    node.style.top = y + "%";
    node.style.opacity = String(0.42 + Math.random() * 0.38);
    node.style.setProperty("--zs-rot", rot + "deg");
    var mobile = window.matchMedia("(max-width: 600px)").matches;
    node.style.fontSize = mobile
      ? 14 + Math.round(Math.random() * 5) + "px"
      : 16 + Math.round(Math.random() * 8) + "px";

    function cleanup() {
      if (node.parentNode) node.parentNode.removeChild(node);
    }

    stage.appendChild(node);

    if (reduceMotion) {
      node.classList.add("is-fade");
      node.addEventListener("animationend", cleanup);
      window.setTimeout(cleanup, 3400);
    } else {
      var dur = 11000 + Math.floor(Math.random() * 5001);
      node.style.setProperty("--zs-dur", dur + "ms");
      node.classList.add("is-drift");
      node.addEventListener("animationend", cleanup);
      window.setTimeout(cleanup, dur + 400);
    }
    return true;
  }

  function announcePassed() {
    var live = document.getElementById("zs-ephemeral-live");
    var status = document.getElementById("zs-ephemeral-status");
    if (live) live.textContent = "這句話已經飄過。";
    if (status) status.hidden = false;
  }

  function initComposer() {
    var input = document.getElementById("zs-thought-input");
    var count = document.getElementById("zs-thought-count");
    var ephemeralBtn = document.getElementById("zs-ephemeral-btn");
    var keepBtn = document.getElementById("zs-keep-wish-btn");
    var keepWrap = document.getElementById("zs-keep-wrap");
    var toCard = document.getElementById("zs-to-card-btn");
    var canvas = document.getElementById("zs-card-canvas");
    var result = document.getElementById("zs-card-result");
    var textEl = document.getElementById("zs-card-text");
    var shareBtn = document.getElementById("zs-card-share");
    var dlBtn = document.getElementById("zs-card-download");
    var note = document.getElementById("zs-card-share-note");
    var passedOnce = false;
    var cardEnabled = cfg.wishCard && cfg.wishCard.enabled !== false;

    if (input && count) {
      input.setAttribute("maxlength", String(MAX_LEN));
      input.addEventListener("input", function () {
        count.textContent = String(input.value.length);
      });
    }

    if (ephemeralBtn && input) {
      ephemeralBtn.addEventListener("click", function () {
        var text = input.value.trim();
        if (!text) {
          input.focus();
          return;
        }
        if (!spawnPassingLine(text)) return;
        announcePassed();
        track("passing_thought", { page: "zhushan", action: "ephemeral_sent" });
        if (!passedOnce) {
          passedOnce = true;
          ephemeralBtn.textContent = "再飄一次";
        }
      });
    }

    if (keepWrap && keepBtn) {
      var formUrl = cfg.googleFormUrl;
      if (!isSafeHttpUrl(formUrl)) {
        keepWrap.hidden = true;
      } else {
        keepWrap.hidden = false;
        keepWrap.removeAttribute("aria-hidden");
        keepBtn.addEventListener("click", function () {
          var url = formUrl;
          var entry = cfg.googleFormWishEntry;
          var thought = input ? input.value.trim() : "";
          if (entry && /^entry\.\d+$/.test(entry) && thought) {
            url +=
              (url.indexOf("?") >= 0 ? "&" : "?") +
              entry +
              "=" +
              encodeURIComponent(thought);
          }
          if (!isSafeHttpUrl(url)) return;
          track("wish_form_open", { page: "zhushan" });
          window.open(url, "_blank", "noopener,noreferrer");
        });
      }
    }

    function generateCard() {
      if (!input || !canvas || !result) return;
      var msg = input.value.trim();
      if (!msg) {
        input.focus();
        return;
      }
      drawWishCard(canvas, msg).then(function () {
        result.hidden = false;
        result.classList.remove("is-ready");
        void result.offsetWidth;
        result.classList.add("is-ready");
        if (textEl) {
          textEl.textContent = "「" + msg + "」 — 我的竹願，2026・竹山";
        }
        track("wish_card_generate", { page: "zhushan" });
      });
    }

    if (toCard) {
      if (!cardEnabled) {
        toCard.hidden = true;
      } else {
        toCard.addEventListener("click", generateCard);
      }
    }

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

    var quick = document.getElementById("zs-quick-reactions");
    if (quick) {
      quick.addEventListener("click", function (e) {
        var btn = e.target.closest && e.target.closest("button[data-reaction-id]");
        if (!btn) return;
        var label = (btn.textContent || "").trim();
        if (!label) return;
        if (!spawnPassingLine(label)) return;
        announcePassed();
        track("quick_reaction", {
          page: "zhushan",
          reaction_id: btn.getAttribute("data-reaction-id"),
          reaction_text: label,
        });
      });
    }
  }

  function wishesSourceUrl() {
    if (cfg.dataMode === "static") {
      return cfg.staticWishesUrl || "/assets/data/zhushan-wishes.json";
    }
    return cfg.wishesApiUrl || cfg.staticWishesUrl || "";
  }

  function initWishesWall() {
    var section = document.getElementById("wishes-live");
    var wall = document.getElementById("zs-wishes-wall");
    var stats = document.getElementById("zs-wish-stats");
    if (stats) stats.hidden = true;
    if (!section || !wall) return;

    var url = wishesSourceUrl();
    if (!isSafeHttpUrl(url) && url.indexOf("/") !== 0) {
      showSection("wishes-live", false);
      return;
    }

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("wishes");
        return r.json();
      })
      .then(function (data) {
        var items = (data.approved || []).filter(function (w) {
          return w && w.message;
        });
        if (!items.length) {
          showSection("wishes-live", false);
          return;
        }
        showSection("wishes-live", true);
        renderWishesRotation(wall, items);
      })
      .catch(function () {
        showSection("wishes-live", false);
      });
  }

  function renderWishesRotation(container, items) {
    var round = nextRound(items, null);
    var index = 0;
    var lastItem = null;

    function paint(item) {
      var prev = container.querySelector(".zs-wishes__quote:not(.is-leaving)");
      if (prev) {
        prev.classList.remove("is-visible");
        prev.classList.add("is-leaving");
        window.setTimeout(function () {
          if (prev.parentNode) prev.parentNode.removeChild(prev);
        }, 750);
      }
      var block = document.createElement("blockquote");
      block.className = "zs-wishes__quote";
      block.innerHTML = "<p>「" + escapeHtml(item.message) + "」</p>";
      container.appendChild(block);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          block.classList.add("is-visible");
        });
      });
    }

    function showNext() {
      if (index >= round.length) {
        lastItem = round[round.length - 1];
        round = nextRound(items, lastItem);
        index = 0;
      }
      paint(round[index]);
      index += 1;
    }

    showNext();
    if (items.length > 1) {
      window.setInterval(showNext, 8000);
    }
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

  function drawWishCard(canvas, message) {
    var ctx = canvas.getContext("2d");
    var w = 1080;
    var h = 1350;
    canvas.width = w;
    canvas.height = h;

    function paint() {
      ctx.fillStyle = "#F5F4EF";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = 0.045;
      ctx.strokeStyle = "#3a4a38";
      ctx.lineWidth = 1;
      for (var i = 0; i < 18; i++) {
        ctx.beginPath();
        ctx.moveTo(40 + i * 62, 0);
        ctx.lineTo(10 + i * 62, h);
        ctx.stroke();
      }
      ctx.restore();

      /* small bamboo ring mark */
      ctx.save();
      ctx.strokeStyle = "#3a4a38";
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(w / 2, 130, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w / 2, 130, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#8A8780";
      ctx.font = '28px "Noto Sans TC", "PingFang TC", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("竹山開飯了", w / 2, 200);

      ctx.fillStyle = "#5A5852";
      ctx.font = '32px "Noto Serif TC", "PingFang TC", serif';
      ctx.fillText("竹子重生的永續花園", w / 2, 260);

      ctx.strokeStyle = "#D4D1C9";
      ctx.beginPath();
      ctx.moveTo(360, 320);
      ctx.lineTo(720, 320);
      ctx.stroke();

      ctx.fillStyle = "#1A1A18";
      ctx.font = '48px "Noto Serif TC", "PingFang TC", serif';
      var lines = wrapCanvasText(ctx, "「" + message + "」", 780);
      var startY = 520 - (lines.length - 1) * 32;
      lines.forEach(function (line, i) {
        ctx.fillText(line, w / 2, startY + i * 72);
      });

      ctx.fillStyle = "#8A8780";
      ctx.font = '24px "Noto Sans TC", "PingFang TC", sans-serif';
      ctx.fillText("我的竹願", w / 2, 980);
      ctx.fillText("2026・竹山", w / 2, 1024);

      ctx.fillStyle = "#3a4a38";
      ctx.font = '26px "Noto Serif TC", serif';
      ctx.fillText(cfg.wishCard.hashtag || "#竹山開飯了", w / 2, 1120);

      ctx.fillStyle = "#8A8780";
      ctx.font = '22px "Noto Sans TC", sans-serif';
      ctx.fillText(cfg.wishCard.url || "hoyao.com/zhushan/", w / 2, 1170);
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
            track("wish_card_share", { page: "zhushan" });
          })
          .catch(function (err) {
            if (err && err.name === "AbortError") return;
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
    track("wish_card_download", { page: "zhushan" });
  }

  function initCommunityShare() {
    var btn = document.getElementById("zs-community-share-btn");
    if (!btn) return;
    var url = cfg.communityShareFormUrl;
    if (!isSafeHttpUrl(url)) {
      btn.hidden = true;
      return;
    }
    btn.hidden = false;
    btn.addEventListener("click", function () {
      track("community_post_submit", { page: "zhushan" });
      window.open(url, "_blank", "noopener,noreferrer");
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
        var items = (data.items || [])
          .filter(function (it) {
            return it.approved === true && (!it.url || isSafeHttpUrl(it.url));
          })
          .slice(0, 12);
        if (!items.length) {
          showSection("community-moments", false);
          return;
        }
        showSection("community-moments", true);
        grid.innerHTML = items
          .map(function (it) {
            var img =
              it.image && isSafeHttpUrl(it.image)
                ? '<img src="' +
                  escapeHtml(it.image) +
                  '" alt="' +
                  escapeHtml(it.text || "竹山片刻") +
                  '" width="800" height="1000" loading="lazy">'
                : it.image && String(it.image).charAt(0) === "/"
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
              (it.url && isSafeHttpUrl(it.url)
                ? '<a href="' +
                  escapeHtml(it.url) +
                  '" rel="noopener noreferrer" target="_blank" data-entity="community_moment" data-channel="original_post">查看原分享</a>'
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

  function youtubeIdSafe(id) {
    return typeof id === "string" && /^[A-Za-z0-9_-]{11}$/.test(id);
  }

  function initProcess() {
    var section = document.getElementById("process");
    var grid = document.getElementById("zs-process-grid");
    if (!section || !grid) return;

    var items = ((cfg.images && cfg.images.process) || []).filter(function (it) {
      return isRealSrc(it.src);
    });
    var youtubeId = cfg.video && cfg.video.youtubeId;
    var videoUrl = cfg.video && cfg.video.url;
    var hasYt = youtubeIdSafe(youtubeId);
    var hasMp4 = isSafeHttpUrl(videoUrl);

    if (!items.length && !hasYt && !hasMp4) {
      showSection("process", false);
      return;
    }

    showSection("process", true);
    grid.innerHTML = items
      .map(function (it) {
        var num = escapeHtml(it.id || "");
        var stage = it.stage ? escapeHtml(it.stage) + " ・ " : "";
        return (
          '<figure class="zs-process-item">' +
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
    if (!videoWrap) return;

    if (hasYt) {
      videoWrap.hidden = false;
      var poster = cfg.video.poster && isRealSrc(cfg.video.poster) ? cfg.video.poster : "";
      var title = cfg.video.title || "播放影片";
      videoWrap.innerHTML =
        '<button type="button" class="zs-video__poster" id="zs-yt-play">' +
        (poster ? '<img src="' + escapeHtml(poster) + '" alt="">' : "") +
        "<span>播放「" +
        escapeHtml(title) +
        "」</span></button>";
      var play = document.getElementById("zs-yt-play");
      if (play) {
        play.addEventListener("click", function () {
          videoWrap.innerHTML =
            '<iframe src="https://www.youtube-nocookie.com/embed/' +
            youtubeId +
            '?autoplay=1" title="' +
            escapeHtml(title) +
            '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
          track("process_video_play", { page: "zhushan", type: "youtube" });
        });
      }
      return;
    }

    if (hasMp4) {
      videoWrap.hidden = false;
      videoWrap.innerHTML =
        '<video class="zs-video__player" controls preload="metadata" playsinline' +
        (cfg.video.poster && isRealSrc(cfg.video.poster)
          ? ' poster="' + escapeHtml(cfg.video.poster) + '"'
          : "") +
        ' width="1280" height="720"><source src="' +
        escapeHtml(videoUrl) +
        '" type="video/mp4"></video>';
      var video = videoWrap.querySelector("video");
      if (video) {
        video.addEventListener("play", function () {
          track("process_video_play", { page: "zhushan", type: "mp4" });
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
    }
  }

  function initExternalLinks() {
    var links = cfg.externalLinks || {};
    var nodes = document.querySelectorAll("[data-zs-link]");
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      var url = links[a.getAttribute("data-zs-link")];
      if (!isSafeHttpUrl(url)) {
        a.hidden = true;
        a.removeAttribute("href");
        continue;
      }
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }

    document.body.addEventListener("click", function (e) {
      var link = e.target.closest && e.target.closest("a[data-entity]");
      if (!link || !link.href) return;
      track("external_link_click", {
        entity: link.getAttribute("data-entity"),
        channel: link.getAttribute("data-channel") || "",
        url: link.href,
      });
    });
  }

  function initProjectContact() {
    var el = document.getElementById("zs-project-contact");
    if (!el) return;
    var links = cfg.externalLinks || {};
    var harmony = links.harmonyCultureWebsite || "https://harmonyculture.art";
    var hoyao = links.hoyaoWebsite || "https://hoyao.com/";
    var email = (cfg.contactEmail || "").trim();
    var parts = [];

    if (isSafeHttpUrl(harmony)) {
      parts.push(
        '<a href="' +
          escapeHtml(harmony) +
          '" target="_blank" rel="noopener noreferrer" data-entity="harmony_culture" data-channel="website" data-zs-link="harmonyCultureWebsite">和聲文化音樂</a>'
      );
    } else {
      parts.push("和聲文化音樂");
    }

    if (isSafeHttpUrl(hoyao)) {
      parts.push(
        '<a href="' +
          escapeHtml(hoyao) +
          '" data-entity="hoyao" data-channel="website" data-zs-link="hoyaoWebsite">HOYAO 和曜應用科技</a>'
      );
    } else {
      parts.push("HOYAO 和曜應用科技");
    }

    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      parts.push(
        '合作與交流：<a href="mailto:' +
          escapeHtml(email) +
          '">' +
          escapeHtml(email) +
          "</a>"
      );
    }

    el.innerHTML = parts.join(" · ");
  }

  /** Analytics only — never mutates visuals. */
  function initScrollDepth() {
    var marks = [25, 50, 75, 90];
    var fired = {};
    var ticking = false;

    function measure() {
      ticking = false;
      var doc = document.documentElement;
      var body = document.body;
      var height = Math.max(
        doc.scrollHeight,
        body ? body.scrollHeight : 0,
        doc.offsetHeight
      );
      var max = height - window.innerHeight;
      if (max <= 0) return;
      var pct = (window.scrollY / max) * 100;
      marks.forEach(function (m) {
        if (pct >= m && !fired[m]) {
          fired[m] = true;
          track("scroll_depth", { page: "zhushan", depth: m });
        }
      });
    }

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(measure);
      },
      { passive: true }
    );
  }

  function isPresentNumber(v) {
    return typeof v === "number" && isFinite(v);
  }

  function namedCounts(list) {
    if (!list || !list.length) return [];
    return list
      .filter(function (it) {
        return it && it.name && isPresentNumber(it.count) && it.count > 0;
      })
      .sort(function (a, b) {
        return b.count - a.count;
      });
  }

  function collapseNamedCounts(list, maxNamed) {
    var items = namedCounts(list);
    if (items.length <= maxNamed) return items;
    var head = items.slice(0, maxNamed);
    var rest = items.slice(maxNamed);
    var other = 0;
    rest.forEach(function (it) {
      other += it.count;
    });
    if (other > 0) head.push({ name: "其他", count: other });
    return head;
  }

  function sampleNote(n) {
    if (!isPresentNumber(n)) return "";
    if (n < 20) return "";
    if (n < 50) return "初步參與觀察";
    return "";
  }

  /** Bamboo ring marks — concentric circles, not solid dots. */
  function renderRingPlot(items) {
    if (!items.length) return "";
    var max = items[0].count;
    return (
      '<ol class="zs-obs-dots">' +
      items
        .map(function (it) {
          var vis = max > 0 ? Math.max(1, Math.round((it.count / max) * 16)) : 1;
          var marks = "";
          var i;
          for (i = 0; i < vis; i++) {
            marks += '<span class="zs-obs-dots__mark" aria-hidden="true"></span>';
          }
          return (
            '<li class="zs-obs-dots__row">' +
            '<span class="zs-obs-dots__name">' +
            escapeHtml(it.name) +
            "</span>" +
            '<span class="zs-obs-dots__track">' +
            marks +
            '</span><span class="zs-obs-dots__n">' +
            it.count +
            "</span></li>"
          );
        })
        .join("") +
      "</ol>"
    );
  }

  /** 10×10 tiny bamboo stems. */
  function renderBambooMatrix(value) {
    var n = Math.max(0, Math.min(100, Math.round(value)));
    var html = '<div class="zs-obs-matrix" aria-hidden="true">';
    var i;
    for (i = 0; i < 100; i++) {
      html +=
        '<span class="zs-obs-matrix__stem' +
        (i < n ? " is-on" : "") +
        '"></span>';
    }
    return html + "</div>";
  }

  /** Horizontal ranked bamboo segment bars — static, no width animation. */
  function renderBambooBars(items) {
    if (!items.length) return "";
    var max = items[0].count;
    return (
      '<ol class="zs-obs-rank">' +
      items
        .map(function (it, idx) {
          var segs = max > 0 ? Math.max(1, Math.round((it.count / max) * 18)) : 1;
          var marks = "";
          var i;
          for (i = 0; i < segs; i++) {
            marks += '<span class="zs-obs-rank__seg" aria-hidden="true"></span>';
          }
          return (
            '<li class="zs-obs-rank__row">' +
            '<span class="zs-obs-rank__i">' +
            (idx + 1) +
            '</span><span class="zs-obs-rank__name">' +
            escapeHtml(it.name) +
            '</span><span class="zs-obs-rank__track">' +
            marks +
            '</span><span class="zs-obs-rank__n">' +
            it.count +
            "</span></li>"
          );
        })
        .join("") +
      "</ol>"
    );
  }

  function renderWishConstellation(items, title, disclaimer) {
    if (!items.length) return "";
    var max = items[0].count;
    var angles = [-72, 18, 108, 198];
    var cx = 260;
    var cy = 250;
    var baseR = 118;

    var clusters = items.slice(0, 4).map(function (it, i) {
      var ang = (angles[i] * Math.PI) / 180;
      var r = baseR + (i % 2) * 8;
      var x = cx + Math.cos(ang) * r;
      var y = cy + Math.sin(ang) * r;
      var size = 14 + (max > 0 ? (it.count / max) * 22 : 0);
      var labelY = y + size / 2 + 18;
      return (
        '<g class="zs-constellation__cluster">' +
        '<line x1="' +
        cx +
        '" y1="' +
        cy +
        '" x2="' +
        x.toFixed(1) +
        '" y2="' +
        y.toFixed(1) +
        '" stroke="currentColor" stroke-width="0.6" opacity="0.28"/>' +
        '<circle cx="' +
        x.toFixed(1) +
        '" cy="' +
        y.toFixed(1) +
        '" r="' +
        (size / 2).toFixed(1) +
        '" fill="none" stroke="currentColor" stroke-width="1" opacity="0.55"/>' +
        '<circle cx="' +
        x.toFixed(1) +
        '" cy="' +
        y.toFixed(1) +
        '" r="' +
        (size / 4).toFixed(1) +
        '" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>' +
        '<circle cx="' +
        x.toFixed(1) +
        '" cy="' +
        y.toFixed(1) +
        '" r="2.2" fill="currentColor" opacity="0.5"/>' +
        '<text class="zs-constellation__label" x="' +
        x.toFixed(1) +
        '" y="' +
        labelY.toFixed(1) +
        '" text-anchor="middle">' +
        escapeHtml(it.name) +
        "</text>" +
        '<text class="zs-constellation__count" x="' +
        x.toFixed(1) +
        '" y="' +
        (labelY + 14).toFixed(1) +
        '" text-anchor="middle">' +
        it.count +
        "</text></g>"
      );
    });

    var legend =
      '<ul class="zs-constellation__legend" aria-label="竹願主題">' +
      items
        .map(function (it) {
          return (
            "<li><span>" +
            escapeHtml(it.name) +
            "</span><em>" +
            it.count +
            "</em></li>"
          );
        })
        .join("") +
      "</ul>";

    return (
      '<div class="zs-obs-block"><h3 class="zs-obs-h">' +
      escapeHtml(title || "竹願裡，看見什麼？") +
      '</h3><p class="zs-obs-disc">' +
      escapeHtml(
        disclaimer ||
          "依目前公開竹願內容進行主題整理；屬內容觀察，不代表參與人次。"
      ) +
      '</p><figure class="zs-constellation"><svg class="zs-constellation__svg" viewBox="0 0 520 520" role="img" aria-hidden="true">' +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="28" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.4"/>' +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="14" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.3"/>' +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="3" fill="currentColor" opacity="0.45"/>' +
      '<text class="zs-constellation__center-label" x="' +
      cx +
      '" y="' +
      (cy + 5) +
      '" text-anchor="middle">竹山</text>' +
      clusters.join("") +
      "</svg></figure>" +
      legend +
      "</div>"
    );
  }

  function buildOutcomesHtml(data) {
    if (!data || typeof data !== "object") return "";
    var html = [];
    var kpis = data.kpis || data.summary || {};
    var kpiDefs = [
      { key: "participants", label: "現場參與／互動人次" },
      { key: "wishes", label: "正式收錄竹願" },
      { key: "regions", label: "參與者來源地區數" },
      { key: "validSurveys", label: "有效參與觀察樣本" },
    ];
    var kpiParts = [];
    kpiDefs.forEach(function (def) {
      if (kpis[def.key] === null || kpis[def.key] === undefined) return;
      if (!isPresentNumber(kpis[def.key])) return;
      kpiParts.push(
        '<div class="zs-obs-kpi"><p class="zs-obs-kpi__n">' +
          kpis[def.key] +
          '</p><p class="zs-obs-kpi__l">' +
          escapeHtml(def.label) +
          "</p></div>"
      );
    });
    if (kpiParts.length) {
      html.push('<div class="zs-obs-kpis">' + kpiParts.join("") + "</div>");
    }

    var nSurvey = isPresentNumber(kpis.validSurveys) ? kpis.validSurveys : null;
    var note = sampleNote(nSurvey);
    if (note) {
      html.push('<p class="zs-obs-note">' + escapeHtml(note) + "</p>");
    }

    var regions = collapseNamedCounts(data.regions, 8);
    if (regions.length) {
      html.push(
        '<div class="zs-obs-block"><h3 class="zs-obs-h">參與從哪裡來</h3>' +
          renderRingPlot(regions) +
          "</div>"
      );
    }

    var relations = namedCounts(data.relations);
    if (relations.length) {
      html.push(
        '<div class="zs-obs-block"><h3 class="zs-obs-h">與竹山的關係</h3>' +
          '<table class="zs-obs-table"><caption class="zs-visually-hidden">與竹山的關係</caption><thead><tr><th>關係</th><th>人數</th></tr></thead><tbody>' +
          relations
            .map(function (it) {
              return (
                "<tr><td>" +
                escapeHtml(it.name) +
                "</td><td>" +
                it.count +
                "</td></tr>"
              );
            })
            .join("") +
          "</tbody></table></div>"
      );
    }

    var rates = (data.rates || []).filter(function (it) {
      return it && it.label && isPresentNumber(it.value);
    });
    if (rates.length && nSurvey !== null && nSurvey >= 20) {
      html.push('<div class="zs-obs-block"><h3 class="zs-obs-h">參與觀察比例</h3>');
      rates.forEach(function (it) {
        var v = Math.max(0, Math.min(100, it.value));
        html.push(
          '<div class="zs-obs-rate" title="' +
            escapeHtml(it.label) +
            '"><p class="zs-obs-rate__n">' +
            Math.round(v) +
            "<span>%</span></p><p class=\"zs-obs-rate__l\">" +
            escapeHtml(it.label) +
            "</p>" +
            renderBambooMatrix(v) +
            "</div>"
        );
      });
      html.push("</div>");
    }

    var interactions = namedCounts(data.interactions);
    if (interactions.length) {
      html.push(
        '<div class="zs-obs-block"><h3 class="zs-obs-h">最有感的互動</h3>' +
          '<p class="zs-obs-sub">哪一種參與式設計最能留下印象</p>' +
          renderBambooBars(interactions) +
          "</div>"
      );
    }

    var apps = namedCounts(data.applications).slice(0, 5);
    if (apps.length) {
      html.push(
        '<div class="zs-obs-block"><h3 class="zs-obs-h">希望竹材應用在哪裡</h3>' +
          '<ol class="zs-obs-tags">' +
          apps
            .map(function (it, idx) {
              return (
                "<li><span>" +
                (idx + 1) +
                "</span>" +
                escapeHtml(it.name) +
                "<em>" +
                it.count +
                "</em></li>"
              );
            })
            .join("") +
          "</ol></div>"
      );
    }

    var voices = (data.voices || [])
      .map(function (it) {
        if (!it) return null;
        var quote = it.quote || it.message;
        if (!quote) return null;
        var meta = it.meta || [it.place, it.relation].filter(Boolean).join("・");
        return { quote: quote, meta: meta };
      })
      .filter(Boolean)
      .slice(0, 6);
    if (voices.length) {
      html.push('<div class="zs-obs-block"><h3 class="zs-obs-h">精選竹願／民眾分享</h3>');
      voices.forEach(function (it) {
        html.push(
          '<blockquote class="zs-obs-voice"><p>「' +
            escapeHtml(it.quote) +
            "」</p>" +
            (it.meta ? "<footer>" + escapeHtml(it.meta) + "</footer>" : "") +
            "</blockquote>"
        );
      });
      html.push("</div>");
    }

    var themeSource = data.wishThemes;
    var themeItems = [];
    var tTitle = "竹願裡，看見什麼？";
    var tDisc =
      "依目前公開竹願內容進行主題整理；屬內容觀察，不代表參與人次。";
    if (Array.isArray(themeSource)) {
      themeItems = namedCounts(themeSource);
      tDisc = data.wishThemesNote || tDisc;
    } else if (themeSource && typeof themeSource === "object") {
      themeItems = namedCounts(themeSource.items);
      tTitle = themeSource.title || tTitle;
      tDisc = themeSource.disclaimer || data.wishThemesNote || tDisc;
    }
    if (themeItems.length) {
      html.push(renderWishConstellation(themeItems, tTitle, tDisc));
    }

    return html.join("");
  }

  function applyOutcomes(data) {
    var section = document.getElementById("outcomes");
    var root = document.getElementById("zs-outcomes-root");
    if (!section || !root) return;

    var html = buildOutcomesHtml(data);
    if (!html) {
      showSection("outcomes", false);
      return;
    }

    mutatePreservingScroll(function () {
      root.innerHTML = html;
      showSection("outcomes", true);
    });
  }

  function initOutcomes() {
    var section = document.getElementById("outcomes");
    var root = document.getElementById("zs-outcomes-root");
    if (!section || !root) return;

    var early = window.__ZS_OUTCOMES_P;
    if (early && typeof early.then === "function") {
      early.then(function (data) {
        if (data) applyOutcomes(data);
        else showSection("outcomes", false);
      });
      return;
    }

    var url = cfg.outcomesUrl || "/assets/data/zhushan-outcomes.json";
    if (!isSafeHttpUrl(url) && String(url).charAt(0) !== "/") {
      showSection("outcomes", false);
      return;
    }

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("outcomes");
        return r.json();
      })
      .then(function (data) {
        applyOutcomes(data);
      })
      .catch(function () {
        showSection("outcomes", false);
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    track("zhushan_project_view", { page: "zhushan" });
    initHeroEntrance();
    initHeroMedia();
    initComposer();
    initWishesWall();
    initCommunityMoments();
    initCommunityShare();
    initProcess();
    initVenue();
    initExternalLinks();
    initProjectContact();
    initScrollDepth();
    initOutcomes();
  });
})();
