/**
 * 竹山開飯了 V5 — core archive (participation in companion module)
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
  var CARD_SIZE = (cfg.wishCard && cfg.wishCard.size) || 1080;
  var qrImagePromise = null;

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
    if (src.indexOf("placeholder-") !== -1) return false;
    if (src.indexOf("/placeholders/") !== -1) return false;
    return true;
  }

  function placeholdersOn() {
    return !!(cfg.placeholders && cfg.placeholders.enabled);
  }

  function canDisplayImage(img) {
    if (!img || !img.src) return false;
    if (img.placeholder) return placeholdersOn();
    return isRealSrc(img.src);
  }

  function loadQrImage() {
    if (qrImagePromise) return qrImagePromise;
    var src =
      (cfg.placeholders && cfg.placeholders.qr) ||
      "/assets/placeholders/zhushan/qr-zhushan.png";
    qrImagePromise = new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
    return qrImagePromise;
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
    var caption = document.getElementById("zs-hero-caption");
    var h = cfg.images && cfg.images.hero;
    if (visual) visual.hidden = false;
    if (!h || !h.src || h.placeholder || !isRealSrc(h.src)) {
      if (figure) figure.hidden = true;
      if (caption) caption.hidden = true;
      return;
    }

    var probe = new Image();
    probe.onload = function () {
      if (figure && hero) {
        figure.hidden = false;
        hero.src = h.src;
        hero.alt = h.alt || "";
        if (h.width) hero.width = h.width;
        if (h.height) hero.height = h.height;
      }
      if (header) {
        header.classList.add("zs-hero--has-photo");
        header.classList.remove("zs-hero--placeholder");
      }
      if (visual) visual.classList.add("zs-hero__visual--photo");
      if (caption) {
        var capText = String(h.caption || "").trim();
        if (capText && !/placeholder|待替換|預覽|測試|展前/i.test(capText)) {
          caption.hidden = false;
          caption.textContent = capText;
        } else {
          caption.hidden = true;
        }
      }
    };
    probe.onerror = function () {
      if (figure) figure.hidden = true;
      if (caption) caption.hidden = true;
      if (header) header.classList.remove("zs-hero--has-photo");
    };
    probe.src = h.src;
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

  function setCardStatus(msg, show) {
    var el = document.getElementById("zs-card-action-status");
    if (!el) return;
    if (!show) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.textContent = msg;
  }

  function syncCardPreview(canvas) {
    var preview = document.getElementById("zs-card-preview");
    if (!preview || !canvas) return;
    preview.src = canvas.toDataURL("image/png");
  }

  function defaultShareText() {
    return (
      (cfg.wishCard && cfg.wishCard.shareText) ||
      "我在《竹山開飯了》留下了一張竹願卡。\n從竹林到餐桌，再從餐桌回到土地。\nhttps://hoyao.com/zhushan"
    );
  }

  function initComposer() {
    /* V5: handled by zhushan-participation.js */
  }

  function wishesSourceUrl() {
    if (cfg.dataMode === "static") {
      return cfg.staticWishesUrl || "/assets/data/zhushan-wishes.json";
    }
    return cfg.wishesApiUrl || cfg.staticWishesUrl || "";
  }

  function initWishesWall() {
    /* moved to zhushan-participation.js unified field */
  }

  function weightedItems(items) {
    var out = [];
    items.forEach(function (it) {
      var w = 1;
      if (it.boost || it.featured) w = 3;
      if (it.recent) w = 4;
      var i;
      for (i = 0; i < w; i++) out.push(it);
    });
    return out;
  }

  function renderWishesRotation(container, items) {
    var groupSize = items.length >= 3 ? 3 : items.length >= 2 ? 2 : 1;
    var round = nextRound(items, null);
    var index = 0;
    var lastGroupTail = null;

    function leaveGroup() {
      var prev = container.querySelector(".zs-wishes__group:not(.is-leaving)");
      if (!prev) return;
      prev.classList.remove("is-visible");
      prev.classList.add("is-leaving");
      window.setTimeout(function () {
        if (prev.parentNode) prev.parentNode.removeChild(prev);
      }, 700);
    }

    function paintGroup(batch) {
      leaveGroup();
      var group = document.createElement("div");
      group.className = "zs-wishes__group";
      group.innerHTML = batch
        .map(function (item) {
          return (
            '<blockquote class="zs-wishes__quote zs-wishes__quote--approved"><p>「' +
            escapeHtml(item.message) +
            "」</p></blockquote>"
          );
        })
        .join("");
      container.appendChild(group);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          group.classList.add("is-visible");
        });
      });
    }

    function showNext() {
      if (index >= round.length) {
        lastGroupTail = round[round.length - 1];
        round = nextRound(items, lastGroupTail);
        index = 0;
      }
      var batch = [];
      var i;
      for (i = 0; i < groupSize && index < round.length; i++) {
        batch.push(round[index]);
        index += 1;
      }
      /* if short leftover at end of cycle, still show */
      if (!batch.length) return;
      paintGroup(batch);
    }

    showNext();
    if (items.length > groupSize) {
      window.setInterval(showNext, 7000);
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

  function drawWishCard(canvas, message, signer) {
    var ctx = canvas.getContext("2d");
    var w = CARD_SIZE;
    var h = CARD_SIZE;
    canvas.width = w;
    canvas.height = h;
    signer = signer || "";

    function paint(qrImg) {
      /* paper */
      ctx.fillStyle = "#F5F3EC";
      ctx.fillRect(0, 0, w, h);

      /* fiber texture */
      ctx.save();
      ctx.globalAlpha = 0.045;
      ctx.strokeStyle = "#3A4A38";
      ctx.lineWidth = 1;
      var i;
      for (i = 0; i < 22; i++) {
        ctx.beginPath();
        ctx.moveTo(30 + i * 52, 0);
        ctx.lineTo(-20 + i * 52, h);
        ctx.stroke();
      }
      ctx.restore();

      /* soft leaf shadow */
      ctx.save();
      ctx.globalAlpha = 0.035;
      var grd = ctx.createRadialGradient(w * 0.78, h * 0.22, 10, w * 0.78, h * 0.22, 220);
      grd.addColorStop(0, "#3A4A38");
      grd.addColorStop(1, "rgba(58,74,56,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      /* bamboo stems decoration left */
      ctx.save();
      ctx.strokeStyle = "#3A4A38";
      ctx.fillStyle = "#3A4A38";
      [[48, 0.18, 1.2], [78, 0.28, 1.5], [108, 0.14, 1.05]].forEach(function (stem) {
        ctx.globalAlpha = stem[1];
        ctx.lineWidth = stem[2];
        ctx.beginPath();
        ctx.moveTo(stem[0], h - 40);
        ctx.lineTo(stem[0], 120);
        ctx.stroke();
        [220, 380, 560, 760].forEach(function (y) {
          ctx.beginPath();
          ctx.arc(stem[0], y, 2.4, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      ctx.restore();

      /* ring motif top-right */
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = "#3A4A38";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(w - 120, 150, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w - 120, 150, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w - 120, 150, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#3A4A38";
      ctx.fill();
      ctx.restore();

      /* border */
      ctx.strokeStyle = "#D4D1C9";
      ctx.lineWidth = 1;
      ctx.strokeRect(48, 48, w - 96, h - 96);

      ctx.textAlign = "center";
      ctx.fillStyle = "#8A8780";
      ctx.font = '28px "Noto Sans TC", "PingFang TC", sans-serif';
      ctx.fillText("竹山開飯了", w / 2, 160);

      ctx.fillStyle = "#5A5852";
      ctx.font = '30px "Noto Serif TC", "PingFang TC", serif';
      ctx.fillText("竹子重生的永續花園", w / 2, 210);

      ctx.strokeStyle = "#D4D1C9";
      ctx.beginPath();
      ctx.moveTo(w * 0.32, 248);
      ctx.lineTo(w * 0.68, 248);
      ctx.stroke();
      /* tiny node on rule */
      ctx.fillStyle = "#3A4A38";
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(w / 2, 248, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = "#1A1A18";
      ctx.font = '46px "Noto Serif TC", "PingFang TC", serif';
      var lines = wrapCanvasText(ctx, "「" + message + "」", w * 0.68);
      var startY = 430 - (lines.length - 1) * 28;
      lines.forEach(function (line, idx) {
        ctx.fillText(line, w / 2, startY + idx * 64);
      });

      ctx.fillStyle = "#8A8780";
      ctx.font = '24px "Noto Sans TC", "PingFang TC", sans-serif';
      ctx.fillText(signer ? signer : "匿名", w / 2, 640);
      ctx.fillText("我的竹願 · 2026・竹山", w / 2, 680);

      /* footer */
      ctx.fillStyle = "#3A4A38";
      ctx.font = '22px "Noto Serif TC", serif';
      ctx.fillText(cfg.wishCard.hashtag || "#竹山開飯了", w / 2, 780);

      ctx.fillStyle = "#8A8780";
      ctx.font = '20px "Noto Sans TC", sans-serif';
      ctx.fillText("hoyao.com/zhushan", w / 2 - 40, 860);
      ctx.fillText("竹語・竹願・歸土", w / 2 - 40, 896);

      if (qrImg) {
        var qs = 88;
        ctx.drawImage(qrImg, w / 2 + 150, 820, qs, qs);
      }
    }

    return loadQrImage().then(function (qr) {
      if (document.fonts && document.fonts.ready) {
        return document.fonts.ready.then(function () {
          paint(qr);
        });
      }
      paint(qr);
    });
  }

  function canvasToFile(canvas) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        resolve(new File([blob], "zhushan-wish.png", { type: "image/png" }));
      }, "image/png");
    });
  }

  function shareWishCard(canvas) {
    var text = defaultShareText();
    var url = (cfg.wishCard && cfg.wishCard.url) || "https://hoyao.com/zhushan/";

    canvasToFile(canvas).then(function (file) {
      var nav = navigator;
      if (nav.share) {
        var data = { title: "竹山開飯了", text: text, url: url };
        var withFile = { title: data.title, text: data.text, files: [file] };
        var canFiles = nav.canShare && nav.canShare(withFile);
        nav
          .share(canFiles ? withFile : data)
          .then(function () {
            setCardStatus("已開啟系統分享", true);
            track("wish_card_share", { page: "zhushan" });
          })
          .catch(function (err) {
            if (err && err.name === "AbortError") return;
            setCardStatus("可長按儲存圖片後，分享至 IG 限動、Facebook 或 LINE", true);
            downloadWishCard(canvas);
          });
        return;
      }
      setCardStatus("可長按儲存圖片後，分享至 IG 限動、Facebook 或 LINE", true);
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
    /* V5: community challenge in zhushan-participation.js */
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

    var configured = ((cfg.images && cfg.images.process) || []).filter(function (it) {
      return it && it.src && !it.placeholder && isRealSrc(it.src);
    });
    var youtubeId = cfg.video && cfg.video.youtubeId;
    var videoUrl = cfg.video && cfg.video.url;
    var hasYt = youtubeIdSafe(youtubeId);
    var hasMp4 = isSafeHttpUrl(videoUrl);

    function paint(items) {
      if (!items.length && !hasYt && !hasMp4) {
        showSection("process", false);
        return;
      }
      showSection("process", true);
      grid.innerHTML = items
        .map(function (it, idx) {
          var num = escapeHtml(it.id || String(idx + 1).padStart(2, "0"));
          var stage = escapeHtml(it.stage || "");
          var layout = escapeHtml(it.layout || "standard");
          return (
            '<figure class="zs-process-item zs-process-item--' +
            layout +
            '">' +
            '<span class="zs-process-item__num">' +
            num +
            (stage ? "｜" + stage : "") +
            "</span>" +
            '<img src="' +
            escapeHtml(it.src) +
            '" width="' +
            (it.width || 1500) +
            '" height="' +
            (it.height || 1000) +
            '" alt="' +
            escapeHtml(it.alt || it.stage || "") +
            '" loading="lazy" decoding="async">' +
            "<figcaption>" +
            escapeHtml(it.label || "") +
            "</figcaption></figure>"
          );
        })
        .join("");
      paintVideo();
    }

    function paintVideo() {
      var videoWrap = document.getElementById("zs-video");
      if (!videoWrap) return;
      if (hasYt) {
        videoWrap.hidden = false;
        var title = cfg.video.title || "播放影片";
        videoWrap.innerHTML =
          '<button type="button" class="zs-video__poster" id="zs-yt-play"><span>播放「' +
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
      }
    }

    if (!configured.length) {
      paint([]);
      return;
    }

    var pending = configured.length;
    var ok = [];
    configured.forEach(function (it, index) {
      var probe = new Image();
      probe.onload = function () {
        ok[index] = it;
        pending -= 1;
        if (pending === 0) paint(ok.filter(Boolean));
      };
      probe.onerror = function () {
        pending -= 1;
        if (pending === 0) paint(ok.filter(Boolean));
      };
      probe.src = it.src;
    });
  }

  function initVenue() {
    var gallery = document.getElementById("zs-venue-gallery");
    var configured = ((cfg.images && cfg.images.venueGallery) || []).filter(function (it) {
      return it && it.src && !it.placeholder && isRealSrc(it.src);
    });
    var single = cfg.images && cfg.images.venue;
    if (
      !configured.length &&
      single &&
      !single.placeholder &&
      isRealSrc(single.src)
    ) {
      configured = [single];
    }

    function paint(items) {
      var fig = document.getElementById("zs-venue-figure");
      if (fig) fig.hidden = true;
      if (!gallery) return;
      if (!items.length) {
        gallery.innerHTML = "";
        gallery.hidden = true;
        return;
      }
      gallery.hidden = false;
      gallery.innerHTML = items
        .map(function (it) {
          var size = it.size || "large";
          return (
            '<figure class="zs-venue-shot zs-venue-shot--' +
            escapeHtml(size) +
            '">' +
            '<img src="' +
            escapeHtml(it.src) +
            '" width="' +
            (it.width || 1600) +
            '" height="' +
            (it.height || 1200) +
            '" alt="' +
            escapeHtml(it.alt || "") +
            '" loading="lazy" decoding="async">' +
            (it.caption
              ? "<figcaption>" + escapeHtml(it.caption) + "</figcaption>"
              : "") +
            "</figure>"
          );
        })
        .join("");
    }

    if (!configured.length) {
      paint([]);
      return;
    }
    var pending = configured.length;
    var ok = [];
    configured.forEach(function (it, index) {
      var probe = new Image();
      probe.onload = function () {
        ok[index] = it;
        pending -= 1;
        if (pending === 0) paint(ok.filter(Boolean));
      };
      probe.onerror = function () {
        pending -= 1;
        if (pending === 0) paint(ok.filter(Boolean));
      };
      probe.src = it.src;
    });
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
    if (n < 20) {
      return (
        "本次有效回覆 " +
        n +
        " 則。以實際數量與匿名文字為主；屬探索性參與觀察。"
      );
    }
    if (n < 50) {
      return "本次有效回覆 " + n + " 則。初步參與觀察。受訪者自陳。";
    }
    return "本次有效回覆 " + n + " 則。探索性結果，受訪者自陳。";
  }

  function showPercent(n) {
    return isPresentNumber(n) && n >= 20;
  }

  function canSegment(n) {
    return isPresentNumber(n) && n >= 100;
  }

  function seriesOf(raw) {
    if (!raw) return { n: null, items: [] };
    if (Array.isArray(raw)) return { n: null, items: namedCounts(raw) };
    if (typeof raw === "object") {
      var items = namedCounts(raw.items || raw.values || []);
      return {
        n: isPresentNumber(raw.n) ? raw.n : null,
        items: items,
      };
    }
    return { n: null, items: [] };
  }

  function countMarkup(count, n) {
    var html = String(count);
    if (showPercent(n) && n > 0) {
      html +=
        '<span class="zs-obs-pct"> · ' +
        Math.round((count / n) * 100) +
        "%</span>";
    }
    return html;
  }

  function obsBlock(title, sub, inner) {
    if (!inner) return "";
    return (
      '<div class="zs-obs-block"><h3 class="zs-obs-h">' +
      escapeHtml(title) +
      "</h3>" +
      (sub
        ? '<p class="zs-obs-sub">' + escapeHtml(sub) + "</p>"
        : "") +
      inner +
      "</div>"
    );
  }

  /** Bamboo ring marks — concentric circles, not solid dots. */
  function renderRingPlot(items, n) {
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
            countMarkup(it.count, n) +
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
  function renderBambooBars(items, n) {
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
            countMarkup(it.count, n) +
            "</span></li>"
          );
        })
        .join("") +
      "</ol>"
    );
  }

  /** Quiet editorial distribution — large type, not a dashboard. */
  function renderEditorialDist(items, n) {
    if (!items.length) return "";
    var lead = items[0];
    var rest = items.slice(1);
    var html =
      '<p class="zs-obs-leadline"><span class="zs-obs-leadline__t">「' +
      escapeHtml(lead.name) +
      '」</span><span class="zs-obs-leadline__n">' +
      countMarkup(lead.count, n) +
      "</span></p>";
    if (rest.length) {
      html +=
        '<ol class="zs-obs-stack">' +
        rest
          .map(function (it) {
            return (
              "<li><span>" +
              escapeHtml(it.name) +
              "</span><em>" +
              countMarkup(it.count, n) +
              "</em></li>"
            );
          })
          .join("") +
        "</ol>";
    }
    return html;
  }

  function renderTagRank(items, n, limit) {
    var list = items.slice(0, limit || 5);
    if (!list.length) return "";
    return (
      '<ol class="zs-obs-tags">' +
      list
        .map(function (it, idx) {
          return (
            "<li><span>" +
            (idx + 1) +
            "</span>" +
            escapeHtml(it.name) +
            "<em>" +
            countMarkup(it.count, n) +
            "</em></li>"
          );
        })
        .join("") +
      "</ol>"
    );
  }

  function renderWishConstellation(items, title, disclaimer) {
    if (!items.length) return "";
    var marks =
      '<ul class="zs-wish-obs" aria-label="竹願主題觀察">' +
      items
        .slice(0, 4)
        .map(function (it) {
          return (
            '<li class="zs-wish-obs__item"><span class="zs-wish-obs__node" aria-hidden="true"></span><span class="zs-wish-obs__name">' +
            escapeHtml(it.name) +
            '</span><span class="zs-wish-obs__n">' +
            it.count +
            "</span></li>"
          );
        })
        .join("") +
      "</ul>";
    return (
      '<div class="zs-obs-block zs-obs-block--quiet"><h3 class="zs-obs-h">' +
      escapeHtml(title || "竹願裡，看見什麼？") +
      '</h3><p class="zs-obs-disc">' +
      escapeHtml(
        disclaimer ||
          "依目前公開竹願內容整理，屬質性內容觀察。"
      ) +
      "</p>" +
      marks +
      "</div>"
    );
  }

  function buildOutcomesHtml(data) {
    if (!data || typeof data !== "object") return "";
    var html = [];
    var kpis = {};
    if (data.summary && typeof data.summary === "object") {
      Object.keys(data.summary).forEach(function (k) {
        kpis[k] = data.summary[k];
      });
    }
    if (data.kpis && typeof data.kpis === "object") {
      Object.keys(data.kpis).forEach(function (k) {
        if (data.kpis[k] !== null && data.kpis[k] !== undefined) {
          kpis[k] = data.kpis[k];
        }
      });
    }
    var study = data.study || {};
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

    function baseN(series) {
      return isPresentNumber(series.n) ? series.n : nSurvey;
    }

    function pushRank(title, sub, raw, limit) {
      var s = seriesOf(raw);
      var items = s.items.slice(0, limit || 5);
      if (!items.length) return;
      html.push(obsBlock(title, sub, renderBambooBars(items, baseN(s))));
    }

    function pushRings(title, sub, raw, collapse) {
      var s = seriesOf(raw);
      var items = collapse ? collapseNamedCounts(s.items, collapse) : s.items;
      if (!items.length) return;
      html.push(obsBlock(title, sub, renderRingPlot(items, baseN(s))));
    }

    function pushEditorial(title, sub, raw) {
      var s = seriesOf(raw);
      if (!s.items.length) return;
      html.push(obsBlock(title, sub, renderEditorialDist(s.items, baseN(s))));
    }

    function pushTags(title, sub, raw, limit) {
      var s = seriesOf(raw);
      var items = s.items.slice(0, limit || 5);
      if (!items.length) return;
      html.push(obsBlock(title, sub, renderTagRank(items, baseN(s), limit || 5)));
    }

    pushRings(
      "大家原本怎麼認識竹子？",
      "本次參與者對竹材應用的既有認知",
      data.knownApplications
    );
    pushEditorial(
      "原先對竹材應用的了解程度",
      "參與《竹山開飯了》之前，受訪者自陳",
      data.knowledgeBefore
    );
    pushEditorial(
      "參與後，竹材想像有沒有改變？",
      "本次有效回覆，受訪者自陳",
      data.imaginationChange || data.bambooImaginationChange
    );
    pushRank(
      "選擇竹材產品時，大家最在意什麼？",
      "本次參與者最常提到的選擇考量（最多三項）",
      data.purchaseFactors
    );
    pushRank(
      "參與者對新型竹材產品的主要疑慮",
      "本次有效回覆；用於理解測試與溝通優先序，不是市場痛點證明",
      data.concerns || data.bambooConcerns
    );
    pushRank(
      "什麼最能建立材料信任？",
      "本次參與者認為較能增加信任的訊號",
      data.trustSignals
    );
    pushEditorial(
      "價格與性能接近時，是否願意優先選永續材料？",
      "受訪者自陳；不是實際市場支付意願",
      data.sustainablePreference || data.preferSustainableWhenEqual
    );
    pushEditorial(
      "自陳價格接受程度",
      "不是實際市場支付意願，也不是定價證明",
      data.priceTolerance || data.pricePremiumTolerance
    );
    pushEditorial(
      "理念支持與實際採用之間的差距",
      "本次參與者較接近的想法",
      data.sustainabilityAttitudes
    );
    pushEditorial(
      "竹山在地來源是否增加吸引力？",
      "若產品使用竹山／南投竹材，本次回覆的感受",
      data.localOrigin || data.localOriginEffect
    );
    pushTags(
      "參與者期待竹山發展哪些竹材新應用？",
      "本次有效回覆中較常被提到的應用方向",
      data.applications || data.desiredApplications
    );
    pushEditorial(
      "竹山創新期待",
      "是否期待竹山發展更多竹材新應用",
      data.zhushanExpectation
    );

    var regions = seriesOf(data.regions);
    if (regions.items.length) {
      html.push(
        obsBlock(
          "參與從哪裡來",
          "本次參與者來源地區",
          renderRingPlot(collapseNamedCounts(regions.items, 8), baseN(regions))
        )
      );
    }

    var relations = seriesOf(data.relations);
    if (relations.items.length) {
      html.push(
        obsBlock(
          "與竹山的關係",
          "",
          renderRingPlot(relations.items, baseN(relations))
        )
      );
    }

    if (canSegment(nSurvey)) {
      var roles = seriesOf(data.roles);
      if (roles.items.length) {
        html.push(
          obsBlock(
            "受訪者背景",
            "樣本數足夠後才做的初步區分，仍屬 convenience sample",
            renderRingPlot(roles.items, baseN(roles))
          )
        );
      }
    }

    pushEditorial(
      "是否第一次走進這個場域",
      "現場／曾到訪參與者",
      data.firstVisit
    );
    pushRank(
      "最有感的互動",
      "現場／曾到訪參與者",
      data.interactions,
      6
    );
    pushEditorial("再訪意願", "現場／曾到訪參與者，受訪者自陳", data.revisit);
    pushEditorial("推薦意願", "現場／曾到訪參與者，受訪者自陳", data.recommend);
    pushEditorial(
      "線上參與者的實體到訪意願",
      "看到作品後，是否更想實際到竹山看看",
      data.onlineVisitIntent
    );

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

    var voices = (data.voices || [])
      .map(function (it) {
        if (!it) return null;
        if (it.quoteConsent === false) return null;
        var quote = it.quote || it.message;
        if (!quote) return null;
        var meta = it.meta || [it.place, it.relation].filter(Boolean).join("・");
        return { quote: quote, meta: meta };
      })
      .filter(Boolean)
      .slice(0, 6);
    if (voices.length) {
      html.push(
        '<div class="zs-obs-block"><h3 class="zs-obs-h">參與者留下的話</h3>' +
          '<p class="zs-obs-sub">僅收錄已同意匿名引用的文字回覆</p>'
      );
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
      "依目前公開竹願內容進行主題整理；屬質性內容觀察，不是正式問卷研究，也不代表參與人次。";
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

    if (html.length) {
      if (!note && study.disclaimer) note = study.disclaimer;
      if (note) {
        html.unshift('<p class="zs-obs-note">' + escapeHtml(note) + "</p>");
      }
      html.push(
        '<p class="zs-obs-frame">正式參與研究以問卷資料為主要來源。竹願文本另作質性內容觀察。</p>'
      );
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
      root.removeAttribute("aria-busy");
      root.classList.add("is-ready");
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
    loadQrImage();
    initHeroEntrance();
    initHeroMedia();
    initComposer();
    /* V5.1: formal wishes live inside unified Wishes Field */
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
