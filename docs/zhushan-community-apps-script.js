/**
 * 竹山開飯了 — 社群分享（Community Moments）Apps Script
 *
 * 部署為 Web App（執行身分：我；存取：所有人）後，
 * 把 URL 貼到 assets/js/zhushan-config.js 的 communityApiUrl。
 *
 * Sheet 建議新增工作表「Community」，欄位：
 * id | url | platform | handle | text | image | approved | created_at
 *
 * 流程：
 * 1. 訪客在網站貼連結 → action=post（approved 預設 FALSE）
 * 2. 你人工審核 Sheet，補 platform / handle / text / image，設 approved=TRUE
 * 3. 網站 action=list 只回 approved=TRUE，前端隨機顯示
 */

var COMMUNITY_SHEET = "Community";
var MAX_URL_LEN = 500;
var RATE_LIMIT_PER_MIN = 4;
var MAX_RETURN = 40;

function doGet(e) {
  e = e || { parameter: {} };
  var action = String((e.parameter && e.parameter.action) || "list").toLowerCase();
  if (action === "post") return handlePost_(e.parameter || {});
  return handleList_();
}

function doPost(e) {
  var params = {};
  try {
    if (e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents) || {};
    }
  } catch (err) {
    params = (e && e.parameter) || {};
  }
  if (!params.action) params.action = "post";
  if (String(params.action).toLowerCase() === "list") return handleList_();
  return handlePost_(params);
}

function handleList_() {
  var sheet = getCommunitySheet_();
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return json_({ items: [] });

  var col = headerMap_(rows[0]);
  var items = [];

  for (var r = 1; r < rows.length; r++) {
    var row = rows[r];
    if (!isTrue(row[col.approved])) continue;
    var url = val(row, col.url);
    if (!url || !isHttpUrl_(url)) continue;
    items.push({
      platform: val(row, col.platform),
      handle: val(row, col.handle),
      text: val(row, col.text),
      url: url,
      image: val(row, col.image),
      approved: true,
    });
  }

  return json_({ items: items.slice(0, MAX_RETURN) });
}

function handlePost_(params) {
  var url = String(params.url || "").trim();
  if (!url) return json_({ ok: false, error: "empty" });
  if (url.length > MAX_URL_LEN) return json_({ ok: false, error: "too_long" });
  if (!isHttpUrl_(url)) return json_({ ok: false, error: "invalid_url" });

  var ip = "";
  try {
    ip = String(Session.getTemporaryActiveUserKey() || "anon");
  } catch (err) {
    ip = "anon";
  }
  if (!allowRate_(ip)) return json_({ ok: false, error: "rate_limited" });

  var sheet = getCommunitySheet_();
  var id = "C" + Utilities.getUuid().replace(/-/g, "").slice(0, 10);
  var now = new Date();
  sheet.appendRow([
    id,
    url,
    "",
    "",
    "",
    "",
    false,
    now,
  ]);

  return json_({
    ok: true,
    item: { id: id, url: url, approved: false },
  });
}

function getCommunitySheet_() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(COMMUNITY_SHEET);
  if (sheet) return sheet;

  sheet = ss.insertSheet(COMMUNITY_SHEET);
  sheet.appendRow([
    "id",
    "url",
    "platform",
    "handle",
    "text",
    "image",
    "approved",
    "created_at",
  ]);
  return sheet;
}

function headerMap_(headers) {
  var col = {};
  headers.forEach(function (h, i) {
    col[String(h).trim()] = i;
  });
  return col;
}

function val(row, index) {
  if (index == null) return "";
  var v = row[index];
  return v == null ? "" : String(v).trim();
}

function isTrue(v) {
  if (v === true) return true;
  var s = String(v).trim().toUpperCase();
  return s === "TRUE" || s === "1" || s === "YES";
}

function isHttpUrl_(url) {
  return /^https?:\/\//i.test(String(url));
}

function allowRate_(ip) {
  var cache = CacheService.getScriptCache();
  var key = "cm_" + hash_(ip);
  var n = Number(cache.get(key) || "0");
  if (n >= RATE_LIMIT_PER_MIN) return false;
  cache.put(key, String(n + 1), 60);
  return true;
}

function hash_(text) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(text)
  )
    .map(function (b) {
      return ("0" + (b & 255).toString(16)).slice(-2);
    })
    .join("")
    .slice(0, 16);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
