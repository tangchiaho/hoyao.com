/**
 * 竹山開飯了 V5 — Participation Architecture
 * 竹語 / 竹願 viewport / 短期公開彈幕 / 9:16 cards / Survey / Community
 */
(function () {
  "use strict";

  var cfg = window.ZHUSHAN_CONFIG || {};
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var animOn = cfg.animations && cfg.animations.enabled !== false && !reduceMotion;

  var WISH_MAX = (cfg.wishCard && cfg.wishCard.maxLength) || 70;
  var EPH_MAX =
    (cfg.ephemeral && cfg.ephemeral.maxLength) || 40;
  var EPH_POLL =
    (cfg.ephemeral && cfg.ephemeral.pollMs) || 8000;
  var EPH_VISIBLE =
    (cfg.ephemeral && cfg.ephemeral.maxVisible) || 4;
  var STORY_W = (cfg.wishCard && cfg.wishCard.width) || 1080;
  var STORY_H = (cfg.wishCard && cfg.wishCard.height) || 1920;

  var phrases = [];
  var lastPhrase = "";
  var currentPhrase = "";
  var seenIds = {};
  var qrPromise = null;
  var pollTimer = null;

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

  function isSafeHttpUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
      var parsed = new URL(url, window.location.origin);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (err) {
      return false;
    }
  }

  function loadQr() {
    if (qrPromise) return qrPromise;
    var src =
      (cfg.placeholders && cfg.placeholders.qr) ||
      "/assets/placeholders/zhushan/qr-zhushan.png";
    qrPromise = new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        resolve(null);
      };
      img.src = src;
    });
    return qrPromise;
  }

  function wrapText(ctx, text, maxWidth) {
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

  /* —— Story card painter (9:16) —— */
  function paintStoryCard(canvas, opts) {
    var ctx = canvas.getContext("2d");
    var w = STORY_W;
    var h = STORY_H;
    canvas.width = w;
    canvas.height = h;
    var message = opts.message || "";
    var kind = opts.kind || "wish";
    var footerHint =
      kind === "phrase" ? "掃描帶走你的竹語" : "掃描留下你的竹願";
    var event = cfg.event || {};
    var venueName = event.venueName || "台西客運竹山站・竹青庭人文空間";
    var venueAddress = event.venueAddress || "南投縣竹山鎮中山里菜園路27號";
    var host = event.host || "南投縣青年發展所";
    var guidance = event.guidance || "南投縣政府";

    function paint(qr) {
      ctx.fillStyle = "#F5F3EC";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = "#3A4A38";
      ctx.lineWidth = 1;
      var i;
      for (i = 0; i < 24; i++) {
        ctx.beginPath();
        ctx.moveTo(40 + i * 48, 0);
        ctx.lineTo(-10 + i * 48, h);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.03;
      var g = ctx.createRadialGradient(w * 0.75, h * 0.18, 20, w * 0.75, h * 0.18, 280);
      g.addColorStop(0, "#3A4A38");
      g.addColorStop(1, "rgba(58,74,56,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "#3A4A38";
      ctx.fillStyle = "#3A4A38";
      [[56, 0.2, 1.3], [92, 0.32, 1.6]].forEach(function (stem) {
        ctx.globalAlpha = stem[1];
        ctx.lineWidth = stem[2];
        ctx.beginPath();
        ctx.moveTo(stem[0], h - 80);
        ctx.lineTo(stem[0], 180);
        ctx.stroke();
        [320, 520, 760, 1100, 1400].forEach(function (y) {
          if (y < h - 100) {
            ctx.beginPath();
            ctx.arc(stem[0], y, 2.6, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });
      ctx.restore();

      ctx.strokeStyle = "#D4D1C9";
      ctx.lineWidth = 1;
      ctx.strokeRect(56, 72, w - 112, h - 144);

      ctx.textAlign = "center";
      ctx.fillStyle = "#8A8780";
      ctx.font = '30px "Noto Sans TC", "PingFang TC", sans-serif';
      ctx.fillText("竹山開飯了", w / 2, 220);

      ctx.fillStyle = "#5A5852";
      ctx.font = '34px "Noto Serif TC", "PingFang TC", serif';
      ctx.fillText("竹子重生的永續花園", w / 2, 280);

      ctx.strokeStyle = "#D4D1C9";
      ctx.beginPath();
      ctx.moveTo(w * 0.3, 330);
      ctx.lineTo(w * 0.7, 330);
      ctx.stroke();
      ctx.fillStyle = "#3A4A38";
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(w / 2, 330, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = "#1A1A18";
      ctx.font = '48px "Noto Serif TC", "PingFang TC", serif';
      var lines = wrapText(ctx, "「" + message + "」", w * 0.7);
      var startY = 720 - (lines.length - 1) * 30;
      lines.slice(0, 8).forEach(function (line, idx) {
        ctx.fillText(line, w / 2, startY + idx * 70);
      });

      ctx.fillStyle = "#8A8780";
      ctx.font = '26px "Noto Sans TC", sans-serif';
      ctx.fillText(kind === "phrase" ? "竹語" : "我的竹願", w / 2, 1100);

      ctx.fillStyle = "#5A5852";
      ctx.font = '24px "Noto Sans TC", sans-serif';
      ctx.fillText(venueName, w / 2, 1145);

      ctx.fillStyle = "#8A8780";
      ctx.font = '22px "Noto Sans TC", sans-serif';
      ctx.fillText(venueAddress, w / 2, 1185);

      ctx.font = '20px "Noto Sans TC", sans-serif';
      ctx.fillText("主辦｜" + host, w / 2, 1230);
      ctx.fillText("指導｜" + guidance, w / 2, 1265);

      ctx.fillStyle = "#3A4A38";
      ctx.font = '24px "Noto Serif TC", serif';
      ctx.fillText(cfg.wishCard.hashtag || "#竹山開飯了", w / 2, 1330);

      ctx.fillStyle = "#8A8780";
      ctx.font = '22px "Noto Sans TC", sans-serif';
      ctx.fillText(footerHint, w / 2, 1450);
      ctx.fillText("hoyao.com/zhushan", w / 2, 1490);

      if (qr) {
        ctx.drawImage(qr, w / 2 - 56, 1560, 112, 112);
      }
    }

    return loadQr().then(function (qr) {
      if (document.fonts && document.fonts.ready) {
        return document.fonts.ready.then(function () {
          paint(qr);
        });
      }
      paint(qr);
    });
  }

  function canvasFile(canvas, name) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        resolve(new File([blob], name || "zhushan.png", { type: "image/png" }));
      }, "image/png");
    });
  }

  function downloadCanvas(canvas, filename) {
    var a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = filename || "zhushan.png";
    a.click();
  }

  function shareCanvas(canvas, title, filename) {
    var url = (cfg.wishCard && cfg.wishCard.url) || "https://hoyao.com/zhushan/";
    return canvasFile(canvas, filename).then(function (file) {
      if (navigator.share) {
        var data = { title: title || "竹山開飯了", url: url };
        var withFile = { title: data.title, text: title || "", files: [file] };
        var canFiles = navigator.canShare && navigator.canShare(withFile);
        return navigator
          .share(canFiles ? withFile : data)
          .then(function () {
            return "shared";
          })
          .catch(function (err) {
            if (err && err.name === "AbortError") return "abort";
            downloadCanvas(canvas, filename);
            return "download";
          });
      }
      downloadCanvas(canvas, filename);
      return "download";
    });
  }

  /* —— 竹語 —— */
  function initBambooSpeak() {
    var drawBtn = document.getElementById("zs-draw-phrase");
    var redrawBtn = document.getElementById("zs-redraw-phrase");
    var cardBtn = document.getElementById("zs-phrase-card-btn");
    var textEl = document.getElementById("zs-slip-text");
    var placeholder = document.getElementById("zs-slip-placeholder");
    var slip = document.getElementById("zs-slip");
    var url = cfg.bambooPhrasesUrl || "/assets/data/zhushan-bamboo-phrases.json";

    function reveal(phrase) {
      currentPhrase = phrase;
      if (placeholder) placeholder.hidden = true;
      if (textEl) {
        textEl.hidden = false;
        textEl.textContent = phrase;
        textEl.classList.remove("is-in");
        void textEl.offsetWidth;
        textEl.classList.add("is-in");
      }
      if (slip) {
        slip.classList.remove("is-drawn");
        void slip.offsetWidth;
        slip.classList.add("is-drawn");
      }
      if (redrawBtn) redrawBtn.hidden = false;
      if (cardBtn) cardBtn.hidden = false;
      if (drawBtn) drawBtn.textContent = "再抽一句";
    }

    function draw() {
      if (!phrases.length) return;
      var pool = phrases.filter(function (p) {
        return p !== lastPhrase;
      });
      if (!pool.length) pool = phrases.slice();
      var phrase = pool[Math.floor(Math.random() * pool.length)];
      lastPhrase = phrase;
      reveal(phrase);
      track("bamboo_phrase_draw", { page: "zhushan" });
    }

    fetch(url)
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (data) {
        phrases = (data && data.phrases) || [];
        if (!phrases.length) {
          phrases = ["從竹林到餐桌，再從餐桌回到土地。"];
        }
      })
      .catch(function () {
        phrases = ["從竹林到餐桌，再從餐桌回到土地。"];
      });

    if (drawBtn) drawBtn.addEventListener("click", draw);
    if (redrawBtn) redrawBtn.addEventListener("click", draw);

    var result = document.getElementById("zs-phrase-card-result");
    var canvas = document.getElementById("zs-phrase-card-canvas");
    var preview = document.getElementById("zs-phrase-card-preview");
    var shareBtn = document.getElementById("zs-phrase-card-share");
    var dlBtn = document.getElementById("zs-phrase-card-download");
    var status = document.getElementById("zs-phrase-card-status");

    if (cardBtn) {
      cardBtn.addEventListener("click", function () {
        if (!currentPhrase || !canvas) return;
        paintStoryCard(canvas, { message: currentPhrase, kind: "phrase" }).then(
          function () {
            if (preview) preview.src = canvas.toDataURL("image/png");
            if (result) {
              result.hidden = false;
              result.classList.add("is-ready");
            }
            track("bamboo_phrase_card", { page: "zhushan" });
          }
        );
      });
    }
    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        shareCanvas(canvas, "竹山開飯了｜竹語卡", "zhushan-bamboo-phrase.png").then(
          function (mode) {
            if (status && mode !== "abort") {
              status.hidden = false;
              status.textContent =
                mode === "shared"
                  ? "已開啟系統分享"
                  : "可長按卡片儲存後分享至 IG 限動／Facebook／LINE";
            }
          }
        );
      });
    }
    if (dlBtn) {
      dlBtn.addEventListener("click", function () {
        downloadCanvas(canvas, "zhushan-bamboo-phrase.png");
        if (status) {
          status.hidden = false;
          status.textContent = "已開始下載。也可長按卡片儲存。";
        }
        track("bamboo_phrase_download", { page: "zhushan" });
      });
    }
  }

  /* —— Public ephemeral stage —— */
  function stageEl() {
    return document.getElementById("zs-reaction-stage");
  }

  function preferredMineTop(stage) {
    /* Prefer mid-visible band so own text is immediately readable */
    var used = [];
    stage.querySelectorAll(".zs-danmaku").forEach(function (el) {
      used.push(parseFloat(el.style.top) || 0);
    });
    var candidates = [22, 38, 52, 66, 28, 46];
    var i, j, best = 38, bestGap = -1;
    for (i = 0; i < candidates.length; i++) {
      var y = candidates[i];
      var gap = 100;
      for (j = 0; j < used.length; j++) {
        gap = Math.min(gap, Math.abs(y - used[j]));
      }
      if (gap > bestGap) {
        bestGap = gap;
        best = y;
      }
    }
    return best + (Math.random() * 4 - 2);
  }

  function spawnOnStage(text, opts) {
    opts = opts || {};
    var stage = stageEl();
    if (!stage || !text) return false;
    var active = stage.querySelectorAll(".zs-danmaku");
    var maxVis = Math.max(2, Math.min(4, EPH_VISIBLE || 4));
    while (active.length >= maxVis) {
      var oldest = active[0];
      if (oldest && oldest.parentNode) oldest.parentNode.removeChild(oldest);
      active = stage.querySelectorAll(".zs-danmaku");
    }

    var node = document.createElement("span");
    node.className = "zs-danmaku" + (opts.mine ? " is-mine" : "");
    node.setAttribute("aria-hidden", "true");
    node.textContent = text;

    var mobile = window.matchMedia("(max-width: 600px)").matches;
    if (opts.mine) {
      node.style.top = preferredMineTop(stage) + "%";
      node.style.opacity = "0.92";
      node.style.left = "72%";
      node.style.fontSize = (mobile ? 16 : 19) + "px";
      node.style.zIndex = "3";
    } else {
      /* Passing thoughts: opacity 0.55–0.8, varied y + size */
      node.style.top = 10 + Math.random() * 70 + "%";
      node.style.opacity = String(0.55 + Math.random() * 0.25);
      node.style.left = 100 + Math.random() * 18 + "%";
      node.style.fontSize =
        (mobile ? 13 : 15) + Math.round(Math.random() * (mobile ? 5 : 7)) + "px";
    }
    node.style.setProperty(
      "--zs-rot",
      (Math.random() * 0.4 - 0.2).toFixed(2) + "deg"
    );

    function cleanup() {
      if (node.parentNode) node.parentNode.removeChild(node);
    }

    stage.appendChild(node);

    if (reduceMotion) {
      node.classList.add("is-fade");
      node.addEventListener("animationend", cleanup);
      window.setTimeout(cleanup, opts.mine ? 5200 : 3400);
    } else {
      /* 6–9 sec drift across the field */
      var dur = 6000 + Math.floor(Math.random() * 3001);
      if (opts.mine) dur = Math.min(dur, 7500);
      node.style.setProperty("--zs-dur", dur + "ms");
      if (opts.mine) {
        node.classList.add("is-mine-drift");
      } else {
        node.classList.add("is-drift");
      }
      node.addEventListener("animationend", cleanup);
      window.setTimeout(cleanup, dur + 400);
    }
    return true;
  }

  function ephemeralApi() {
    return (cfg.ephemeralApiUrl || "").trim();
  }

  function postEphemeral(text) {
    var api = ephemeralApi();
    if (!api || !isSafeHttpUrl(api)) {
      return Promise.resolve({ ok: true, localOnly: true });
    }
    var url =
      api +
      (api.indexOf("?") >= 0 ? "&" : "?") +
      "action=post&text=" +
      encodeURIComponent(text);
    return fetch(url, { method: "GET", credentials: "omit", cache: "no-store" })
      .then(function (r) {
        return r.json();
      })
      .catch(function () {
        return { ok: false, error: "network" };
      });
  }

  function fetchEphemeralList() {
    var api = ephemeralApi();
    if (!api || !isSafeHttpUrl(api)) return Promise.resolve([]);
    var url =
      api + (api.indexOf("?") >= 0 ? "&" : "?") + "action=list&_=" + Date.now();
    return fetch(url, { method: "GET", credentials: "omit", cache: "no-store" })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        return (data && data.items) || [];
      })
      .catch(function () {
        return [];
      });
  }

  function ingestPublic(items) {
    if (!items || !items.length) return;
    items
      .slice()
      .reverse()
      .forEach(function (it) {
        if (!it || !it.text || !it.id) return;
        if (seenIds[it.id]) return;
        seenIds[it.id] = true;
        spawnOnStage(it.text, { mine: false });
      });
  }

  function startEphemeralPolling() {
    if (!ephemeralApi()) return;
    fetchEphemeralList().then(function (items) {
      items.forEach(function (it) {
        if (it && it.id) seenIds[it.id] = true;
      });
      /* seed a few without flooding */
      items.slice(0, 3).forEach(function (it) {
        if (it && it.text) spawnOnStage(it.text, { mine: false });
      });
    });
    pollTimer = window.setInterval(function () {
      fetchEphemeralList().then(ingestPublic);
    }, EPH_POLL);
  }

  function announce(msg) {
    var live = document.getElementById("zs-ephemeral-live");
    var status = document.getElementById("zs-ephemeral-status");
    if (live) live.textContent = msg;
    if (status) {
      status.hidden = false;
      status.textContent = msg;
    }
  }


  /* —— Formal wishes layer (static, inside same field) —— */
  var formalItems = [];
  var formalTimer = null;
  var formalIndex = 0;
  var formalRound = [];

  function formalLayer() {
    return document.getElementById("zs-formal-layer");
  }

  function shuffleList(list) {
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

  function nextFormalRound(lastTail) {
    var round = shuffleList(formalItems);
    if (round.length > 1 && lastTail && round[0] === lastTail) {
      var k = 1 + Math.floor(Math.random() * (round.length - 1));
      var t = round[0];
      round[0] = round[k];
      round[k] = t;
    }
    return round;
  }

  function paintFormalBatch(batch, opts) {
    opts = opts || {};
    var layer = formalLayer();
    if (!layer) return;
    var prev = layer.querySelector(".zs-formal__group:not(.is-leaving)");
    if (prev) {
      prev.classList.remove("is-visible");
      prev.classList.add("is-leaving");
      window.setTimeout(function () {
        if (prev.parentNode) prev.parentNode.removeChild(prev);
      }, 650);
    }
    var group = document.createElement("div");
    group.className = "zs-formal__group" + (opts.confirm ? " is-confirm" : "");
    group.innerHTML = batch
      .map(function (item) {
        var msg = typeof item === "string" ? item : item.message;
        return (
          '<blockquote class="zs-formal__wish"><p>「' +
          escapeHtml(msg) +
          "」</p></blockquote>"
        );
      })
      .join("");
    layer.appendChild(group);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        group.classList.add("is-visible");
      });
    });
  }

  function showFormalConfirm(text) {
    paintFormalBatch([text], { confirm: true });
    /* resume rotation after a beat */
    window.setTimeout(function () {
      if (formalItems.length) showNextFormal();
    }, 5000);
  }

  function showNextFormal() {
    if (!formalItems.length) return;
    var size = formalItems.length >= 2 ? 2 : 1;
    if (formalIndex >= formalRound.length) {
      var lastTail =
        formalRound.length ? formalRound[formalRound.length - 1] : null;
      formalRound = nextFormalRound(lastTail);
      formalIndex = 0;
    }
    var batch = [];
    var i;
    for (i = 0; i < size && formalIndex < formalRound.length; i++) {
      batch.push(formalRound[formalIndex]);
      formalIndex += 1;
    }
    if (batch.length) paintFormalBatch(batch);
  }

  function initFormalWishLayer() {
    var url = cfg.staticWishesUrl || "/assets/data/zhushan-wishes.json";
    if (cfg.dataMode !== "static" && cfg.wishesApiUrl) {
      url = cfg.wishesApiUrl;
    }
    fetch(url)
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (data) {
        formalItems = ((data && data.approved) || []).filter(function (w) {
          return w && w.message;
        });
        if (!formalItems.length) return;
        formalRound = nextFormalRound(null);
        formalIndex = 0;
        showNextFormal();
        if (formalItems.length > 1) {
          scheduleFormalRotation();
        }
      })
      .catch(function () {});
  }

  function scheduleFormalRotation() {
    /* Stay 8–12 sec, then crossfade */
    var wait = 8000 + Math.floor(Math.random() * 4001);
    formalTimer = window.setTimeout(function () {
      showNextFormal();
      scheduleFormalRotation();
    }, wait);
  }

  function passThought(text) {
    var clean = String(text || "").trim();
    if (!clean) return;
    if (clean.length > EPH_MAX) clean = clean.slice(0, EPH_MAX);

    /* optimistic within 300ms */
    spawnOnStage(clean, { mine: true });
    announce(
      ephemeralApi()
        ? "已飄過——現場朋友短時間內也可能看到。"
        : "已在你的畫面飄過。（公開彈幕 API 尚未設定）"
    );
    track("passing_thought", { page: "zhushan", action: "ephemeral_sent" });

    postEphemeral(clean).then(function (res) {
      if (res && res.item && res.item.id) seenIds[res.item.id] = true;
      if (res && res.error === "rate_limited") {
        announce("送出稍快，請稍候再試。");
      } else if (res && res.error === "blocked") {
        announce("這句話無法公開飄過。");
      }
    });
  }

  /* —— Wish composer —— */
  function initWishUnit() {
    var input = document.getElementById("zs-thought-input");
    var count = document.getElementById("zs-thought-count");
    var passBtn = document.getElementById("zs-ephemeral-btn");
    var keepBtn = document.getElementById("zs-keep-wish-btn");
    var cardBtn = document.getElementById("zs-to-card-btn");
    var keepStatus = document.getElementById("zs-keep-status");
    var canvas = document.getElementById("zs-card-canvas");
    var preview = document.getElementById("zs-card-preview");
    var result = document.getElementById("zs-card-result");
    var shareBtn = document.getElementById("zs-card-share");
    var dlBtn = document.getElementById("zs-card-download");
    var status = document.getElementById("zs-card-action-status");

    if (input) {
      input.setAttribute("maxlength", String(WISH_MAX));
      if (count) {
        input.addEventListener("input", function () {
          count.textContent = String(input.value.length);
        });
      }
    }

    if (passBtn && input) {
      passBtn.addEventListener("click", function () {
        var text = input.value.trim();
        if (!text) {
          input.focus();
          return;
        }
        passThought(text);
      });
    }

    var lastCardText = "";
    var cardReady = false;

    function updateCardBtnLabel() {
      if (!cardBtn || !input) return;
      var msg = input.value.trim();
      if (!cardReady) {
        cardBtn.textContent = "做成竹願卡";
      } else if (msg && msg === lastCardText) {
        cardBtn.textContent = "查看我的竹願卡";
      } else {
        cardBtn.textContent = "更新竹願卡";
      }
    }

    function scrollToCardResult() {
      if (!result) return;
      result.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }

    if (input) {
      input.addEventListener("input", function () {
        updateCardBtnLabel();
      });
    }

    if (keepBtn) {
      keepBtn.addEventListener("click", function () {
        var formUrl = cfg.googleFormUrl;
        var text = input ? input.value.trim() : "";
        if (!text) {
          if (input) input.focus();
          return;
        }
        /* temporary local confirmation in the shared Wishes Field */
        showFormalConfirm(text);
        if (keepStatus) {
          keepStatus.hidden = false;
          keepStatus.textContent =
            "你的竹願已留下；經整理後，可能出現在竹願中。";
        }
        announce("你的竹願已留下；經整理後，可能出現在竹願中。");
        if (!isSafeHttpUrl(formUrl)) {
          return;
        }
        var url = formUrl;
        var entry = cfg.googleFormWishEntry;
        if (entry && /^entry\.\d+$/.test(entry) && text) {
          url +=
            (url.indexOf("?") >= 0 ? "&" : "?") +
            entry +
            "=" +
            encodeURIComponent(text);
        }
        track("wish_form_open", { page: "zhushan" });
        window.open(url, "_blank", "noopener,noreferrer");
      });
    }

    function makeCard() {
      if (!input || !canvas) return;
      var msg = input.value.trim();
      if (!msg) {
        input.focus();
        return;
      }
      if (cardReady && msg === lastCardText && result && !result.hidden) {
        scrollToCardResult();
        return;
      }
      paintStoryCard(canvas, { message: msg, kind: "wish" }).then(function () {
        if (preview) preview.src = canvas.toDataURL("image/png");
        if (result) {
          result.hidden = false;
          result.classList.remove("is-ready");
          void result.offsetWidth;
          result.classList.add("is-ready");
        }
        lastCardText = msg;
        cardReady = true;
        updateCardBtnLabel();
        track("wish_card_generate", { page: "zhushan" });
        scrollToCardResult();
      });
    }

    if (cardBtn) {
      if (cfg.wishCard && cfg.wishCard.enabled === false) cardBtn.hidden = true;
      else cardBtn.addEventListener("click", makeCard);
    }

    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        shareCanvas(canvas, "竹山開飯了｜竹願卡", "zhushan-wish.png").then(
          function (mode) {
            if (status && mode !== "abort") {
              status.hidden = false;
              status.textContent =
                mode === "shared"
                  ? "已開啟系統分享"
                  : "可長按卡片儲存後分享至 IG 限動／Facebook／LINE";
            }
            if (mode === "shared") track("wish_card_share", { page: "zhushan" });
          }
        );
      });
    }
    if (dlBtn) {
      dlBtn.addEventListener("click", function () {
        downloadCanvas(canvas, "zhushan-wish.png");
        if (status) {
          status.hidden = false;
          status.textContent = "已開始下載。也可長按卡片儲存。";
        }
        track("wish_card_download", { page: "zhushan" });
      });
    }

    var quick = document.getElementById("zs-quick-reactions");
    if (quick) {
      quick.addEventListener("click", function (e) {
        var btn = e.target.closest && e.target.closest("button[data-reaction-id]");
        if (!btn) return;
        var label = (btn.textContent || "").trim();
        if (!label) return;
        if (input) {
          input.value = label;
          if (count) count.textContent = String(label.length);
        }
        passThought(label);
        track("quick_reaction", {
          page: "zhushan",
          reaction_id: btn.getAttribute("data-reaction-id"),
        });
      });
    }
  }

  function initSurvey() {
    var section = document.getElementById("survey");
    var btn = document.getElementById("zs-survey-btn");
    var prize = document.getElementById("zs-survey-prize");
    var rule = document.getElementById("survey-rule");
    var url = (cfg.surveyFormUrl || "").trim();
    if (!section) return;
    if (!isSafeHttpUrl(url)) {
      section.hidden = true;
      if (rule) rule.hidden = true;
      return;
    }
    section.hidden = false;
    if (rule) {
      rule.hidden = false;
      rule.removeAttribute("aria-hidden");
    }
    var prizeText = (cfg.surveyPrizeText || "").trim();
    if (prize) {
      if (prizeText) {
        prize.hidden = false;
        if (/完成問卷/.test(prizeText) || /抽獎/.test(prizeText)) {
          prize.textContent = prizeText;
        } else {
          prize.textContent = "完成問卷可參加" + prizeText + "抽獎";
        }
      } else {
        prize.hidden = true;
      }
    }
    if (btn) {
      if (btn.tagName === "A") {
        btn.href = url;
        btn.target = "_blank";
        btn.rel = "noopener noreferrer";
      }
      btn.addEventListener("click", function () {
        track("survey_open", { page: "zhushan" });
        if (btn.tagName !== "A") {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      });
    }
  }

  function initCommunityChallenge() {
    var hashtagEl = document.getElementById("zs-challenge-hashtag");
    var mentionWrap = document.getElementById("zs-challenge-mention-wrap");
    var mentionEl = document.getElementById("zs-challenge-mention");
    var prize = document.getElementById("zs-challenge-prize");
    var btn = document.getElementById("zs-community-share-btn");

    var hashtag = cfg.communityHashtag || "#竹山開飯了";
    if (hashtagEl) hashtagEl.textContent = hashtag;

    var mention = (cfg.communityMention || "").trim();
    if (mention && mentionWrap && mentionEl) {
      mentionWrap.hidden = false;
      mentionEl.textContent = mention;
    }

    var prizeText = (cfg.communityPrizeText || "").trim();
    if (prize) {
      if (prizeText) {
        prize.hidden = false;
        prize.textContent = prizeText;
      } else prize.hidden = true;
    }

    var formUrl =
      (cfg.communitySubmissionFormUrl || cfg.communityShareFormUrl || "").trim();
    if (btn) {
      if (!isSafeHttpUrl(formUrl)) {
        btn.hidden = true;
      } else {
        btn.hidden = false;
        btn.addEventListener("click", function () {
          track("community_post_submit", { page: "zhushan" });
          window.open(formUrl, "_blank", "noopener,noreferrer");
        });
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadQr();
    initBambooSpeak();
    initWishUnit();
    initFormalWishLayer();
    startEphemeralPolling();
    initSurvey();
    initCommunityChallenge();
  });

  /* Expose for zhushan.js wish-wall boost hook if needed */
  window.__ZS_PARTICIPATION = {
    passThought: passThought,
    paintStoryCard: paintStoryCard,
  };
})();
