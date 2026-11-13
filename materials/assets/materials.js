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

  function renderHome(){
 return `<section class="hero fade-in"><div class="hero-copy"><p class="hero-kicker">HOYAO Materials Desk</p><h1>地方循環材料供應平台</h1><p class="hero-lead">探索南投竹材加工餘料，依用途洽詢樣品、加工與供應規格。</p><div class="hero-actions"><a class="btn btn-primary" href="#/catalog">瀏覽材料</a><a class="btn btn-ghost" href="#/request">客製找料與加工</a></div></div><figure class="hero-visual"><img src="assets/img/processing-yard.webp" alt="竹山竹材加工現場"><figcaption class="hero-caption">竹山｜竹材加工現場</figcaption></figure></section><section class="section"><h2>材料選覽</h2><div class="catalog-grid">${state.catalog.materials.map(cardHtml).join("")}</div></section>`;
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
      return `<div class="panel fade-in"><h1>找不到材料</h1><p class="lead">此品項目前未刊登。</p><a class="btn btn-ink" href="#/catalog">返回圖鑑</a></div>`;
    }
    const batches = (m.relatedBatches || []).map(batchById).filter(Boolean);
    return `
      
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
            <h2>試單需求規格</h2>
            ${rowsHtml(m.customerSpec)}
          </section>
          <section class="spec-block">
            <h2>批次量測資料</h2>
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

  function renderRequest(){
 const material=materialById(state.route.params.material);
 return `<section class="panel"><h1>材料與加工洽詢</h1><p>請提供材料名稱、用途、目標規格、數量及交期。可在郵件內附上規格書或樣品照片。</p><form id="request-form"><label>材料或加工項目<input required name="material" value="${escapeHtml(material?.name||"")}"></label><label>用途與需求規格<textarea required name="spec"></textarea></label><label>需求數量與交期<input required name="qty"></label><button class="btn btn-ink">開啟郵件草稿</button><p>請在郵件程式中確認並寄出。也可直接寄至 <a href="mailto:contact@hoyao.com">contact@hoyao.com</a>。</p></form></section>`;
}
function renderPassportLookup(){return '<section class="panel"><h1>批次護照</h1><p>目前尚無公開批次。若您已取得樣品，請提供標籤上的編號或照片，由和曜協助核對來源、加工與量測紀錄。</p><a class="btn btn-ink" href="mailto:contact@hoyao.com?subject=批次資料洽詢">洽詢批次資料</a></section>'}
function renderAbout(){return '<section class="panel"><h1>關於和曜材料櫃台</h1><p>和曜應用科技股份有限公司從南投的農業副產物與竹木加工剩料出發，協助研發與採購團隊選料、找樣，並依粒徑、含水率與包裝需求協調加工。</p><p>營運與展示據點｜南投中興新村</p><a class="btn btn-ink" href="#/request">聯絡材料櫃台</a></section>'}
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
    else if (name === "cases") html = renderRequest();
    else if (name === "passport-lookup") html = renderPassportLookup();
    else if (name === "passport") html = renderPassportLookup();
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

    const form=document.querySelector("#request-form");
    if(form)form.onsubmit=e=>{e.preventDefault();const f=new FormData(form);const body=["材料："+f.get("material"),"用途與規格："+f.get("spec"),"數量與交期："+f.get("qty")].join("\n");location.href="mailto:contact@hoyao.com?subject="+encodeURIComponent("材料洽詢｜"+f.get("material"))+"&body="+encodeURIComponent(body)};
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
