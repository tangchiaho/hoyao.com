(() => {
  const STORAGE_KEY = "hoyaoMaterialsCases_v1";
  const CASE_STEPS = ["需求記錄", "規格確認", "加工／備樣", "寄樣／交付"];

  const state = {
    catalog: null,
    batches: null,
    route: { name: "home", params: {} },
    filters: { q: "", form: "全部", status: "全部" },
  };

  const el = {
    app: document.querySelector("#app"),
    navDesktop: document.querySelector("#nav-desktop"),
    navMobile: document.querySelector("#nav-mobile"),
    menuToggle: document.querySelector("#menu-toggle"),
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const statusClass = (status) => `badge badge-status-${status}`;

  function loadCases() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveCases(cases) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  }

  function ensureSeedCase() {
    const cases = loadCases();
    if (cases.some((c) => c.seed)) return;
    cases.unshift({
      id: "HY-SEED-2000MESH",
      seed: true,
      demo: true,
      createdAt: "2026-11-01T08:00:00.000Z",
      materialId: "bamboo-powder",
      materialName: "竹粉",
      purpose: "複材試作填料",
      spec: "目標粒徑：2000 目；驗收方式待確認",
      qty: "50 公斤",
      process: "研磨、篩分",
      due: "2026-12-15",
      contact: "demo@example.com",
      note: "示範案件：試單需求已確認，尚未交付。",
      stepIndex: 1,
    });
    saveCases(cases);
  }

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [path, query = ""] = raw.split("?");
    const parts = path.split("/").filter(Boolean);
    const params = Object.fromEntries(new URLSearchParams(query));
    if (!parts.length) return { name: "home", params };
    if (parts[0] === "catalog") return { name: "catalog", params };
    if (parts[0] === "material" && parts[1]) return { name: "material", params: { ...params, id: parts[1] } };
    if (parts[0] === "request") return { name: "request", params: { ...params, material: parts[1] || params.material || "" } };
    if (parts[0] === "cases") return { name: "cases", params };
    if (parts[0] === "passport") {
      if (parts[1]) return { name: "passport", params: { ...params, id: parts[1] } };
      return { name: "passport-lookup", params };
    }
    if (parts[0] === "about") return { name: "about", params };
    return { name: "home", params };
  }

  function setActiveNav(name) {
    const map = {
      home: "home",
      catalog: "catalog",
      material: "catalog",
      request: "request",
      cases: "cases",
      passport: "passport",
      "passport-lookup": "passport",
      about: "about",
    };
    const key = map[name] || "home";
    document.querySelectorAll("[data-nav]").forEach((a) => {
      a.classList.toggle("is-active", a.dataset.nav === key);
    });
  }

  function closeMenu() {
    document.body.classList.remove("nav-open");
    el.menuToggle?.setAttribute("aria-expanded", "false");
  }

  function materialById(id) {
    return state.catalog.materials.find((m) => m.id === id);
  }

  function batchById(id) {
    return state.batches.batches.find((b) => b.id === id);
  }

  function filteredMaterials() {
    const q = state.filters.q.trim().toLowerCase();
    return state.catalog.materials.filter((m) => {
      if (state.filters.form !== "全部" && m.form !== state.filters.form) return false;
      if (state.filters.status !== "全部" && m.supplyStatus !== state.filters.status) return false;
      if (!q) return true;
      const hay = [m.name, m.subtitle, m.summary, m.feedstock, m.origin, m.form, ...(m.applications || [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function demoBanner(extra = "") {
    return `<aside class="demo-banner" role="note"><strong>展示預覽</strong><div>本平台為可操作設計預覽。示範材料、工單與批次護照皆可辨識；正式收件與帳號權限尚未啟用。${extra}</div></aside>`;
  }

  function renderHome() {
    const featured = state.catalog.materials.slice(0, 3);
    return `
      ${demoBanner()}
      <section class="hero fade-in" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="hero-kicker">HOYAO Materials Desk</p>
          <h1 id="hero-title">地方循環材料供應平台</h1>
          <p class="hero-lead">從南投竹木剩料與農業副產物出發：找材料、確認規格、協調加工、取得樣品，並逐步建立批次追溯。</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/catalog">探索材料</a>
            <a class="btn btn-ghost" href="#/request">提出規格需求</a>
            <a class="btn btn-ghost" href="#/passport">查批次護照</a>
          </div>
        </div>
        <figure class="hero-visual">
          <img src="assets/img/hero-materials.webp" width="1200" height="900" alt="和曜材料與板材現場樣品" />
          <figcaption class="hero-caption">現場材料樣貌 · 和曜南投據點</figcaption>
        </figure>
      </section>

      <section class="section fade-in" aria-labelledby="journey-title">
        <div class="section-head">
          <p class="section-label">三條動線</p>
          <h2 id="journey-title">依你手上的問題開始</h2>
          <p>研發找料、採購下規格、掃描樣品標籤——同一套材料與批次資料，三種進入方式。</p>
        </div>
        <div class="journey-grid">
          <a class="journey" href="#/catalog">
            <em>研發試作</em>
            <h3>探索植物纖維與剩料形態</h3>
            <p>依型態與供應狀態瀏覽，看懂客戶指定與實測的差異，再提出索樣。</p>
            <span>進入材料圖鑑 →</span>
          </a>
          <a class="journey" href="#/request?preset=bamboo-powder">
            <em>採購／規格</em>
            <h3>已有規格就直接提出需求</h3>
            <p>例如「2000 目竹粉、50 公斤」：寫清交期、加工與驗收條件，之後到「我的案件」追蹤。</p>
            <span>提出需求 →</span>
          </a>
          <a class="journey" href="#/passport/HY-DEMO-BP-2026-001">
            <em>樣品標籤</em>
            <h3>掃描後辨識手上這一批</h3>
            <p>示範護照顯示已知資料與待確認項目；沿用規格時會帶入來源批次。可用同材料兩批次對照。</p>
            <span>開啟示範護照 →</span>
          </a>
        </div>
      </section>

      <section class="section fade-in" aria-labelledby="feature-title">
        <div class="section-head">
          <p class="section-label">展示材料</p>
          <h2 id="feature-title">目前可走通流程的品項</h2>
          <p>少量清楚標示的展示資料。之後新增材料只需編輯 JSON。</p>
        </div>
        <div class="catalog-grid">${featured.map(cardHtml).join("")}</div>
        <p style="margin-top:18px"><a class="btn btn-line" href="#/catalog">查看全部材料</a></p>
      </section>
    `;
  }

  function cardHtml(m) {
    return `
      <a class="card" href="#/material/${encodeURIComponent(m.id)}">
        <figure><img src="${escapeHtml(m.image)}" alt="${escapeHtml(m.name)}形態" loading="lazy" width="800" height="600"></figure>
        <div class="card-body">
          <div class="card-meta">
            <span class="${statusClass(m.supplyStatus)}">${escapeHtml(m.supplyStatus)}</span>
            <span class="badge">${escapeHtml(m.form)}</span>
            ${m.demo ? '<span class="badge badge-demo">展示</span>' : ""}
          </div>
          <h3>${escapeHtml(m.name)}</h3>
          <p>${escapeHtml(m.subtitle)} · ${escapeHtml(m.origin)}</p>
        </div>
      </a>
    `;
  }

  function renderCatalog() {
    const items = filteredMaterials();
    const forms = ["全部", ...state.catalog.filters.forms];
    const statuses = ["全部", ...state.catalog.filters.statuses];
    return `
      ${demoBanner()}
      <header class="page-hero fade-in">
        <nav class="breadcrumb"><a href="#/">首頁</a> / 材料圖鑑</nav>
        <h1>材料圖鑑</h1>
        <p class="lead" style="margin:0;color:var(--muted);max-width:60ch">依型態與供應狀態探索。狀態說明的是目前能否索樣或洽詢，不是認證或庫存保證。</p>
      </header>
      <div class="toolbar fade-in">
        <div class="search">
          <label class="visually-hidden" for="q" style="position:absolute;left:-9999px">搜尋材料</label>
          <input id="q" type="search" placeholder="搜尋名稱、用途、料源…" value="${escapeHtml(state.filters.q)}" />
        </div>
      </div>
      <div class="chips fade-in" role="group" aria-label="型態">
        ${forms
          .map(
            (f) =>
              `<button type="button" class="chip" data-filter-form="${escapeHtml(f)}" aria-pressed="${
                state.filters.form === f
              }">${escapeHtml(f)}</button>`
          )
          .join("")}
      </div>
      <div class="chips fade-in" role="group" aria-label="供應狀態" style="margin:10px 0 18px">
        ${statuses
          .map(
            (s) =>
              `<button type="button" class="chip" data-filter-status="${escapeHtml(s)}" aria-pressed="${
                state.filters.status === s
              }">${escapeHtml(s)}</button>`
          )
          .join("")}
      </div>
      <div class="catalog-grid fade-in">
        ${items.length ? items.map(cardHtml).join("") : '<div class="empty">沒有符合條件的材料。試試清除篩選。</div>'}
      </div>
    `;
  }

  function rowsHtml(rows) {
    if (!rows?.length) return '<p class="form-hint">尚無資料。</p>';
    return `<table class="spec-table"><tbody>${rows
      .map(
        (r) =>
          `<tr><th>${escapeHtml(r.label)}</th><td>${escapeHtml(r.value)}${
            r.source ? `<span class="source-tag">${escapeHtml(r.source)}</span>` : ""
          }${r.method ? `<span class="source-tag">${escapeHtml(r.method)}</span>` : ""}${
            r.note ? `<div class="form-hint">${escapeHtml(r.note)}</div>` : ""
          }</td></tr>`
      )
      .join("")}</tbody></table>`;
  }

  function renderMaterial(id) {
    const m = materialById(id);
    if (!m) {
      return `${demoBanner()}<div class="panel fade-in"><h1>找不到材料</h1><p class="lead">此展示品項不存在或已更名。</p><a class="btn btn-ink" href="#/catalog">返回圖鑑</a></div>`;
    }
    const batches = (m.relatedBatches || []).map(batchById).filter(Boolean);
    return `
      ${demoBanner(m.demo ? "此為展示材料。" : "")}
      <header class="page-hero fade-in">
        <nav class="breadcrumb"><a href="#/">首頁</a> / <a href="#/catalog">材料圖鑑</a> / ${escapeHtml(m.name)}</nav>
      </header>
      <article class="detail-layout fade-in">
        <div class="detail-media">
          <figure>
            <img src="${escapeHtml(m.image)}" alt="${escapeHtml(m.name)}形態" width="1000" height="750">
            <figcaption>${escapeHtml(m.origin)} · ${escapeHtml(m.feedstock)}${m.demo ? " · 展示資料" : ""}</figcaption>
          </figure>
        </div>
        <div class="detail-body">
          <div class="card-meta">
            <span class="${statusClass(m.supplyStatus)}">${escapeHtml(m.supplyStatus)}</span>
            <span class="badge">${escapeHtml(m.form)}</span>
            ${m.demo ? '<span class="badge badge-demo">展示</span>' : ""}
          </div>
          <h1>${escapeHtml(m.name)}</h1>
          <p class="detail-lead">${escapeHtml(m.summary)}</p>
          <p class="form-hint">${escapeHtml(m.statusNote)}</p>

          <section class="spec-block">
            <h2>客戶指定規格</h2>
            ${rowsHtml(m.customerSpec)}
          </section>
          <section class="spec-block">
            <h2>實際量測值</h2>
            ${
              m.measured?.length
                ? rowsHtml(m.measured)
                : '<p class="form-hint">尚無儀器量測值。交付批次建立後會寫入護照。</p>'
            }
          </section>
          <section class="spec-block">
            <h2>待確認項目</h2>
            <ul class="pill-list">${(m.pendingMeasures || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
          </section>
          <section class="spec-block">
            <h2>可協調工序</h2>
            <ul class="pill-list">${(m.processes || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
          </section>
          <section class="spec-block">
            <h2>應用方向</h2>
            <ul class="pill-list">${(m.applications || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
          </section>
          ${
            batches.length
              ? `<section class="spec-block"><h2>相關批次護照</h2><ul class="pill-list">${batches
                  .map(
                    (b) =>
                      `<li><a href="#/passport/${encodeURIComponent(b.id)}">${escapeHtml(b.id)}</a></li>`
                  )
                  .join("")}</ul></section>`
              : ""
          }
          <div class="detail-actions">
            <a class="btn btn-ink" href="#/request/${encodeURIComponent(m.id)}">索樣／洽詢此材料</a>
            <a class="btn btn-line" href="#/catalog">返回圖鑑</a>
          </div>
        </div>
      </article>
    `;
  }

  function buildSpecFromBatch(batch) {
    const lines = [];
    (batch.customerSpec || []).forEach((row) => {
      lines.push(`${row.label}：${row.value}`);
    });
    if (batch.measured?.length) {
      lines.push("—— 參考批次已知量測 ——");
      batch.measured.forEach((row) => {
        lines.push(`${row.label}：${row.value}${row.method ? `（${row.method}）` : ""}`);
      });
    } else {
      lines.push("—— 參考批次尚無儀器量測值；相關項目維持待確認 ——");
    }
    if (batch.pending?.length) {
      lines.push("待確認：" + batch.pending.join("、"));
    }
    return lines.join("\n");
  }

  function qtyHintFromBatch(batch) {
    const qtyRow = (batch.customerSpec || []).find((r) => /數量/.test(r.label));
    if (qtyRow) return qtyRow.value;
    if (batch.relatedTrialOrder?.spec) {
      const m = batch.relatedTrialOrder.spec.match(/([\d.]+\s*公斤)/);
      if (m) return m[1];
    }
    return "";
  }

  function requestDefaults() {
    const fromId = state.route.params.from || "";
    const batch = fromId ? batchById(fromId) : null;
    const materialId =
      batch?.materialId || state.route.params.material || state.route.params.preset || "";
    const m = materialById(materialId);
    const preset = state.route.params.preset || materialId;
    const powderPreset = !batch && (preset === "bamboo-powder" || materialId === "bamboo-powder");

    if (batch) {
      return {
        sourceBatchId: batch.id,
        sourceBatchLabel: batch.label,
        materialId: batch.materialId,
        materialName: m?.name || batch.materialId,
        purpose: "依樣品批次規格再次洽詢／試作",
        spec: buildSpecFromBatch(batch),
        qty: qtyHintFromBatch(batch) || "",
        process: "研磨、篩分",
        due: "",
        contact: "",
        note: `參考批次 ${batch.id}（${batch.label}）。可修改本次需求後送出。`,
        measuredSummary: batch.measured?.length
          ? batch.measured.map((r) => `${r.label}：${r.value}`).join("；")
          : "尚無儀器量測值，維持待確認。",
        pendingSummary: (batch.pending || []).join("、") || "—",
      };
    }

    return {
      sourceBatchId: "",
      sourceBatchLabel: "",
      materialId: m?.id || (powderPreset ? "bamboo-powder" : ""),
      materialName: m?.name || (powderPreset ? "竹粉" : ""),
      purpose: powderPreset ? "複材試作填料" : "",
      spec: powderPreset ? "目標粒徑：2000 目；驗收方式待確認" : "",
      qty: powderPreset ? "50 公斤" : "",
      process: powderPreset ? "研磨、篩分" : "找料與規格評估",
      due: powderPreset ? "2026-12-15" : "",
      contact: "",
      note: powderPreset ? "試單需求已確認情境之示範預填；送出後僅存於此瀏覽器。" : "",
      measuredSummary: "",
      pendingSummary: "",
    };
  }

  function renderRequest() {
    const d = requestDefaults();
    const options = state.catalog.materials
      .map(
        (m) =>
          `<option value="${escapeHtml(m.id)}" ${m.id === d.materialId ? "selected" : ""}>${escapeHtml(
            m.name
          )}（${escapeHtml(m.supplyStatus)}）</option>`
      )
      .join("");
    const refPanel = d.sourceBatchId
      ? `<aside class="notice" id="batch-ref">
          <strong>參考來源批次</strong>
          <div style="margin-top:6px">
            <span class="case-id">${escapeHtml(d.sourceBatchId)}</span>
            · ${escapeHtml(d.sourceBatchLabel)}
            · <a href="#/passport/${encodeURIComponent(d.sourceBatchId)}">查看護照</a>
          </div>
          <div class="form-hint" style="margin-top:8px">已知量測：${escapeHtml(d.measuredSummary)}</div>
          <div class="form-hint">待確認：${escapeHtml(d.pendingSummary)}</div>
          <p class="form-hint" style="margin-top:8px">以下欄位已帶入可沿用規格，請依本次需求修改後送出。</p>
        </aside>`
      : "";
    return `
      ${demoBanner("送出的案件只保存在此瀏覽器，不會寄到伺服器。")}
      <div class="panel fade-in">
        <nav class="breadcrumb"><a href="#/">首頁</a> / 提出需求</nav>
        <h1>${d.sourceBatchId ? "沿用批次規格洽詢" : "提出找料／索樣需求"}</h1>
        <p class="lead">${
          d.sourceBatchId
            ? "已帶入來源批次與可沿用規格。請確認材料無誤，再修改本次用途、數量或驗收條件。"
            : "已知規格可直接填寫。客戶指定與實際量測會在材料頁與批次護照分開呈現。"
        }</p>
        ${refPanel}
        <form id="request-form" novalidate>
          <input type="hidden" name="sourceBatchId" value="${escapeHtml(d.sourceBatchId)}">
          <div class="form-grid">
            <label class="full">材料
              ${
                d.sourceBatchId
                  ? `<input type="hidden" name="materialId" value="${escapeHtml(d.materialId)}">
              <input type="text" value="${escapeHtml(d.materialName)}" readonly>
              <p class="form-hint">沿用護照時材料鎖定為來源批次對應品項；若要換材料請改從圖鑑進入。</p>`
                  : `<select name="materialId" required>
                <option value="">選擇材料…</option>
                ${options}
              </select>`
              }
            </label>
            <label class="full">用途
              <input name="purpose" required placeholder="例如：複材試作、板材填充" value="${escapeHtml(d.purpose)}">
            </label>
            <label class="full">規格與驗收條件
              <textarea name="spec" required placeholder="例如：2000 目；需確認粒徑分布與含水率">${escapeHtml(
                d.spec
              )}</textarea>
            </label>
            <label>數量
              <input name="qty" required placeholder="例如：50 公斤" value="${escapeHtml(d.qty)}">
            </label>
            <label>希望工序
              <select name="process">
                ${["找料與規格評估", "去雜、乾燥", "研磨、篩分", "纖維分離、混料", "炭材轉化評估", "造粒、成型", "分裝、密封"]
                  .map(
                    (p) =>
                      `<option ${p === d.process ? "selected" : ""}>${escapeHtml(p)}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label>希望交期（選填）
              <input name="due" type="date" value="${escapeHtml(d.due)}">
            </label>
            <label>聯絡方式（選填）
              <input name="contact" type="email" placeholder="you@company.com" value="${escapeHtml(d.contact)}">
            </label>
            <label class="full">補充說明
              <textarea name="note" placeholder="包裝、物流、保密或其他條件">${escapeHtml(d.note)}</textarea>
            </label>
          </div>
          <p class="form-hint">正式服務啟用後，此表單將改為送交承辦並需登入權限。現況為設計預覽。</p>
          <div class="form-actions">
            <button class="btn btn-ink" type="submit">建立示範工單</button>
            <a class="btn btn-line" href="#/cases">查看我的案件</a>
          </div>
          <div id="request-msg" hidden></div>
        </form>
      </div>
    `;
  }

  function renderCases() {
    const cases = loadCases();
    return `
      ${demoBanner("案件資料存在此裝置的瀏覽器；清除網站資料即消失。")}
      <div class="panel fade-in">
        <nav class="breadcrumb"><a href="#/">首頁</a> / 我的案件</nav>
        <h1>我的案件</h1>
        <p class="lead">示範進度：需求記錄 → 規格確認 → 加工／備樣 → 寄樣／交付。正式流程由承辦更新。</p>
        <div class="form-actions" style="margin-top:0;margin-bottom:16px">
          <a class="btn btn-ink" href="#/request">新增需求</a>
          <button type="button" class="btn btn-line" id="clear-cases">清除此裝置示範案件</button>
        </div>
        <div class="case-list">
          ${
            cases.length
              ? cases
                  .map((c) => {
                    const steps = CASE_STEPS.map((label, i) => {
                      const cls = i < c.stepIndex ? "is-done" : i === c.stepIndex ? "is-current" : "";
                      return `<div class="step ${cls}">${escapeHtml(label)}</div>`;
                    }).join("");
                    return `
                      <article class="case-item">
                        <header>
                          <h3>${escapeHtml(c.materialName)} · ${escapeHtml(c.qty)}</h3>
                          <span class="case-id">${escapeHtml(c.id)}${c.demo || c.seed ? " · 展示" : ""}</span>
                        </header>
                        <div style="white-space:pre-wrap">${escapeHtml(c.spec)}</div>
                        ${
                          c.sourceBatchId
                            ? `<div class="form-hint">參考批次 <a href="#/passport/${encodeURIComponent(
                                c.sourceBatchId
                              )}"><span class="case-id">${escapeHtml(c.sourceBatchId)}</span></a></div>`
                            : ""
                        }
                        <div class="form-hint">${escapeHtml(c.process)}${c.due ? ` · 希望交期 ${escapeHtml(c.due)}` : ""}${
                      c.note ? ` · ${escapeHtml(c.note)}` : ""
                    }</div>
                        <div class="steps" aria-label="進度">${steps}</div>
                        ${
                          c.materialId
                            ? `<p style="margin:0"><a href="#/material/${encodeURIComponent(
                                c.materialId
                              )}">查看材料</a>${
                                c.sourceBatchId
                                  ? ` · <a href="#/passport/${encodeURIComponent(c.sourceBatchId)}">來源護照</a>`
                                  : ""
                              }</p>`
                            : ""
                        }
                      </article>
                    `;
                  })
                  .join("")
              : '<div class="empty">尚無案件。<a href="#/request">提出第一筆需求</a></div>'
          }
        </div>
      </div>
    `;
  }

  function renderPassportLookup() {
    return `
      ${demoBanner()}
      <div class="panel fade-in">
        <nav class="breadcrumb"><a href="#/">首頁</a> / 批次護照</nav>
        <h1>查詢批次護照</h1>
        <p class="lead">掃描樣品標籤上的編號，或輸入示範編號查看護照。</p>
        <form class="lookup" id="passport-lookup-form">
          <input name="id" required placeholder="例如 HY-DEMO-BP-2026-001" value="" autocomplete="off">
          <button class="btn btn-ink" type="submit">查詢</button>
        </form>
        <p class="form-hint">示範編號（同材料兩批次可對照）：
          <a href="#/passport/HY-DEMO-BP-2026-001">HY-DEMO-BP-2026-001</a>（竹粉 · 2000 目）、
          <a href="#/passport/HY-DEMO-BP-2026-002">HY-DEMO-BP-2026-002</a>（竹粉 · 80 目）、
          <a href="#/passport/HY-DEMO-BS-2026-001">HY-DEMO-BS-2026-001</a>（竹屑）
        </p>
      </div>
    `;
  }

  function renderPassport(id) {
    const b = batchById(id);
    if (!b) {
      return `
        ${demoBanner()}
        <div class="panel fade-in">
          <h1>找不到此批次</h1>
          <p class="lead">編號「${escapeHtml(id)}」不在示範資料中。</p>
          <a class="btn btn-ink" href="#/passport">重新查詢</a>
        </div>
      `;
    }
    const m = materialById(b.materialId);
    return `
      ${demoBanner("此為示範護照，非正式交付或稽核文件。")}
      <div class="panel passport fade-in">
        <nav class="breadcrumb"><a href="#/">首頁</a> / <a href="#/passport">批次護照</a> / ${escapeHtml(b.id)}</nav>
        <div class="passport-head">
          <div>
            <p class="section-label" style="margin:0">Material batch passport</p>
            <h1 style="margin:6px 0 8px">${escapeHtml(b.label)}</h1>
            <div class="passport-id">${escapeHtml(b.id)}</div>
          </div>
          <div class="card-meta">
            <span class="badge badge-demo">展示護照</span>
            <span class="badge">${escapeHtml(b.kind)}</span>
          </div>
        </div>
        <table class="spec-table">
          <tbody>
            <tr><th>對應材料</th><td>${
              m ? `<a href="#/material/${encodeURIComponent(m.id)}">${escapeHtml(m.name)}</a>` : "—"
            }</td></tr>
            <tr><th>產地／收料</th><td>${escapeHtml(b.origin)}</td></tr>
            <tr><th>製作日期</th><td>${escapeHtml(b.producedOn)}</td></tr>
            <tr><th>數量</th><td>${escapeHtml(b.quantity)}</td></tr>
            <tr><th>工序版本</th><td>${escapeHtml(b.processVersion)}</td></tr>
          </tbody>
        </table>

        <section class="spec-block">
          <h2>客戶指定（若有）</h2>
          ${rowsHtml(b.customerSpec)}
        </section>
        <section class="spec-block">
          <h2>本批次已知量測</h2>
          ${
            b.measured?.length
              ? rowsHtml(b.measured)
              : '<p class="form-hint">尚無儀器量測值。相關項目維持<strong>待確認</strong>，不會以示意樣品外觀代替實測。</p>'
          }
        </section>
        <section class="spec-block">
          <h2>待補資料</h2>
          <ul class="pill-list">${(b.pending || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
        </section>
        <section class="spec-block">
          <h2>處理履歷</h2>
          <ol class="chain">
            ${(b.chain || [])
              .map(
                (s) =>
                  `<li><strong>${escapeHtml(s.step)}</strong><span>${escapeHtml(s.detail)} · ${escapeHtml(
                    s.date
                  )}</span></li>`
              )
              .join("")}
          </ol>
        </section>
        ${
          b.relatedTrialOrder
            ? `<div class="notice"><strong>相關試單：</strong>${escapeHtml(
                b.relatedTrialOrder.spec
              )} — ${escapeHtml(b.relatedTrialOrder.status)}</div>`
            : ""
        }
        <div class="form-actions">
          <a class="btn btn-ink" href="#/request/${encodeURIComponent(b.materialId)}?from=${encodeURIComponent(
            b.id
          )}">沿用規格再次洽詢</a>
          ${m ? `<a class="btn btn-line" href="#/material/${encodeURIComponent(m.id)}">查看材料頁</a>` : ""}
        </div>
      </div>
    `;
  }

  function renderAbout() {
    return `
      ${demoBanner("本站為可操作預覽；正式線上收件尚未開放。")}
      <div class="panel fade-in">
        <nav class="breadcrumb"><a href="#/">首頁</a> / 關於</nav>
        <h1>關於和曜材料櫃台</h1>
        <p class="lead">和曜應用科技以南投的竹木加工剩料與農業副產物為起點，協助企業、製造商與研發團隊找到可用的地方循環材料，並把規格、樣品與後續供應談清楚。</p>

        <section class="spec-block">
          <h2>我們協助什麼</h2>
          <ul>
            <li>依用途探索植物纖維、竹木剩料等材料形態與供應狀態</li>
            <li>確認客戶指定規格，並與實際量測、待確認項目分開標示</li>
            <li>協調去雜、乾燥、研磨、篩分、分裝等加工方向</li>
            <li>提供樣品，並以批次護照對應你手上的那一袋</li>
            <li>承接已知規格的試單洽詢（例如目數、數量、交期與驗收條件）</li>
          </ul>
        </section>

        <section class="spec-block">
          <h2>適合誰來</h2>
          <p>材料與配方研發、產品開發，以及已有明確規格的採購或專案窗口。若你已拿到實體樣品，可先查批次護照，再決定是否沿用規格洽詢下一輪。</p>
        </section>

        <section class="spec-block">
          <h2>目前開放範圍</h2>
          <p>此網站用於展示服務架構與操作流程。示範材料、示範護照與示範工單皆有標示。正式線上收件、帳號權限與量測報告串接將於下一階段啟用；現階段歡迎先瀏覽圖鑑，或以來信說明需求。</p>
        </section>

        <section class="spec-block">
          <h2>洽詢入口</h2>
          <p>請來信說明材料用途、希望規格、數量、交期與聯絡人。若已掃描樣品標籤，請一併附上批次編號。</p>
          <div class="form-actions" style="margin-top:12px">
            <a class="btn btn-ink" href="mailto:contact@hoyao.com?subject=%E6%9D%90%E6%96%99%E6%B4%BD%E8%A9%A2%EF%BD%9C%E5%92%8C%E6%9B%9C%E6%9D%90%E6%96%99%E6%AB%83%E5%8F%B0">contact@hoyao.com</a>
            <a class="btn btn-line" href="#/request">在網站提出需求（預覽）</a>
            <a class="btn btn-line" href="https://hoyao.com/">和曜公司官網</a>
          </div>
        </section>
      </div>
    `;
  }

  function render() {
    state.route = parseHash();
    setActiveNav(state.route.name);
    closeMenu();
    const { name, params } = state.route;
    let html = "";
    if (name === "home") html = renderHome();
    else if (name === "catalog") html = renderCatalog();
    else if (name === "material") html = renderMaterial(params.id);
    else if (name === "request") html = renderRequest();
    else if (name === "cases") html = renderCases();
    else if (name === "passport-lookup") html = renderPassportLookup();
    else if (name === "passport") html = renderPassport(params.id);
    else if (name === "about") html = renderAbout();
    else html = renderHome();

    el.app.innerHTML = html;
    document.title = pageTitle(name, params);
    window.scrollTo(0, 0);
    bindViewEvents();
  }

  function pageTitle(name, params) {
    const base = "和曜地方循環材料供應平台";
    if (name === "catalog") return `材料圖鑑｜${base}`;
    if (name === "material") {
      const m = materialById(params.id);
      return m ? `${m.name}｜${base}` : `材料｜${base}`;
    }
    if (name === "request") return `提出需求｜${base}`;
    if (name === "cases") return `我的案件｜${base}`;
    if (name === "passport" || name === "passport-lookup") return `批次護照｜${base}`;
    if (name === "about") return `關於平台｜${base}`;
    return base;
  }

  function bindViewEvents() {
    const q = document.querySelector("#q");
    if (q) {
      q.addEventListener("input", () => {
        state.filters.q = q.value;
        const grid = document.querySelector(".catalog-grid");
        if (!grid) return;
        const items = filteredMaterials();
        grid.innerHTML = items.length
          ? items.map(cardHtml).join("")
          : '<div class="empty">沒有符合條件的材料。試試清除篩選。</div>';
      });
    }

    document.querySelectorAll("[data-filter-form]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.filters.form = btn.dataset.filterForm;
        render();
      });
    });
    document.querySelectorAll("[data-filter-status]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.filters.status = btn.dataset.filterStatus;
        render();
      });
    });

    const form = document.querySelector("#request-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        if (!data.materialId || !data.spec || !data.qty || !data.purpose) {
          const msg = document.querySelector("#request-msg");
          msg.hidden = false;
          msg.className = "notice error";
          msg.textContent = "請完整填寫材料、用途、規格與數量。";
          return;
        }
        const material = materialById(data.materialId);
        const rec = {
          id: "HY-" + Date.now().toString(36).toUpperCase(),
          demo: true,
          createdAt: new Date().toISOString(),
          materialId: data.materialId,
          materialName: material?.name || data.materialId,
          sourceBatchId: data.sourceBatchId || "",
          purpose: data.purpose,
          spec: data.spec,
          qty: data.qty,
          process: data.process,
          due: data.due || "",
          contact: data.contact || "",
          note: data.note || "",
          stepIndex: 0,
        };
        const cases = loadCases();
        cases.unshift(rec);
        try {
          saveCases(cases);
        } catch {
          /* ignore quota */
        }
        location.hash = "#/cases";
      });
    }

    document.querySelector("#clear-cases")?.addEventListener("click", () => {
      if (confirm("確定清除此瀏覽器內的示範案件？")) {
        localStorage.removeItem(STORAGE_KEY);
        ensureSeedCase();
        render();
      }
    });

    document.querySelector("#passport-lookup-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = new FormData(e.target).get("id")?.toString().trim();
      if (id) location.hash = `#/passport/${encodeURIComponent(id)}`;
    });
  }

  async function loadData() {
    if (window.__HOYAO_MATERIALS_DATA__?.catalog && window.__HOYAO_MATERIALS_DATA__?.batches) {
      return window.__HOYAO_MATERIALS_DATA__;
    }
    const [catalog, batches] = await Promise.all([
      fetch("assets/data/catalog.json").then((r) => r.json()),
      fetch("assets/data/batches.json").then((r) => r.json()),
    ]);
    return { catalog, batches };
  }

  async function init() {
    ensureSeedCase();
    const data = await loadData();
    state.catalog = data.catalog;
    state.batches = data.batches;

    el.menuToggle?.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      el.menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    el.navMobile?.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeMenu();
    });

    window.addEventListener("hashchange", render);
    if (!location.hash) location.hash = "#/";
    else render();
  }

  init().catch((err) => {
    el.app.innerHTML = `<div class="panel"><h1>無法載入資料</h1><p class="lead">${escapeHtml(
      err.message
    )}</p></div>`;
  });
})();
