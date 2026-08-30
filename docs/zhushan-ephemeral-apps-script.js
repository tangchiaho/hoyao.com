/**
 * 竹山開飯了 — 短期公開彈幕（Passing Thoughts）Apps Script
 *
 * 部署為 Web App（執行身分：我；存取：所有人）後，
 * 把 URL 貼到 zhushan-config.js 的 ephemeralApiUrl。
 *
 * Sheet 建議新增工作表「Passing」，欄位：
 * id | text | created_at | ip_hash
 *
 * 也可自動建立。
 */

var PASSING_SHEET = "Passing";
var TTL_MINUTES = 20;
var MAX_LEN = 40;
var RATE_LIMIT_PER_MIN = 6;
var MAX_RETURN = 40;

var BLOCK_WORDS = [
  "http://",
  "https://",
  "www.",
  ".com",
  "免費領",
  "加LINE",
  "加我",
  "色情",
  "色情片",
  "賭博",
  "賭場",
];

function doGet(e) {
  e = e || { parameter: {} };
  var action = String((e.parameter && e.parameter.action) || "list").toLowerCase();

  if (action === "post") {
    return handlePost_(e.parameter || {});
  }
  return handleList_();
}

function doPost(e) {
  var params = {};
  try {
    if (e.postData && e.postData.contents) {
      var parsed = JSON.parse(e.postData.contents);
      params = parsed || {};
    }
  } catch (err) {
    params = (e && e.parameter) || {};
  }
  if (!params.action) params.action = "post";
  if (String(params.action).toLowerCase() === "list") return handleList_();
  return handlePost_(params);
}

function handleList_() {
  cleanupExpired_();
  var sheet = getPassingSheet_();
  var rows = sheet.getDataRange().getValues();
  var items = [];
  var now = Date.now();
  var ttlMs = TTL_MINUTES * 60 * 1000;

  for (var r = 1; r < rows.length; r++) {
    var text = String(rows[r][1] || "").trim();
    var created = rows[r][2];
    var t = created instanceof Date ? created.getTime() : Date.parse(created);
    if (!text || !t || now - t > ttlMs) continue;
    items.push({
      id: String(rows[r][0] || ""),
      text: text,
      createdAt: Utilities.formatDate(
        new Date(t),
        "Asia/Taipei",
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      ),
    });
  }

  items.sort(function (a, b) {
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });

  return json_({
    ok: true,
    ttlMinutes: TTL_MINUTES,
    items: items.slice(0, MAX_RETURN),
  });
}

function handlePost_(params) {
  var raw = String(params.text || params.message || "").trim();
  if (!raw) return json_({ ok: false, error: "empty" });
  if (raw.length > MAX_LEN) return json_({ ok: false, error: "too_long" });
  if (looksBlocked_(raw)) return json_({ ok: false, error: "blocked" });

  var ip = "";
  try {
    ip = String(Session.getTemporaryActiveUserKey() || "anon");
  } catch (err) {
    ip = "anon";
  }
  if (!allowRate_(ip)) return json_({ ok: false, error: "rate_limited" });

  cleanupExpired_();
  var sheet = getPassingSheet_();
  var id = "P" + Utilities.getUuid().replace(/-/g, "").slice(0, 10);
  var now = new Date();
  sheet.appendRow([id, sanitizeText_(raw), now, hash_(ip)]);

  return json_({
    ok: true,
    item: {
      id: id,
      text: sanitizeText_(raw),
      createdAt: Utilities.formatDate(now, "Asia/Taipei", "yyyy-MM-dd'T'HH:mm:ssXXX"),
    },
    ttlMinutes: TTL_MINUTES,
  });
}

function getPassingSheet_() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(PASSING_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(PASSING_SHEET);
    sheet.appendRow(["id", "text", "created_at", "ip_hash"]);
  }
  return sheet;
}

function cleanupExpired_() {
  var sheet = getPassingSheet_();
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return;
  var ttlMs = TTL_MINUTES * 60 * 1000;
  var now = Date.now();
  for (var r = rows.length - 1; r >= 1; r--) {
    var created = rows[r][2];
    var t = created instanceof Date ? created.getTime() : Date.parse(created);
    if (!t || now - t > ttlMs) {
      sheet.deleteRow(r + 1);
    }
  }
}

function allowRate_(key) {
  var cache = CacheService.getScriptCache();
  var k = "rate_" + hash_(key);
  var n = Number(cache.get(k) || "0");
  if (n >= RATE_LIMIT_PER_MIN) return false;
  cache.put(k, String(n + 1), 60);
  return true;
}

function looksBlocked_(text) {
  var lower = text.toLowerCase();
  for (var i = 0; i < BLOCK_WORDS.length; i++) {
    if (lower.indexOf(BLOCK_WORDS[i].toLowerCase()) !== -1) return true;
  }
  if (/(.)\1{6,}/.test(text)) return true;
  if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(text)) return true;
  return false;
}

function sanitizeText_(text) {
  return String(text)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_LEN);
}

function hash_(s) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s))
  ).slice(0, 16);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
