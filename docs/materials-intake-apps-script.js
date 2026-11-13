/**
 * 和曜地方循環材料圖鑑 — 正式收件／追蹤 Apps Script
 *
 * 部署：
 * 1. 新建 Google Sheet「和曜材料圖鑑＿工單」
 * 2. 擴充功能 → Apps Script → 貼上本檔
 * 3. 專案設定 → 指令碼屬性：ADMIN_TOKEN =（內部用密鑰）
 * 4. 部署 → 網頁應用程式（執行身分：我；存取：任何人）
 * 5. 把 Web App URL 貼到 materials/config.js 的 intakeApiUrl
 *
 * API：
 * - POST { action:"submit", ... } 建立工單（支援 clientRequestId 防重複）
 * - GET/POST { action:"get", orderId, accessToken } 客戶查詢
 * - POST { action:"updateStatus", orderId, adminToken, status, note } 內部更新
 */

var ORDERS_SHEET = "Orders";
var EVENTS_SHEET = "Events";

var PUBLIC_STATUSES = [
  "received",
  "spec_review",
  "sampling",
  "processing",
  "ready",
  "shipped",
  "closed",
];

function doGet(e) {
  return route_(parseParams_(e));
}

function doPost(e) {
  return route_(parseParams_(e));
}

function route_(params) {
  var action = String(params.action || "").toLowerCase();
  try {
    if (action === "submit") return submit_(params);
    if (action === "get") return getOrder_(params);
    if (action === "updateStatus" || action === "updatestatus") return updateStatus_(params);
    if (action === "health") return json_({ ok: true, service: "hoyao-materials-intake" });
    return json_({ ok: false, error: "unknown_action" }, 400);
  } catch (err) {
    return json_({ ok: false, error: "server_error", detail: String(err) }, 500);
  }
}

function submit_(params) {
  if (!isTrue_(params.consentContact)) {
    return json_({ ok: false, error: "consent_required" }, 400);
  }

  var contactName = clean_(params.contactName, 80);
  var contactEmail = clean_(params.contactEmail, 120);
  var contactPhone = clean_(params.contactPhone, 40);
  if (!contactName || (!contactEmail && !contactPhone)) {
    return json_({ ok: false, error: "contact_required" }, 400);
  }

  var material = clean_(params.material, 80);
  var spec = clean_(params.spec, 2000);
  var qty = clean_(params.qty, 80);
  var processNeed = clean_(params.process || params.processNeed, 120);
  var due = clean_(params.due, 40);
  var useCase = clean_(params.useCase || params.purpose, 500);
  if (!material || !spec || !qty) {
    return json_({ ok: false, error: "spec_required" }, 400);
  }

  var clientRequestId = clean_(params.clientRequestId, 80);
  ensureSheets_();
  var orders = getSheet_(ORDERS_SHEET);

  if (clientRequestId) {
    var existing = findByClientRequestId_(orders, clientRequestId);
    if (existing) {
      return json_({
        ok: true,
        duplicate: true,
        orderId: existing.orderId,
        accessToken: existing.accessToken,
        status: existing.status,
        trackUrl: trackUrl_(existing.orderId, existing.accessToken),
      });
    }
  }

  var now = new Date();
  var orderId = "HY-" + Utilities.formatDate(now, "Asia/Taipei", "yyyyMMdd") + "-" + randomCode_(4);
  var accessToken = Utilities.getUuid().replace(/-/g, "");

  // Columns: see header row in ensureSheets_
  orders.appendRow([
    orderId,
    accessToken,
    clientRequestId,
    "received",
    material,
    spec,
    qty,
    processNeed,
    due,
    useCase,
    contactName,
    contactEmail,
    contactPhone,
    "", // batchId (customer-visible when set)
    "", // reportSummary (customer-visible)
    "", // sourceWindow (internal)
    "", // costNote (internal)
    "", // processParams (internal)
    "", // lossRate (internal)
    "", // warehouseTempHumidity (separate from moisture)
    "", // warehouseEnvSource
    "", // warehouseEnvMethod
    "", // materialMoisture
    "", // moistureSource
    "", // moistureMethod
    now,
    now,
    "customer",
  ]);

  appendEvent_(orderId, "received", "客戶提交規格", "system");

  return json_({
    ok: true,
    duplicate: false,
    orderId: orderId,
    accessToken: accessToken,
    status: "received",
    trackUrl: trackUrl_(orderId, accessToken),
  });
}

function getOrder_(params) {
  var orderId = clean_(params.orderId, 40);
  var accessToken = clean_(params.accessToken, 80);
  var adminToken = clean_(params.adminToken, 120);
  if (!orderId) return json_({ ok: false, error: "order_required" }, 400);

  ensureSheets_();
  var row = findByOrderId_(getSheet_(ORDERS_SHEET), orderId);
  if (!row) return json_({ ok: false, error: "not_found" }, 404);

  var isAdmin = adminToken && adminToken === getAdminToken_();
  if (!isAdmin && accessToken !== row.accessToken) {
    return json_({ ok: false, error: "unauthorized" }, 403);
  }

  var payload = {
    ok: true,
    layer: isAdmin ? "internal" : "customer",
    order: customerView_(row),
    events: listEvents_(orderId),
  };
  if (isAdmin) payload.orderInternal = internalView_(row);
  return json_(payload);
}

function updateStatus_(params) {
  var adminToken = clean_(params.adminToken, 120);
  if (!adminToken || adminToken !== getAdminToken_()) {
    return json_({ ok: false, error: "unauthorized" }, 403);
  }
  var orderId = clean_(params.orderId, 40);
  var status = clean_(params.status, 40);
  if (PUBLIC_STATUSES.indexOf(status) < 0) {
    return json_({ ok: false, error: "invalid_status" }, 400);
  }

  ensureSheets_();
  var sheet = getSheet_(ORDERS_SHEET);
  var found = findRowIndexByOrderId_(sheet, orderId);
  if (!found) return json_({ ok: false, error: "not_found" }, 404);

  var r = found.index;
  sheet.getRange(r, 4).setValue(status); // status
  if (params.batchId != null) sheet.getRange(r, 14).setValue(clean_(params.batchId, 80));
  if (params.reportSummary != null) sheet.getRange(r, 15).setValue(clean_(params.reportSummary, 2000));
  if (params.sourceWindow != null) sheet.getRange(r, 16).setValue(clean_(params.sourceWindow, 500));
  if (params.costNote != null) sheet.getRange(r, 17).setValue(clean_(params.costNote, 500));
  if (params.processParams != null) sheet.getRange(r, 18).setValue(clean_(params.processParams, 2000));
  if (params.lossRate != null) sheet.getRange(r, 19).setValue(clean_(params.lossRate, 80));
  if (params.warehouseTempHumidity != null) sheet.getRange(r, 20).setValue(clean_(params.warehouseTempHumidity, 200));
  if (params.warehouseEnvSource != null) sheet.getRange(r, 21).setValue(clean_(params.warehouseEnvSource, 200));
  if (params.warehouseEnvMethod != null) sheet.getRange(r, 22).setValue(clean_(params.warehouseEnvMethod, 200));
  if (params.materialMoisture != null) sheet.getRange(r, 23).setValue(clean_(params.materialMoisture, 200));
  if (params.moistureSource != null) sheet.getRange(r, 24).setValue(clean_(params.moistureSource, 200));
  if (params.moistureMethod != null) sheet.getRange(r, 25).setValue(clean_(params.moistureMethod, 200));
  sheet.getRange(r, 27).setValue(new Date()); // updatedAt

  var note = clean_(params.note, 500) || ("狀態更新為 " + status);
  appendEvent_(orderId, status, note, "internal");

  return json_({ ok: true, orderId: orderId, status: status });
}

function customerView_(row) {
  return {
    orderId: row.orderId,
    status: row.status,
    material: row.material,
    spec: row.spec,
    qty: row.qty,
    processNeed: row.processNeed,
    due: row.due,
    useCase: row.useCase,
    batchId: row.batchId || null,
    reportSummary: row.reportSummary || null,
    warehouseTempHumidity: fieldWithMeta_(row.warehouseTempHumidity, row.warehouseEnvSource, row.warehouseEnvMethod),
    materialMoisture: fieldWithMeta_(row.materialMoisture, row.moistureSource, row.moistureMethod),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function internalView_(row) {
  return {
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    sourceWindow: row.sourceWindow || null,
    costNote: row.costNote || null,
    processParams: row.processParams || null,
    lossRate: row.lossRate || null,
    clientRequestId: row.clientRequestId || null,
  };
}

function fieldWithMeta_(value, source, method) {
  if (!value) {
    return { value: null, source: null, method: null, status: "pending" };
  }
  return {
    value: value,
    source: source || null,
    method: method || null,
    status: "recorded",
  };
}

function ensureSheets_() {
  var ss = SpreadsheetApp.getActive();
  var orders = ss.getSheetByName(ORDERS_SHEET);
  if (!orders) {
    orders = ss.insertSheet(ORDERS_SHEET);
    orders.appendRow([
      "orderId",
      "accessToken",
      "clientRequestId",
      "status",
      "material",
      "spec",
      "qty",
      "processNeed",
      "due",
      "useCase",
      "contactName",
      "contactEmail",
      "contactPhone",
      "batchId",
      "reportSummary",
      "sourceWindow",
      "costNote",
      "processParams",
      "lossRate",
      "warehouseTempHumidity",
      "warehouseEnvSource",
      "warehouseEnvMethod",
      "materialMoisture",
      "moistureSource",
      "moistureMethod",
      "createdAt",
      "updatedAt",
      "ownerLayer",
    ]);
  }
  var events = ss.getSheetByName(EVENTS_SHEET);
  if (!events) {
    events = ss.insertSheet(EVENTS_SHEET);
    events.appendRow(["orderId", "status", "note", "actor", "createdAt"]);
  }
}

function getSheet_(name) {
  return SpreadsheetApp.getActive().getSheetByName(name);
}

function findByClientRequestId_(sheet, clientRequestId) {
  var values = sheet.getDataRange().getValues();
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][2] || "") === clientRequestId) return rowToObj_(values[r]);
  }
  return null;
}

function findByOrderId_(sheet, orderId) {
  var found = findRowIndexByOrderId_(sheet, orderId);
  return found ? found.row : null;
}

function findRowIndexByOrderId_(sheet, orderId) {
  var values = sheet.getDataRange().getValues();
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][0] || "") === orderId) {
      return { index: r + 1, row: rowToObj_(values[r]) };
    }
  }
  return null;
}

function rowToObj_(row) {
  return {
    orderId: String(row[0] || ""),
    accessToken: String(row[1] || ""),
    clientRequestId: String(row[2] || ""),
    status: String(row[3] || ""),
    material: String(row[4] || ""),
    spec: String(row[5] || ""),
    qty: String(row[6] || ""),
    processNeed: String(row[7] || ""),
    due: String(row[8] || ""),
    useCase: String(row[9] || ""),
    contactName: String(row[10] || ""),
    contactEmail: String(row[11] || ""),
    contactPhone: String(row[12] || ""),
    batchId: String(row[13] || ""),
    reportSummary: String(row[14] || ""),
    sourceWindow: String(row[15] || ""),
    costNote: String(row[16] || ""),
    processParams: String(row[17] || ""),
    lossRate: String(row[18] || ""),
    warehouseTempHumidity: String(row[19] || ""),
    warehouseEnvSource: String(row[20] || ""),
    warehouseEnvMethod: String(row[21] || ""),
    materialMoisture: String(row[22] || ""),
    moistureSource: String(row[23] || ""),
    moistureMethod: String(row[24] || ""),
    createdAt: row[25],
    updatedAt: row[26],
  };
}

function appendEvent_(orderId, status, note, actor) {
  getSheet_(EVENTS_SHEET).appendRow([orderId, status, note, actor, new Date()]);
}

function listEvents_(orderId) {
  var sheet = getSheet_(EVENTS_SHEET);
  var values = sheet.getDataRange().getValues();
  var out = [];
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][0] || "") !== orderId) continue;
    out.push({
      status: String(values[r][1] || ""),
      note: String(values[r][2] || ""),
      actor: String(values[r][3] || ""),
      createdAt: values[r][4],
    });
  }
  return out;
}

function trackUrl_(orderId, accessToken) {
  return (
    "https://hoyao.com/materials/track.html?orderId=" +
    encodeURIComponent(orderId) +
    "&accessToken=" +
    encodeURIComponent(accessToken)
  );
}

function getAdminToken_() {
  return String(PropertiesService.getScriptProperties().getProperty("ADMIN_TOKEN") || "");
}

function parseParams_(e) {
  e = e || {};
  var params = {};
  if (e.parameter) {
    Object.keys(e.parameter).forEach(function (k) {
      params[k] = e.parameter[k];
    });
  }
  try {
    if (e.postData && e.postData.contents) {
      var parsed = JSON.parse(e.postData.contents);
      Object.keys(parsed || {}).forEach(function (k) {
        params[k] = parsed[k];
      });
    }
  } catch (err) {}
  return params;
}

function clean_(v, max) {
  var s = String(v == null ? "" : v).trim();
  if (s.length > max) s = s.slice(0, max);
  return s;
}

function isTrue_(v) {
  return v === true || v === "true" || v === "1" || v === "on" || v === "yes";
}

function randomCode_(n) {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var out = "";
  for (var i = 0; i < n; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

function json_(obj, status) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
