/**
 * 竹山開飯了 — 竹語卡 / 竹願卡 PNG 底圖 Canvas 生成器
 * 僅疊加：中央使用者文字 + 動態編號
 */
(function (global) {
  "use strict";

  var CARD_W = 1080;
  var CARD_H = 1920;
  var CONTENT_MAX = 80;
  var MIN_FONT = 32;
  var SERIF =
    '"Noto Serif TC", "Songti TC", "PingFang TC", "PMingLiU", serif';

  var CJK_LEADING_PUNCT = "，。、；：？！）」】》…";
  var CJK_TRAILING_PUNCT = "（「【《";

  var cardTemplates = {
    zhuyu: {
      id: "zhuyu",
      background: "/images/zhushan/zhuyu-card-bg.png",
      width: CARD_W,
      height: CARD_H,
      type: "竹語",
      contentBox: { x: 95, y: 318, width: 888, height: 868 },
      contentPadding: { top: 36, right: 40, bottom: 36, left: 44 },
      numberPosition: { x: 256, y: 1348 },
      textColor: "#3A4530",
      numberColor: "#272722",
      numberFontSize: 38,
      lineHeight: 1.62,
    },
    zhuyuan: {
      id: "zhuyuan",
      background: "/images/zhushan/zhuyuan-card-bg.png",
      width: CARD_W,
      height: CARD_H,
      type: "竹願",
      contentBox: { x: 95, y: 318, width: 800, height: 868 },
      contentPadding: { top: 36, right: 48, bottom: 36, left: 44 },
      numberPosition: { x: 236, y: 1365 },
      textColor: "#352D24",
      numberColor: "#352D24",
      numberFontSize: 38,
      lineHeight: 1.62,
    },
  };

  var bgCache = Object.create(null);
  var fontsReady = null;

  function formatSerial(n) {
    var num = Math.max(1, parseInt(n, 10) || 1);
    return String(num).padStart(3, "0");
  }

  function baseFontSize(len) {
    if (len <= 15) return 64;
    if (len <= 30) return 56;
    if (len <= 45) return 50;
    if (len <= 60) return 44;
    return 38;
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

  function contentInnerBox(template) {
    var box = template.contentBox;
    var pad = template.contentPadding || {};
    return {
      x: box.x + (pad.left || 0),
      y: box.y + (pad.top || 0),
      width: box.width - (pad.left || 0) - (pad.right || 0),
      height: box.height - (pad.top || 0) - (pad.bottom || 0),
    };
  }

  function fitContentTypography(ctx, text, template) {
    var inner = contentInnerBox(template);
    var len = String(text).length;
    var size = baseFontSize(len);
    var min = MIN_FONT;
    var lineRatio = template.lineHeight || 1.62;
    var fitted = null;

    while (size >= min) {
      ctx.font = "400 " + size + "px " + SERIF;
      var lines = wrapTextCJK(ctx, text, inner.width);
      var lineHeight = Math.round(size * lineRatio);
      if (lines.length * lineHeight <= inner.height) {
        fitted = { lines: lines, size: size, lineHeight: lineHeight };
        break;
      }
      size -= 2;
    }

    if (!fitted) {
      return { error: "文字內容過長" };
    }
    return fitted;
  }

  function waitForFonts() {
    if (fontsReady) return fontsReady;
    if (!document.fonts || !document.fonts.load) {
      fontsReady = Promise.resolve();
      return fontsReady;
    }
    fontsReady = Promise.all([
      document.fonts.load('400 64px "Noto Serif TC"'),
      document.fonts.load('400 38px "Noto Serif TC"'),
    ])
      .catch(function () {
        return null;
      })
      .then(function () {
        return document.fonts.ready;
      });
    return fontsReady;
  }

  function loadBackground(src) {
    if (bgCache[src]) return bgCache[src];
    bgCache[src] = new Promise(function (resolve, reject) {
      var img = new Image();
      img.decoding = "async";
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        reject(new Error("無法載入卡片底圖：" + src));
      };
      img.src = src;
    });
    return bgCache[src];
  }

  function resolveTemplate(type) {
    var key = type === "zhuyu" || type === "phrase" ? "zhuyu" : "zhuyuan";
    return cardTemplates[key];
  }

  function drawContent(ctx, text, template) {
    var inner = contentInnerBox(template);
    var fitted = fitContentTypography(ctx, text, template);
    if (fitted.error) return fitted;

    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = template.textColor;
    ctx.font = "400 " + fitted.size + "px " + SERIF;

    var blockH = fitted.lines.length * fitted.lineHeight;
    var startY =
      inner.y + (inner.height - blockH) / 2 + fitted.size * 0.82;

    fitted.lines.forEach(function (line, idx) {
      ctx.fillText(line, inner.x, startY + idx * fitted.lineHeight);
    });
    ctx.restore();
    return { ok: true };
  }

  function drawNumber(ctx, serial, template) {
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = template.numberColor;
    ctx.font =
      "400 " + (template.numberFontSize || 38) + "px " + SERIF;
    ctx.fillText(
      formatSerial(serial),
      template.numberPosition.x,
      template.numberPosition.y
    );
    ctx.restore();
  }

  function cardFilename(type, serial) {
    var template = resolveTemplate(type);
    return template.type + "卡-" + formatSerial(serial) + ".png";
  }

  function renderBambooShareCard(canvas, options) {
    var type = (options && options.type) || "zhuyu";
    var content = String((options && options.content) || "").trim();
    var serial = options && options.number != null ? options.number : 1;
    var template = resolveTemplate(type);

    if (!content) {
      return Promise.reject(new Error("請輸入內容"));
    }
    if (content.length > CONTENT_MAX) {
      return Promise.reject(new Error("文字內容過長"));
    }

    canvas.width = template.width;
    canvas.height = template.height;
    var ctx = canvas.getContext("2d");

    return waitForFonts()
      .then(function () {
        return loadBackground(template.background);
      })
      .then(function (bg) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bg, 0, 0, template.width, template.height);

        var contentResult = drawContent(ctx, content, template);
        if (contentResult.error) {
          throw new Error(contentResult.error);
        }
        drawNumber(ctx, serial, template);
        return { ok: true, template: template, serial: formatSerial(serial) };
      });
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob);
        else reject(new Error("無法產生 PNG"));
      }, "image/png");
    });
  }

  function canvasToFile(canvas, type, serial) {
    return canvasToBlob(canvas).then(function (blob) {
      return new File([blob], cardFilename(type, serial), {
        type: "image/png",
      });
    });
  }

  function downloadCanvas(canvas, type, serial) {
    var a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = cardFilename(type, serial);
    a.click();
  }

  function shareCanvas(canvas, type, serial) {
    var template = resolveTemplate(type);
    var title = "竹山開飯了｜" + template.type + "卡";
    return canvasToFile(canvas, type, serial).then(function (file) {
      if (navigator.share) {
        var withFile = { title: title, files: [file] };
        var canFiles = navigator.canShare && navigator.canShare(withFile);
        if (canFiles) {
          return navigator
            .share(withFile)
            .then(function () {
              return "shared";
            })
            .catch(function (err) {
              if (err && err.name === "AbortError") return "abort";
              downloadCanvas(canvas, type, serial);
              return "download";
            });
        }
      }
      downloadCanvas(canvas, type, serial);
      return "download";
    });
  }

  global.BambooShareCard = {
    templates: cardTemplates,
    maxLength: CONTENT_MAX,
    render: renderBambooShareCard,
    formatSerial: formatSerial,
    filename: cardFilename,
    toBlob: canvasToBlob,
    toFile: canvasToFile,
    download: downloadCanvas,
    share: shareCanvas,
  };
})(window);
