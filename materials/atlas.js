(function (global) {
  "use strict";

  var STORAGE_KEY = "hoyaoAtlasRequests";
  var PASSPORT_URL = "https://hoyao.com/materials/passport/bamboo-powder-demo.html";

  var items = [
    {
      id: "bamboo-residue",
      name: "竹加工剩料",
      place: "竹山",
      status: "已有實物",
      img: "assets/bamboo-processing-residue.webp",
      alt: "竹加工剩料材料形態示意：竹屑與竹絲堆疊質感",
      type: "竹屑、竹絲",
      detail: "可依用途洽詢破碎或篩分。超細竹粉另案確認。",
      filter: "竹材",
    },
    {
      id: "tea-byproduct",
      name: "茶副產物",
      place: "名間、魚池",
      status: "規劃取樣",
      img: "assets/tea-byproduct.webp",
      alt: "茶副產物材料形態示意：茶梗與篩分粉",
      type: "茶梗、篩分粉",
      detail: "取樣時記錄含水與潔淨度，依用途評估乾燥條件。",
      filter: "茶副產物",
    },
    {
      id: "water-bamboo",
      name: "茭白筍殼",
      place: "埔里",
      status: "規劃取樣",
      img: "assets/water-bamboo-sheath.webp",
      alt: "茭白筍殼材料形態示意：筍殼與切碎料",
      type: "筍殼、切碎料",
      detail: "規劃乾燥與切碎試作，記錄處理時間及損耗。",
      filter: "筍殼",
    },
  ];

  var processOptions = [
    "找料與規格評估",
    "去雜、乾燥",
    "研磨、篩分",
    "纖維分離、混料",
    "炭材轉化評估",
    "造粒、成型",
    "分裝、密封",
  ];

  function loadRecords() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (err) {
      return [];
    }
  }

  function saveRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function rows(pairs) {
    return (
      '<div class="rows">' +
      pairs
        .map(function (pair) {
          return (
            '<div class="row"><strong>' +
            escapeHtml(pair[0]) +
            "</strong><div>" +
            pair[1] +
            "</div></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function processSelectHtml(selected) {
    return (
      '<label>希望和曜協助的工序<select name="process">' +
      processOptions
        .map(function (opt) {
          return (
            "<option" +
            (opt === selected ? " selected" : "") +
            ">" +
            escapeHtml(opt) +
            "</option>"
          );
        })
        .join("") +
      "</select></label>"
    );
  }

  function AtlasUI(options) {
    this.root = options.root || document;
    this.sheet = this.root.querySelector("#sheet");
    this.dlg = this.root.querySelector("#dlg");
    this.mode = options.mode || "catalog";
    this.assetBase = options.assetBase || "";
    this.records = loadRecords();
  }

  AtlasUI.prototype.assetUrl = function (path) {
    if (!path) return "";
    if (/^(https?:|data:|\/)/.test(path)) return path;
    return (this.assetBase || "") + path;
  };

  AtlasUI.prototype.show = function (html) {
    if (!this.sheet || !this.dlg) return;
    this.sheet.innerHTML = html;
    if (!this.dlg.open) this.dlg.showModal();
    this.dlg.scrollTop = 0;
  };

  AtlasUI.prototype.close = function () {
    if (this.dlg && this.dlg.open) this.dlg.close();
  };

  AtlasUI.prototype.bindClose = function () {
    var self = this;
    var closeBtn = this.root.querySelector(".close");
    if (closeBtn) closeBtn.onclick = function () { self.close(); };
  };

  AtlasUI.prototype.detail = function (index) {
    var m = items[index];
    var self = this;
    this.show(
      "<small>材料資料</small><h2>" +
        escapeHtml(m.name) +
        '</h2><img alt="' +
        escapeHtml(m.alt) +
        '" src="' +
        escapeHtml(this.assetUrl(m.img)) +
        '">' +
        rows([
          ["料源地區", escapeHtml(m.place)],
          ["材料型態", escapeHtml(m.type)],
          ["目前進度", escapeHtml(m.status)],
          ["處理方向", escapeHtml(m.detail)],
        ]) +
        '<p class="note">材料形態圖為示意標示，供應規格依實際批次確認。</p>' +
        '<button class="cta" id="inquire">洽詢這項材料</button>'
    );
    this.root.querySelector("#inquire").onclick = function () {
      self.form({ material: m.name });
    };
  };

  AtlasUI.prototype.passportSummary = function () {
    return rows([
      ["示範標示", "試單需求示範"],
      ["需求規格", "2000 目，50 公斤（客戶需求）"],
      ["交付狀態", "試單尚未交付"],
      ["批次編號", "交付批次尚待建立"],
      ["來源與加工", "收料地區、日期、處理履歷與工序版本待建檔"],
      ["品質佐證", "取樣日期、量測方式及適用批次待建檔"],
      ["保存與環境", "倉儲溫濕度與材料含水率分開記錄；目前尚無建檔資料"],
      ["粒徑與含水率", "待確認驗收方式與實測結果"],
      ["包裝", "袋材、袋重與密封方式待確認"],
    ]);
  };

  AtlasUI.prototype.showPassportDialog = function () {
    var self = this;
    this.show(
      '<span class="badge">試單需求示範</span><small>MATERIAL PASSPORT</small><h2>竹粉批次護照示範</h2>' +
        this.passportSummary() +
        '<p class="note">批次編號、來源、實測值、檢測報告及保存資料依建檔狀態呈現，未自行補數字。</p>' +
        '<a class="cta" href="passport/bamboo-powder-demo.html">開啟護照示範頁</a>' +
        '<button class="cta outline" id="reuse-spec">沿用規格洽詢</button>'
    );
    this.root.querySelector("#reuse-spec").onclick = function () {
      self.reuseSpecForm();
    };
  };

  AtlasUI.prototype.reuseSpecForm = function () {
    this.form({
      title: "沿用規格洽詢",
      intro: "已帶入竹粉示範規格。可修改用途、加工需求、數量與交期。",
      material: "竹粉",
      spec: "目標粒徑：2000 目；驗收方式待確認",
      qty: "50 公斤",
      process: "研磨、篩分",
      badge: "試單需求示範",
    });
  };

  AtlasUI.prototype.form = function (opts) {
    opts = opts || {};
    var self = this;
    var title = opts.title || "提出找料需求";
    var badge = opts.badge
      ? '<span class="badge">' + escapeHtml(opts.badge) + "</span>"
      : "";
    var intro =
      opts.intro ||
      "示範流程：工單只保存在此瀏覽器。正式收件請走「正式洽詢」並同意留下聯絡資料。";

    this.show(
      badge +
        "<small>CUSTOM SOURCING</small><h2>" +
        escapeHtml(title) +
        '</h2><p class="note">' +
        escapeHtml(intro) +
        "</p><form id='atlas-form'>" +
        "<label>材料名稱<input name='material' required></label>" +
        "<label>用途與規格<textarea name='spec' required placeholder='例如：複材試作，需確認粒徑分布與含水率'></textarea></label>" +
        processSelectHtml(opts.process || processOptions[0]) +
        "<label>需求數量<input name='qty' required placeholder='例如：試樣 5 公斤'></label>" +
        "<label>預計交期（選填）<input name='due' type='date'></label>" +
        '<button class="cta" type="submit">建立示範工單</button>' +
        '<p class="note"><a href="/materials/inquire.html">改走正式洽詢收件 ↗</a></p></form>'
    );

    var f = this.root.querySelector("#atlas-form");
    f.material.value = opts.material || "";
    f.spec.value = opts.spec || "";
    f.qty.value = opts.qty || "";
    if (opts.due) f.due.value = opts.due;

    f.onsubmit = function (e) {
      e.preventDefault();
      var submitBtn = f.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      var rec = Object.fromEntries(new FormData(f));
      rec.id = "HY-" + Date.now().toString(36).toUpperCase();
      rec.createdAt = new Date().toISOString();
      rec.status = "示範工單｜需求已記錄";
      rec.source = opts.source || "atlas-demo";
      self.records = loadRecords();
      self.records.unshift(rec);
      var msg = "已建立示範工單";
      try {
        saveRecords(self.records);
      } catch (err) {
        msg += "（僅本次開啟可查看）";
      }
      self.tracking(msg, rec.id);
    };
  };

  AtlasUI.prototype.tracking = function (title, highlightId) {
    this.records = loadRecords();
    this.show("<small>REQUEST TRACKING</small><h2>" + escapeHtml(title || "我的工單") + "</h2>");
    if (!this.records.length) {
      var self = this;
      this.sheet.insertAdjacentHTML(
        "beforeend",
        '<p>此瀏覽器尚無示範工單。</p><button class="cta" id="first">提出找料需求</button>'
      );
      this.root.querySelector("#first").onclick = function () {
        self.form();
      };
      return;
    }

    this.records.forEach(function (r) {
      var box = document.createElement("div");
      box.className = "record";
      if (highlightId && r.id === highlightId) {
        box.style.outline = "2px solid #ab7035";
      }
      var a = document.createElement("strong");
      a.textContent = r.material + " · " + r.qty;
      box.append(a);
      [
        r.id + " ｜ " + (r.status || "需求已記錄"),
        r.spec,
        r.process,
        r.due ? "預計交期 " + r.due : "",
      ]
        .filter(Boolean)
        .forEach(function (t) {
          var d = document.createElement("div");
          d.textContent = t;
          box.append(d);
        });
      this.sheet.append(box);
    }, this);

    this.sheet.insertAdjacentHTML(
      "beforeend",
      '<p class="note">預覽流程：需求記錄 → 規格確認 → 加工／備樣 → 寄樣／交付。正式服務啟用後由承辦人更新進度。</p>'
    );
  };

  AtlasUI.prototype.renderCatalog = function () {
    var self = this;
    var cards = this.root.querySelector("#cards");
    if (!cards) return;

    items.forEach(function (m, i) {
      var b = document.createElement("button");
      b.className = "card";
      b.type = "button";
      b.dataset.filter = m.filter;
      b.innerHTML =
        '<img alt="' +
        escapeHtml(m.alt) +
        '" src="' +
        escapeHtml(self.assetUrl(m.img)) +
        '" width="560" height="560" loading="lazy"><div><small>' +
        escapeHtml(m.place) +
        "</small><h3>" +
        escapeHtml(m.name) +
        " <span>↗</span></h3>" +
        escapeHtml(m.status) +
        "</div>";
      b.onclick = function () {
        self.detail(i);
      };
      cards.append(b);
    });

    var search = this.root.querySelector("#search");
    var selected = -1;
    var filterLabels = ["全部材料", "竹材", "茶副產物", "筍殼"];

    function filterCards() {
      var count = 0;
      var q = (search.value || "").trim();
      cards.querySelectorAll(".card").forEach(function (card, i) {
        var m = items[i];
        var hay = [m.name, m.place, m.type, m.detail, m.status].join(" ");
        var matchFilter = selected === -1 || selected === i;
        var matchSearch = !q || hay.includes(q);
        card.hidden = !(matchFilter && matchSearch);
        if (!card.hidden) count += 1;
      });
      self.root.querySelector("#empty").hidden = count !== 0;
      self.root.querySelectorAll("#filters button").forEach(function (b, i) {
        b.setAttribute("aria-pressed", String(selected === i - 1));
      });
    }

    var filters = this.root.querySelector("#filters");
    filterLabels.forEach(function (label, i) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.onclick = function () {
        selected = i - 1;
        filterCards();
      };
      filters.append(button);
    });
    search.oninput = filterCards;
    filterCards();
  };

  function buildQrDataUrl(text) {
    if (typeof qrcode !== "function") return "";
    var qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    return qr.createDataURL(6, 2);
  }

  function mountQrPanel(container, url) {
    if (!container) return;
    var dataUrl = buildQrDataUrl(url);
    container.innerHTML =
      "<small>SAMPLE QR</small><strong style='display:block;margin-top:4px'>列印貼在展示樣品旁</strong>" +
      '<p class="note">掃描後開啟竹粉護照示範頁（公開示範資料）。</p>' +
      (dataUrl
        ? '<img alt="竹粉護照示範網址 QR Code" width="168" height="168" src="' +
          dataUrl +
          '">'
        : "<p class='note'>QR 產生失敗，請直接開啟下方網址。</p>") +
      '<div class="note">' +
      escapeHtml(url) +
      "</div>" +
      (dataUrl
        ? '<a class="cta" id="qr-download" download="hoyao-bamboo-powder-passport-qr.png" href="' +
          dataUrl +
          '">下載 QR Code</a>'
        : "") +
      '<a class="cta outline" href="' +
      escapeHtml(url) +
      '">開啟護照網址</a>';
  }

  global.HoyaoAtlas = {
    items: items,
    PASSPORT_URL: PASSPORT_URL,
    AtlasUI: AtlasUI,
    loadRecords: loadRecords,
    saveRecords: saveRecords,
    buildQrDataUrl: buildQrDataUrl,
    mountQrPanel: mountQrPanel,
    escapeHtml: escapeHtml,
    rows: rows,
  };
})(window);
