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

  var WISH_MAX = (cfg.wishCard && cfg.wishCard.maxLength) || 40;
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
  var currentPhraseIndex = 0;
  var wishSerialBase = 0;
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
      "/assets/placeholders/zhushan/qr-zhushan.svg";
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

  function cardShareUrl(kind) {
    if (kind === "phrase") {
      return (
        (cfg.bambooCard && cfg.bambooCard.url) ||
        (cfg.wishCard && cfg.wishCard.url) ||
        "https://hoyao.com/zhushan/"
      );
    }
    return (cfg.wishCard && cfg.wishCard.url) || "https://hoyao.com/zhushan/";
  }

  function qrImageFromModel(qr, pixelSize) {
    return new Promise(function (resolve) {
      var moduleCount = qr.getModuleCount();
      var margin = 2;
      var total = moduleCount + margin * 2;
      var cell = Math.max(1, Math.floor(pixelSize / total));
      var size = cell * total;
      var canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#1A1A18";
      var row;
      var col;
      for (row = 0; row < moduleCount; row++) {
        for (col = 0; col < moduleCount; col++) {
          if (qr.isDark(row, col)) {
            ctx.fillRect((col + margin) * cell, (row + margin) * cell, cell, cell);
          }
        }
      }
      var img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        resolve(null);
      };
      img.src = canvas.toDataURL("image/png");
    });
  }

  function createQrImage(url) {
    url = String(url || "").trim();
    if (!url) return Promise.resolve(null);
    if (typeof qrcode === "function") {
      try {
        var qr = qrcode(0, "M");
        qr.addData(url);
        qr.make();
        return qrImageFromModel(qr, 320);
      } catch (err) {
        /* fall through to static asset */
      }
    }
    return loadQr();
  }

  var SHARE = {
    MARGIN_L: 100,
    HERO_MAX_W: 820,
    BOTTOM_TOP: 1480,
    SERIF: '"Noto Serif TC", "Songti TC", "PingFang TC", serif',
    SANS: '"Noto Sans TC", "PingFang TC", "Helvetica Neue", sans-serif',
  };

  var SHARE_COLORS = {
    bg: "#F7F3EC",
    primary: "#26231F",
    secondary: "#736657",
    wishHero: "#5C4A3A",
    phraseAccent: "#5B7A64",
    wishAccent: "#8B6A4A",
    shadowGreen: "#8FA487",
    shadowBrown: "#C9B59A",
    faint: "rgba(115, 102, 87, 0.58)",
    credits: "rgba(115, 102, 87, 0.42)",
    venueShort: "rgba(115, 102, 87, 0.50)",
    creditsFoot: "rgba(115, 102, 87, 0.48)",
  };

  var CJK_LEADING_PUNCT = "，。、；：？！）」】》…";
  var CJK_TRAILING_PUNCT = "（「【《";

  function formatSerial(n) {
    var num = Math.max(1, parseInt(n, 10) || 1);
    var s = String(num);
    while (s.length < 3) s = "0" + s;
    return s;
  }

  function getWishSerial() {
    var base =
      wishSerialBase > 0 ? wishSerialBase : formalItems.length;
    return base + 1;
  }

  function shareCardMeta() {
    var event = cfg.event || {};
    return {
      venueLine:
        "展出地點｜" +
        (event.venueName || "台西客運竹山站・竹青庭人文空間"),
      venueShort: event.venueShort || "南投竹山",
      guidance: event.guidance || "南投縣政府",
      host: event.host || "南投縣青年發展所",
      executor: event.executor || "廣德國際整合行銷有限公司",
    };
  }

  function shareBottomTop(h) {
    return SHARE.BOTTOM_TOP || Math.round(h * 0.77);
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

  function applyCjkKinsoku(lines) {
    var i;
    for (i = 1; i < lines.length; i++) {
      while (lines[i] && CJK_LEADING_PUNCT.indexOf(lines[i][0]) >= 0) {
        lines[i - 1] += lines[i][0];
        lines[i] = lines[i].slice(1);
      }
    }
    for (i = 0; i < lines.length - 1; i++) {
      while (
        lines[i] &&
        lines[i].length &&
        CJK_TRAILING_PUNCT.indexOf(lines[i][lines[i].length - 1]) >= 0
      ) {
        lines[i + 1] = lines[i].slice(-1) + (lines[i + 1] || "");
        lines[i] = lines[i].slice(0, -1);
      }
    }
    return lines.filter(function (l) {
      return l && l.length;
    });
  }

  function wrapTextCJK(ctx, text, maxWidth) {
    return applyCjkKinsoku(wrapText(ctx, text, maxWidth));
  }

  function heroSizeRange(textLen, kind) {
    if (kind === "phrase") {
      if (textLen <= 14) return { min: 88, max: 102 };
      if (textLen <= 22) return { min: 74, max: 88 };
      return { min: 60, max: 74 };
    }
    if (textLen <= 14) return { min: 84, max: 96 };
    if (textLen <= 28) return { min: 68, max: 80 };
    if (textLen <= 35) return { min: 58, max: 66 };
    return { min: 52, max: 62 };
  }

  function shareHeroLineRatio(kind, textLen) {
    if (kind === "wish" && textLen >= 36) return 1.56;
    return 1.48;
  }

  function fitShareCardTypography(ctx, text, maxWidth, maxHeight, kind) {
    var len = String(text).length;
    var range = heroSizeRange(len, kind);
    var size = range.max;
    var min = Math.max(54, range.min);
    if (kind === "wish" && len >= 36) min = 52;
    var lineRatio = shareHeroLineRatio(kind, len);
    var fitted = null;

    while (size >= min) {
      ctx.font = "500 " + size + "px " + SHARE.SERIF;
      var lines = wrapTextCJK(ctx, text, maxWidth);
      var lineHeight = Math.round(size * lineRatio);
      if (lines.length * lineHeight <= maxHeight) {
        fitted = { lines: lines, size: size, lineHeight: lineHeight };
        break;
      }
      size -= 2;
    }

    if (!fitted) {
      size = min;
      ctx.font = "500 " + size + "px " + SHARE.SERIF;
      fitted = {
        lines: wrapTextCJK(ctx, text, maxWidth),
        size: size,
        lineHeight: Math.round(size * lineRatio),
      };
    }
    return fitted;
  }

  function waitForShareCardFonts() {
    if (!document.fonts) return Promise.resolve();
    return Promise.all([
      document.fonts.load('500 94px "Noto Serif TC"'),
      document.fonts.load('400 22px "Noto Sans TC"'),
      document.fonts.load('400 18px "Noto Sans TC"'),
    ])
      .catch(function () {
        return null;
      })
      .then(function () {
        return document.fonts.ready;
      });
  }

  function drawShareCardBackground(ctx, w, h) {
    ctx.fillStyle = SHARE_COLORS.bg;
    ctx.fillRect(0, 0, w, h);
    var wash = ctx.createRadialGradient(
      w * 0.28,
      h * 0.18,
      40,
      w * 0.55,
      h * 0.45,
      h * 0.75
    );
    wash.addColorStop(0, "#FBF8F2");
    wash.addColorStop(1, SHARE_COLORS.bg);
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);
  }

  function drawBambooLeafShadow(ctx, x, y, w, h, rot, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-w * 0.15, 0);
    ctx.quadraticCurveTo(w * 0.35, -h * 0.55, w * 0.85, -h * 0.15);
    ctx.quadraticCurveTo(w * 0.45, h * 0.35, -w * 0.2, h * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawShareCardBamboo(ctx, w, h, kind) {
    var color =
      kind === "phrase" ? SHARE_COLORS.shadowGreen : SHARE_COLORS.shadowBrown;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";

    ctx.globalAlpha = kind === "phrase" ? 0.1 : 0.07;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w * 0.82, -40);
    ctx.lineTo(w * 0.78, h * 0.42);
    ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.9, 20);
    ctx.lineTo(w * 0.86, h * 0.36);
    ctx.stroke();
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.72, 80);
    ctx.lineTo(w * 0.7, h * 0.3);
    ctx.stroke();

    drawBambooLeafShadow(ctx, w * 0.76, h * 0.1, 110, 34, -0.45, color, 0.11);
    drawBambooLeafShadow(ctx, w * 0.88, h * 0.16, 96, 28, 0.25, color, 0.1);
    drawBambooLeafShadow(ctx, w * 0.68, h * 0.2, 88, 26, -0.9, color, 0.08);
    drawBambooLeafShadow(ctx, w * 0.84, h * 0.28, 120, 36, -0.2, color, 0.09);
    drawBambooLeafShadow(ctx, w * 0.94, h * 0.34, 72, 22, 0.55, color, 0.07);

    ctx.globalAlpha = 0.06;
    ctx.lineWidth = 1.5;
    [0.18, 0.28, 0.38].forEach(function (t, idx) {
      ctx.beginPath();
      ctx.moveTo(w * (0.76 + idx * 0.05), h * t);
      ctx.lineTo(w * (0.8 + idx * 0.04), h * (t + 0.04));
      ctx.stroke();
    });

    ctx.restore();
  }

  function drawShareCardWishTag(ctx, w, h) {
    var tagX = w - 184;
    var tagY = 108;
    var tagW = 118;
    var tagH = 468;
    var cx = tagX + tagW / 2;

    ctx.save();
    ctx.fillStyle = "rgba(38, 35, 31, 0.055)";
    ctx.beginPath();
    ctx.ellipse(cx + 10, tagY + tagH + 20, tagW * 0.44, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#A89278";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.quadraticCurveTo(cx + 10, tagY * 0.45, cx - 2, tagY - 6);
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "#C4B29A";
    ctx.beginPath();
    ctx.moveTo(cx + 4, 0);
    ctx.quadraticCurveTo(cx + 14, tagY * 0.42, cx + 2, tagY - 6);
    ctx.stroke();

    var bodyGrad = ctx.createLinearGradient(tagX, tagY, tagX + tagW, tagY + tagH);
    bodyGrad.addColorStop(0, "#EDE2D0");
    bodyGrad.addColorStop(0.45, "#DCCAB0");
    bodyGrad.addColorStop(1, "#C8B092");

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = "#B49A7E";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(tagX + 16, tagY);
    ctx.lineTo(tagX + tagW - 16, tagY);
    ctx.quadraticCurveTo(tagX + tagW, tagY, tagX + tagW, tagY + 20);
    ctx.lineTo(tagX + tagW, tagY + tagH - 24);
    ctx.quadraticCurveTo(tagX + tagW, tagY + tagH, tagX + tagW - 18, tagY + tagH);
    ctx.lineTo(tagX + 18, tagY + tagH);
    ctx.quadraticCurveTo(tagX, tagY + tagH, tagX, tagY + tagH - 24);
    ctx.lineTo(tagX, tagY + 20);
    ctx.quadraticCurveTo(tagX, tagY, tagX + 16, tagY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = SHARE_COLORS.bg;
    ctx.beginPath();
    ctx.arc(cx, tagY + 34, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#A08870";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, tagY + 34, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(160, 136, 112, 0.45)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = "rgba(139, 106, 74, 0.14)";
    ctx.lineWidth = 1;
    var gy;
    for (gy = tagY + 72; gy < tagY + tagH - 36; gy += 18) {
      ctx.beginPath();
      ctx.moveTo(tagX + 18, gy);
      ctx.lineTo(tagX + tagW - 18, gy + (gy % 36 === 0 ? 2 : -1));
      ctx.stroke();
    }

    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(tagX + 14, tagY + 12, 16, tagH - 40);
    ctx.restore();
  }

  function drawShareCardLogo(ctx, x, y) {
    ctx.save();
    ctx.strokeStyle = SHARE_COLORS.primary;
    ctx.fillStyle = SHARE_COLORS.primary;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.arc(x + 20, y, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.8;
    [[20, -12, 10], [14, -10, 8], [26, -11, 9]].forEach(function (stem) {
      ctx.beginPath();
      ctx.moveTo(x + stem[0], y + stem[1]);
      ctx.lineTo(x + stem[0], y + stem[2]);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawShareCardHeader(ctx) {
    var x = SHARE.MARGIN_L;
    drawShareCardLogo(ctx, x, 82);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = SHARE_COLORS.primary;
    ctx.font = "500 28px " + SHARE.SANS;
    ctx.fillText("竹山開飯了", x + 56, 88);
    ctx.fillStyle = SHARE_COLORS.secondary;
    ctx.font = "400 16px " + SHARE.SANS;
    ctx.fillText("竹子重生的永續花園", x + 56, 116);
    ctx.fillStyle = SHARE_COLORS.faint;
    ctx.font = "400 18px " + SHARE.SERIF;
    ctx.fillText("從竹林到餐桌，", x, 176);
    ctx.fillText("再從餐桌回到土地。", x, 202);
  }

  function drawShareCardHero(ctx, w, h, text, kind) {
    var heroTop = 252;
    var serialLineY = shareBottomTop(h) - 118;
    var heroBottom = serialLineY - 56;
    var heroHeight = heroBottom - heroTop;
    var fitted = fitShareCardTypography(
      ctx,
      text,
      SHARE.HERO_MAX_W,
      heroHeight,
      kind
    );

    ctx.textAlign = "left";
    ctx.fillStyle =
      kind === "wish" ? SHARE_COLORS.wishHero : SHARE_COLORS.primary;
    ctx.font = "500 " + fitted.size + "px " + SHARE.SERIF;
    var blockH = fitted.lines.length * fitted.lineHeight;
    var startY = heroTop + (heroHeight - blockH) / 2 + fitted.size * 0.76;
    fitted.lines.forEach(function (line, idx) {
      ctx.fillText(line, SHARE.MARGIN_L, startY + idx * fitted.lineHeight);
    });
    return serialLineY;
  }

  function drawShareCardSerialBlock(ctx, kind, serial, lineY) {
    var accent =
      kind === "phrase" ? SHARE_COLORS.phraseAccent : SHARE_COLORS.wishAccent;
    var label =
      (kind === "phrase" ? "竹語・" : "竹願・") + formatSerial(serial);
    var tagline =
      kind === "phrase" ? "一句竹語，一個想法。" : "一個願望，一份期待。";

    ctx.strokeStyle = "rgba(115, 102, 87, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(SHARE.MARGIN_L, lineY);
    ctx.lineTo(SHARE.MARGIN_L + 92, lineY);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = accent;
    ctx.font = "500 22px " + SHARE.SANS;
    ctx.fillText(label, SHARE.MARGIN_L, lineY + 34);
    ctx.fillStyle = SHARE_COLORS.faint;
    ctx.font = "400 17px " + SHARE.SANS;
    ctx.fillText(tagline, SHARE.MARGIN_L, lineY + 62);
  }

  function drawLocationPin(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = SHARE_COLORS.secondary;
    ctx.beginPath();
    ctx.arc(x, y - 10, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y - 2);
    ctx.lineTo(x - 5, y - 8);
    ctx.lineTo(x + 5, y - 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawShareCardQr(ctx, x, y, qrImg, size) {
    if (!qrImg) return { textX: x, labelY: y + 12, urlY: y + 34 };
    size = size || 92;
    var quiet = 7;
    var box = size + quiet * 2;
    ctx.fillStyle = "#FFFFFF";
    ctx.globalAlpha = 0.94;
    ctx.fillRect(x, y, box, box);
    ctx.globalAlpha = 1;
    ctx.drawImage(qrImg, x + quiet, y + quiet, size, size);
    return {
      textX: x + box + 16,
      labelY: y + quiet + 20,
      urlY: y + quiet + 44,
    };
  }

  function drawShareCardMeta(ctx, w, h, qrImg) {
    var meta = shareCardMeta();
    var x = SHARE.MARGIN_L;
    var blockTop = shareBottomTop(h) + 6;
    var qrY = blockTop + 92;
    var qrPos = drawShareCardQr(ctx, x, qrY, qrImg, 92);

    ctx.textAlign = "left";
    ctx.fillStyle = SHARE_COLORS.secondary;
    ctx.font = "400 16px " + SHARE.SANS;
    ctx.fillText("作品頁", qrPos.textX, qrPos.labelY);
    ctx.fillStyle = SHARE_COLORS.faint;
    ctx.font = "400 15px " + SHARE.SANS;
    ctx.fillText("hoyao.com/zhushan", qrPos.textX, qrPos.urlY);

    var venueY = qrY + 122;
    drawLocationPin(ctx, x + 7, venueY);
    ctx.fillStyle = SHARE_COLORS.secondary;
    ctx.font = "400 17px " + SHARE.SANS;
    wrapText(ctx, meta.venueLine, w - x - 40)
      .slice(0, 2)
      .forEach(function (line, idx) {
        ctx.fillText(line, x + 22, venueY + idx * 24);
      });
    ctx.fillStyle = SHARE_COLORS.venueShort;
    ctx.font = "400 15px " + SHARE.SANS;
    ctx.fillText(meta.venueShort, x + 22, venueY + 52);

    var creditsY = h - 46;
    ctx.fillStyle = SHARE_COLORS.creditsFoot;
    ctx.font = "400 16px " + SHARE.SANS;
    ctx.fillText(
      "指導｜" + meta.guidance + "　主辦｜" + meta.host,
      x,
      creditsY - 18
    );
    ctx.fillText("執行｜" + meta.executor, x, creditsY);
  }

  function drawPhraseShareCard(ctx, w, h, phrase, serial, qr) {
    drawShareCardBackground(ctx, w, h);
    drawShareCardBamboo(ctx, w, h, "phrase");
    drawShareCardHeader(ctx);
    var serialLineY = drawShareCardHero(
      ctx,
      w,
      h,
      String(phrase || "").trim(),
      "phrase"
    );
    drawShareCardSerialBlock(ctx, "phrase", serial, serialLineY);
    drawShareCardMeta(ctx, w, h, qr);
  }

  function drawWishShareCard(ctx, w, h, wishText, serial, qr) {
    drawShareCardBackground(ctx, w, h);
    drawShareCardBamboo(ctx, w, h, "wish");
    drawShareCardWishTag(ctx, w, h);
    drawShareCardHeader(ctx);
    var serialLineY = drawShareCardHero(
      ctx,
      w,
      h,
      String(wishText || "").trim(),
      "wish"
    );
    drawShareCardSerialBlock(ctx, "wish", serial, serialLineY);
    drawShareCardMeta(ctx, w, h, qr);
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
    var serial =
      opts.serial != null
        ? opts.serial
        : kind === "phrase"
          ? currentPhraseIndex || 1
          : getWishSerial();
    var shareUrl = cardShareUrl(kind);

    function paint(qr) {
      if (kind === "phrase") {
        drawPhraseShareCard(ctx, w, h, message, serial, qr);
      } else {
        drawWishShareCard(ctx, w, h, message, serial, qr);
      }
    }

    return createQrImage(shareUrl).then(function (qr) {
      return waitForShareCardFonts().then(function () {
        paint(qr);
      });
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
      var idx = phrases.indexOf(phrase);
      currentPhraseIndex = idx >= 0 ? idx + 1 : 1;
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
        paintStoryCard(canvas, {
          message: currentPhrase,
          kind: "phrase",
          serial: currentPhraseIndex,
        }).then(
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
        wishSerialBase =
          data && typeof data.totalCount === "number"
            ? data.totalCount
            : formalItems.length;
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
    var hint = document.getElementById("zs-thought-hint");

    function updateWishInputUi() {
      if (!input) return;
      var len = input.value.length;
      if (count) count.textContent = String(len);
      if (hint) {
        hint.hidden = !(len >= 32 && len <= 39);
      }
    }

    if (input) {
      input.setAttribute("maxlength", String(WISH_MAX));
      input.addEventListener("input", function () {
        updateWishInputUi();
      });
      updateWishInputUi();
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
      paintStoryCard(canvas, {
        message: msg,
        kind: "wish",
        serial: getWishSerial(),
      }).then(function () {
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
      btn.addEventListener("click", function () {
        track("survey_open", { page: "zhushan" });
        window.open(url, "_blank", "noopener,noreferrer");
      });
    }
  }

  function isAbsoluteHttpUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
      var parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (err) {
      return false;
    }
  }

  function communityFormUrl() {
    return (cfg.communitySubmissionFormUrl || cfg.communityShareFormUrl || "").trim();
  }

  function communityApi() {
    return (cfg.communityApiUrl || "").trim();
  }

  function buildCommunityFormUrl(link) {
    var formUrl = communityFormUrl();
    if (!isSafeHttpUrl(formUrl)) return "";
    var entry = (cfg.googleFormCommunityLinkEntry || "").trim();
    if (!entry || !/^entry\.\d+$/.test(entry) || !link) return formUrl;
    var sep = formUrl.indexOf("?") >= 0 ? "&" : "?";
    return formUrl + sep + entry + "=" + encodeURIComponent(link);
  }

  function postCommunityLink(link) {
    var api = communityApi();
    if (!api || !isSafeHttpUrl(api)) {
      return Promise.resolve({ ok: false, error: "no_api" });
    }
    var url =
      api +
      (api.indexOf("?") >= 0 ? "&" : "?") +
      "action=post&url=" +
      encodeURIComponent(link);
    return fetch(url, { method: "GET", credentials: "omit", cache: "no-store" })
      .then(function (r) {
        return r.json();
      })
      .catch(function () {
        return { ok: false, error: "network" };
      });
  }

  function initCommunityChallenge() {
    var hashtagEl = document.getElementById("zs-challenge-hashtag");
    var mentionWrap = document.getElementById("zs-challenge-mention-wrap");
    var mentionEl = document.getElementById("zs-challenge-mention");
    var prize = document.getElementById("zs-challenge-prize");
    var input = document.getElementById("zs-community-link");
    var note = document.getElementById("zs-community-submit-note");
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

    function showNote(message, isError) {
      if (!note) return;
      note.hidden = false;
      note.textContent = message;
      note.classList.toggle("is-error", !!isError);
    }

    if (btn) {
      btn.addEventListener("click", function () {
        var link = input ? input.value.trim() : "";
        var maxLen = cfg.communityLinkMaxLength || 500;
        var formUrl = communityFormUrl();
        var apiUrl = communityApi();
        var hasApi = isSafeHttpUrl(apiUrl);
        var hasForm = isSafeHttpUrl(formUrl);

        if (!link) {
          showNote("請貼上你的貼文連結。", true);
          if (input) input.focus();
          return;
        }
        if (!isAbsoluteHttpUrl(link)) {
          showNote("請輸入有效的 http 或 https 連結。", true);
          if (input) input.focus();
          return;
        }
        if (link.length > maxLen) {
          showNote("連結過長，請確認是否正確。", true);
          return;
        }
        if (!hasApi && !hasForm) {
          showNote("分享功能即將開放，請稍後再試。", true);
          return;
        }

        btn.disabled = true;
        track("community_post_submit", { page: "zhushan", has_api: hasApi });

        if (hasApi) {
          postCommunityLink(link).then(function (res) {
            btn.disabled = false;
            if (res && res.ok) {
              showNote(
                "已收到你的分享，審核通過後會隨機顯示在「竹山片刻」。",
                false
              );
              if (input) input.value = "";
              return;
            }
            if (hasForm) {
              window.open(buildCommunityFormUrl(link), "_blank", "noopener,noreferrer");
              showNote(
                "請在開啟的表單中確認並送出，審核通過後會顯示在頁面。",
                false
              );
              return;
            }
            showNote("送出失敗，請稍後再試。", true);
          });
          return;
        }

        window.open(buildCommunityFormUrl(link), "_blank", "noopener,noreferrer");
        showNote(
          "請在開啟的表單中確認並送出，審核通過後會顯示在頁面。",
          false
        );
        btn.disabled = false;
      });
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
