#!/usr/bin/env node
/**
 * Local mock of docs/materials-intake-apps-script.js for acceptance tests.
 * Usage: node scripts/materials-intake-server.mjs
 * Store: materials/.local-intake-store.json (gitignored)
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const STORE = path.join(ROOT, "materials", ".local-intake-store.json");
const PORT = Number(process.env.MATERIALS_INTAKE_PORT || 8787);
const ADMIN_TOKEN = process.env.MATERIALS_ADMIN_TOKEN || "hoyao-dev-admin";

const PUBLIC_STATUSES = [
  "received",
  "spec_review",
  "sampling",
  "processing",
  "ready",
  "shipped",
  "closed",
];

function loadStore() {
  try {
    return JSON.parse(fs.readFileSync(STORE, "utf8"));
  } catch {
    return { orders: [], events: [] };
  }
}

function saveStore(store) {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  fs.writeFileSync(STORE, JSON.stringify(store, null, 2));
}

function json(res, obj, status = 200) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function clean(v, max) {
  const s = String(v ?? "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

function isTrue(v) {
  return v === true || v === "true" || v === "1" || v === "on" || v === "yes";
}

function trackUrl(orderId, accessToken) {
  return `http://127.0.0.1:8765/materials/track.html?orderId=${encodeURIComponent(orderId)}&accessToken=${encodeURIComponent(accessToken)}`;
}

function fieldWithMeta(value, source, method) {
  if (!value) return { value: null, source: null, method: null, status: "pending" };
  return { value, source: source || null, method: method || null, status: "recorded" };
}

function customerView(row) {
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
    warehouseTempHumidity: fieldWithMeta(
      row.warehouseTempHumidity,
      row.warehouseEnvSource,
      row.warehouseEnvMethod
    ),
    materialMoisture: fieldWithMeta(
      row.materialMoisture,
      row.moistureSource,
      row.moistureMethod
    ),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function internalView(row) {
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

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }
}

function handleSubmit(params) {
  if (!isTrue(params.consentContact)) {
    return { status: 400, body: { ok: false, error: "consent_required" } };
  }
  const contactName = clean(params.contactName, 80);
  const contactEmail = clean(params.contactEmail, 120);
  const contactPhone = clean(params.contactPhone, 40);
  if (!contactName || (!contactEmail && !contactPhone)) {
    return { status: 400, body: { ok: false, error: "contact_required" } };
  }
  const material = clean(params.material, 80);
  const spec = clean(params.spec, 2000);
  const qty = clean(params.qty, 80);
  if (!material || !spec || !qty) {
    return { status: 400, body: { ok: false, error: "spec_required" } };
  }

  const store = loadStore();
  const clientRequestId = clean(params.clientRequestId, 80);
  if (clientRequestId) {
    const existing = store.orders.find((o) => o.clientRequestId === clientRequestId);
    if (existing) {
      return {
        status: 200,
        body: {
          ok: true,
          duplicate: true,
          orderId: existing.orderId,
          accessToken: existing.accessToken,
          status: existing.status,
          trackUrl: trackUrl(existing.orderId, existing.accessToken),
        },
      };
    }
  }

  const now = new Date().toISOString();
  const orderId =
    "HY-" +
    new Date().toISOString().slice(0, 10).replace(/-/g, "") +
    "-" +
    crypto.randomBytes(2).toString("hex").toUpperCase();
  const accessToken = crypto.randomBytes(16).toString("hex");
  const row = {
    orderId,
    accessToken,
    clientRequestId,
    status: "received",
    material,
    spec,
    qty,
    processNeed: clean(params.process || params.processNeed, 120),
    due: clean(params.due, 40),
    useCase: clean(params.useCase || params.purpose, 500),
    contactName,
    contactEmail,
    contactPhone,
    batchId: "",
    reportSummary: "",
    sourceWindow: "",
    costNote: "",
    processParams: "",
    lossRate: "",
    warehouseTempHumidity: "",
    warehouseEnvSource: "",
    warehouseEnvMethod: "",
    materialMoisture: "",
    moistureSource: "",
    moistureMethod: "",
    createdAt: now,
    updatedAt: now,
  };
  store.orders.unshift(row);
  store.events.push({
    orderId,
    status: "received",
    note: "客戶提交規格",
    actor: "system",
    createdAt: now,
  });
  saveStore(store);
  return {
    status: 200,
    body: {
      ok: true,
      duplicate: false,
      orderId,
      accessToken,
      status: "received",
      trackUrl: trackUrl(orderId, accessToken),
    },
  };
}

function handleGet(params) {
  const orderId = clean(params.orderId, 40);
  const accessToken = clean(params.accessToken, 80);
  const adminToken = clean(params.adminToken, 120);
  if (!orderId) return { status: 400, body: { ok: false, error: "order_required" } };
  const store = loadStore();
  const row = store.orders.find((o) => o.orderId === orderId);
  if (!row) return { status: 404, body: { ok: false, error: "not_found" } };
  const isAdmin = adminToken && adminToken === ADMIN_TOKEN;
  if (!isAdmin && accessToken !== row.accessToken) {
    return { status: 403, body: { ok: false, error: "unauthorized" } };
  }
  const events = store.events.filter((e) => e.orderId === orderId);
  const payload = {
    ok: true,
    layer: isAdmin ? "internal" : "customer",
    order: customerView(row),
    events,
  };
  if (isAdmin) payload.orderInternal = internalView(row);
  return { status: 200, body: payload };
}

function handleUpdate(params) {
  const adminToken = clean(params.adminToken, 120);
  if (!adminToken || adminToken !== ADMIN_TOKEN) {
    return { status: 403, body: { ok: false, error: "unauthorized" } };
  }
  const orderId = clean(params.orderId, 40);
  const status = clean(params.status, 40);
  if (!PUBLIC_STATUSES.includes(status)) {
    return { status: 400, body: { ok: false, error: "invalid_status" } };
  }
  const store = loadStore();
  const row = store.orders.find((o) => o.orderId === orderId);
  if (!row) return { status: 404, body: { ok: false, error: "not_found" } };

  row.status = status;
  const keys = [
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
  ];
  for (const k of keys) {
    if (params[k] != null) row[k] = clean(params[k], 2000);
  }
  row.updatedAt = new Date().toISOString();
  store.events.push({
    orderId,
    status,
    note: clean(params.note, 500) || `狀態更新為 ${status}`,
    actor: "internal",
    createdAt: row.updatedAt,
  });
  saveStore(store);
  return { status: 200, body: { ok: true, orderId, status } };
}

function route(params) {
  const action = String(params.action || "").toLowerCase();
  if (action === "submit") return handleSubmit(params);
  if (action === "get") return handleGet(params);
  if (action === "updatestatus" || action === "updateStatus".toLowerCase()) {
    return handleUpdate(params);
  }
  if (action === "health") {
    return { status: 200, body: { ok: true, service: "hoyao-materials-intake-mock" } };
  }
  return { status: 400, body: { ok: false, error: "unknown_action" } };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  let params = Object.fromEntries(url.searchParams.entries());
  if (req.method === "POST") {
    const body = await readBody(req);
    params = { ...params, ...body };
  }
  if (!params.action && req.method === "GET") params.action = "health";

  const result = route(params);
  json(res, result.body, result.status);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`materials intake mock on http://127.0.0.1:${PORT}/`);
  console.log(`store: ${STORE}`);
  console.log(`ADMIN_TOKEN: ${ADMIN_TOKEN}`);
});
