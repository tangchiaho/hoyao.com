/**
 * 竹山開飯了 — 02_參與調查 聚合範例
 *
 * 讀取「竹山開飯了_專案資料庫」的 02_參與調查，
 * 輸出可供 zhushan-outcomes.json 對照的聚合結果。
 *
 * 不會輸出：姓名、Email、手機、年齡區間。
 * 受訪者背景僅在有效樣本 N >= 100 時才進入 roles。
 * 引言只收 quoteConsent = TRUE 的文字。
 *
 * 使用：
 * 1. 開該 Google Sheet → 擴充功能 → Apps Script
 * 2. 貼上本檔，確認 SHEET_NAME
 * 3. 執行 aggregateResearch()，從紀錄查看 JSON
 * 4. 人工核對後，才把需要公開的區塊寫入網站 JSON
 *
 * 不要把此輸出直接當成市場驗證。
 */

var SHEET_NAME = "02_參與調查";
var SEGMENT_AT = 100;

var COL = {
  id: "編號",
  date: "日期",
  participationMode: "參與方式",
  region: "來源地區",
  sourceChannel: "來源渠道",
  zhushanRelation: "與竹山關係",
  respondentRole: "受訪者背景",
  ageRange: "年齡區間",
  firstVenueVisit: "第一次到場",
  bambooKnowledgeBefore: "原先竹材了解程度",
  knownBambooApplications: "原先知道的竹材應用",
  bambooImaginationChange: "參與後材料想像改變",
  desiredApplications: "有興趣應用",
  purchaseFactors: "選擇考量",
  bambooConcerns: "新材料疑慮",
  trustSignals: "信任因素",
  preferSustainableWhenEqual: "價格性能接近時採用意願",
  pricePremiumTolerance: "價格溢價接受程度",
  sustainabilityPurchaseAttitude: "永續採購態度",
  localOriginEffect: "在地來源影響",
  zhushanInnovationExpectation: "竹山創新期待",
  mostImpactfulInteraction: "最有感互動",
  visitIntentAfterOnline: "線上後到訪意願",
  revisitIntent: "再訪意願",
  recommendIntent: "推薦意願",
  futureExpectation: "未來期待",
  openFeedback: "自由留言",
  researchConsent: "同意研究使用",
  quoteConsent: "同意引用原話",
  valid: "有效樣本",
  dataKind: "資料性質",
};

function aggregateResearch() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log("missing sheet");
    return;
  }
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) {
    Logger.log(JSON.stringify(emptyPayload(0)));
    return;
  }
  var headers = rows[0].map(function (h) {
    return String(h).trim();
  });
  var col = {};
  headers.forEach(function (h, i) {
    col[h] = i;
  });

  var valid = [];
  for (var r = 1; r < rows.length; r++) {
    var row = rows[r];
    if (!isValidRow(row, col)) continue;
    valid.push(row);
  }

  var n = valid.length;
  var payload = emptyPayload(n);

  function bumpMulti(bucket, raw) {
    splitCell(raw).forEach(function (v) {
      bump(bucket, v);
    });
  }

  valid.forEach(function (row) {
    bump(payload._regions, val(row, col[COL.region]));
    bump(payload._relations, val(row, col[COL.zhushanRelation]));
    if (n >= SEGMENT_AT) {
      bump(payload._roles, val(row, col[COL.respondentRole]));
    }
    bump(payload._knowledge, val(row, col[COL.bambooKnowledgeBefore]));
    bumpMulti(payload._knownApps, val(row, col[COL.knownBambooApplications]));
    bump(payload._imagine, val(row, col[COL.bambooImaginationChange]));
    bumpMulti(payload._apps, val(row, col[COL.desiredApplications]));
    bumpMulti(payload._factors, val(row, col[COL.purchaseFactors]));
    bumpMulti(payload._concerns, val(row, col[COL.bambooConcerns]));
    bumpMulti(payload._trust, val(row, col[COL.trustSignals]));
    bump(payload._prefer, val(row, col[COL.preferSustainableWhenEqual]));
    bump(payload._price, val(row, col[COL.pricePremiumTolerance]));
    bump(payload._attitude, val(row, col[COL.sustainabilityPurchaseAttitude]));
    bump(payload._local, val(row, col[COL.localOriginEffect]));
    bump(payload._expect, val(row, col[COL.zhushanInnovationExpectation]));

    var mode = val(row, col[COL.participationMode]);
    if (isOnsiteMode(mode)) {
      bump(payload._first, val(row, col[COL.firstVenueVisit]));
      bump(payload._interact, val(row, col[COL.mostImpactfulInteraction]));
      bump(payload._revisit, val(row, col[COL.revisitIntent]));
      bump(payload._recommend, val(row, col[COL.recommendIntent]));
    }
    if (isOnlineMode(mode)) {
      bump(payload._onlineVisit, val(row, col[COL.visitIntentAfterOnline]));
    }

    if (isTrue(row[col[COL.quoteConsent]])) {
      var quotes = [
        val(row, col[COL.futureExpectation]),
        val(row, col[COL.openFeedback]),
      ].filter(Boolean);
      quotes.forEach(function (q) {
        payload.voices.push({
          quote: q,
          quoteConsent: true,
          relation: val(row, col[COL.zhushanRelation]),
        });
      });
    }
  });

  var out = {
    study: emptyPayload(n).study,
    summary: {
      participants: null,
      wishes: null,
      regions: toList(payload._regions).length || null,
      validSurveys: n || null,
    },
    regions: toList(payload._regions),
    relations: toList(payload._relations),
    roles: n >= SEGMENT_AT ? toList(payload._roles) : [],
    knowledgeBefore: toList(payload._knowledge),
    knownApplications: toList(payload._knownApps),
    imaginationChange: toList(payload._imagine),
    applications: toList(payload._apps),
    purchaseFactors: toList(payload._factors),
    concerns: toList(payload._concerns),
    trustSignals: toList(payload._trust),
    sustainablePreference: toList(payload._prefer),
    priceTolerance: toList(payload._price),
    sustainabilityAttitudes: toList(payload._attitude),
    localOrigin: toList(payload._local),
    zhushanExpectation: toList(payload._expect),
    firstVisit: toList(payload._first),
    interactions: toList(payload._interact),
    revisit: toList(payload._revisit),
    recommend: toList(payload._recommend),
    onlineVisitIntent: toList(payload._onlineVisit),
    voices: payload.voices.slice(0, 6),
  };

  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

function emptyPayload(n) {
  return {
    study: {
      title: "竹材新應用與地方參與觀察",
      titleEn: "Bamboo Applications & Local Participation Study",
      subtitle: "《竹山開飯了》參與研究",
      kind: "exploratory participation study",
      sample: "convenience sample",
    },
    n: n,
    voices: [],
    _regions: {},
    _relations: {},
    _roles: {},
    _knowledge: {},
    _knownApps: {},
    _imagine: {},
    _apps: {},
    _factors: {},
    _concerns: {},
    _trust: {},
    _prefer: {},
    _price: {},
    _attitude: {},
    _local: {},
    _expect: {},
    _first: {},
    _interact: {},
    _revisit: {},
    _recommend: {},
    _onlineVisit: {},
  };
}

function isValidRow(row, col) {
  var kind = val(row, col[COL.dataKind]).toLowerCase();
  if (kind === "test" || kind === "invalid") return false;
  if (col[COL.valid] != null && String(val(row, col[COL.valid])) !== "") {
    return isTrue(row[col[COL.valid]]);
  }
  return isTrue(row[col[COL.researchConsent]]);
}

function isOnsiteMode(mode) {
  return (
    mode.indexOf("現場") >= 0 ||
    mode === "onsite" ||
    mode.indexOf("曾到過") >= 0 ||
    mode === "visited_online"
  );
}

function isOnlineMode(mode) {
  return (
    mode === "online" ||
    mode === "shared" ||
    mode.indexOf("線上") >= 0 ||
    mode.indexOf("分享") >= 0
  );
}

function val(row, index) {
  if (index == null) return "";
  var v = row[index];
  return v == null ? "" : String(v).trim();
}

function isTrue(v) {
  if (v === true) return true;
  var s = String(v).trim().toUpperCase();
  return s === "TRUE" || s === "1" || s === "YES" || s === "是";
}

function splitCell(raw) {
  if (!raw) return [];
  return String(raw)
    .split(/[,，;；、]/)
    .map(function (s) {
      return s.trim();
    })
    .filter(Boolean);
}

function bump(obj, key) {
  if (!key) return;
  obj[key] = (obj[key] || 0) + 1;
}

function toList(obj) {
  return Object.keys(obj)
    .map(function (name) {
      return { name: name, count: obj[name] };
    })
    .sort(function (a, b) {
      return b.count - a.count;
    });
}
