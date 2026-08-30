/**
 * 竹山開飯了 — Google Apps Script 範例
 * 部署為 Web App（執行身分：我；存取：所有人）後，
 * 把 Web App URL 貼到 assets/js/zhushan-config.js 的 wishesApiUrl。
 *
 * 使用方式：
 * 1. 開對應的 Google Sheet
 * 2. 擴充功能 → Apps Script
 * 3. 貼上本檔內容
 * 4. 將 SHEET_NAME 改成實際工作表名稱
 * 5. 部署 → 新增部署作業 → 類型選「網頁應用程式」
 */

var SHEET_NAME = "Wishes";

function doGet() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonOutput({ totalCount: 0, approved: [], stats: {} });
  }

  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) {
    return jsonOutput({ totalCount: 0, approved: [], stats: {} });
  }

  var headers = rows[0].map(function (h) {
    return String(h).trim();
  });
  var col = {};
  headers.forEach(function (h, i) {
    col[h] = i;
  });

  var approved = [];
  var favorite = {};
  var futureTheme = {};
  var localCount = 0;
  var firstVisitCount = 0;

  for (var r = 1; r < rows.length; r++) {
    var row = rows[r];
    if (!isTrue(row[col.approved])) continue;

    var item = {
      id: val(row, col.id),
      message: val(row, col.message),
      relation: val(row, col.relation),
      ageRange: val(row, col.age_range),
      favorite: val(row, col.favorite),
      futureTheme: val(row, col.future_theme),
      createdAt: formatDate(row[col.created_at] || row[col.published_at]),
    };
    if (!item.message) continue;
    approved.push(item);

    bump(favorite, item.favorite);
    bump(futureTheme, item.futureTheme);
    if (isLocal(item.relation)) localCount += 1;
    if (isFirstVisit(val(row, col.first_visit))) firstVisitCount += 1;
  }

  return jsonOutput({
    totalCount: approved.length,
    approved: approved,
    stats: {
      localCount: localCount,
      firstVisitCount: firstVisitCount,
      favorite: favorite,
      futureTheme: futureTheme,
    },
  });
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

function isLocal(relation) {
  return relation === "竹山在地" || relation === "南投其他地區";
}

function isFirstVisit(v) {
  return v === "是" || isTrue(v);
}

function bump(obj, key) {
  if (!key) return;
  obj[key] = (obj[key] || 0) + 1;
}

function formatDate(v) {
  if (!v) return "";
  if (Object.prototype.toString.call(v) === "[object Date]") {
    return Utilities.formatDate(v, "Asia/Taipei", "yyyy-MM-dd");
  }
  return String(v).slice(0, 10);
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
