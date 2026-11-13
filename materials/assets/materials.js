(() => {
  const NOTE_KEY = "hoyaoMaterialsNoteDismissed_v2";

  const state = {
    catalog: null,
    batches: null,
    route: { name: "home", params: {} },
    filters: { q: "", kind: "全部", form: "全部", status: "全部" },
    filtersOpen: false,
  };

  const el = {
    app: document.querySelector("#app"),
    navMobile: document.querySelector("#nav-mobile"),
    menuToggle: document.querySelector("#menu-toggle"),
    softNote: document.querySelector("#soft-note"),
    softNoteClose: document.querySelector("#soft-note-close"),
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const statusClass = (status) => `badge badge-status-${status}`;


  const sectionTitles = { factory: "加工廠", map: "材料地圖", school: "材料學堂" };

  function renderFactory() {
    const steps = [
      ["破碎", "原料尺寸、最長邊與預期碎片大小"],
      ["烘乾", "來料的乾濕狀況、目標含水率與包裝方式"],
      ["研磨", "預期用途、目標細度與試作量"],
      ["篩分", "想保留的粒徑範圍，以及是否需要分級留樣"],
      ["造粒", "成品用途、顆粒尺寸與原料組成"],
      ["燃料棒成型", "原料來源、成型尺寸與後續使用條件"]
    ];
    return `<section class="panel field-page">
      <h1>加工廠</h1><p class="lead">手上的剩料，下一步可以怎麼處理？先選製程，帶著你的原料與規格來討論。各項服務依來料條件與合作產能評估。</p>
      <figure class="field-photo"><img src="assets/img/sieve-workbench.webp" alt="篩分設備情境示意"><figcaption>篩分設備情境示意</figcaption></figure>
      <div class="field-grid">${steps.map(([name, prompt]) => `<article><h2>${name}</h2><p>洽詢前可準備：${prompt}。</p><a href="#/request?process=${encodeURIComponent(name)}">洽詢${name} →</a></article>`).join("")}</div>
    </section>`;
  }

  function renderMap() {
    const localMaterials = state.catalog.materials.filter(m => m.origin === "竹山");
    return `<section class="panel field-page"><h1>材料地圖</h1>
      <p class="lead">目前收錄南投縣竹山鎮的竹屑與竹絲。點選產地可以查看材料紀錄，也歡迎提供其他鄉鎮的材料線索。</p>
      <div class="town-layout"><svg class="town-map" viewBox="0 0 300 420" role="group" aria-label="台灣本島材料地圖，目前收錄竹山鎮">
        <title>材料收錄地點</title><polygon points="135.9,316.8 124.7,343.3 122.8,369.4 119.0,393.2 104.0,381.4 95.8,350.6 83.0,336.4 66.6,324.8 62.3,316.0 50.0,277.8 43.3,264.7 43.6,251.7 49.3,231.1 48.2,203.2 98.0,112.4 118.6,85.5 131.4,62.9 144.5,47.8 180.0,27.6 194.4,24.7 203.7,35.0 220.3,43.5 227.9,57.9 217.0,74.3 217.6,94.5 208.7,133.6 196.3,159.2 187.6,201.5 174.7,256.0 164.6,278.7 135.9,316.8" fill="#d1ddc9" stroke="#899e84" stroke-width="1.5"/>
        <a href="#/map/zhushan" aria-label="查看竹山鎮材料"><circle cx="102" cy="192" r="17" fill="#ad5527" opacity=".18"/><circle cx="102" cy="192" r="7" fill="#9a431b"/><rect x="116" y="175" width="86" height="33" rx="4" fill="#244431"/><text x="159" y="197" text-anchor="middle" fill="white" font-size="16">竹山鎮</text></a>
      </svg><div><p class="section-label">南投縣</p><h2>竹山鎮</h2><p>竹材加工留下的屑片與絲狀纖維，可以保留原貌供研究，也可以評估進一步研磨。</p>
      <a class="btn btn-ink" href="#/map/zhushan">查看竹山材料</a>
      ${state.route.params.town === "zhushan" ? `<section class="town-record"><h3>竹山材料紀錄</h3>${localMaterials.map(m => `<p><a href="#/material/${encodeURIComponent(m.id)}">${escapeHtml(m.name)} →</a></p>`).join("")}<a href="#/supply?origin=竹山">補充竹山的材料 →</a></section>` : ""}
      </div></div><a class="text-link" href="#/supply">提供其他鄉鎮的材料 →</a></section>`;
  }

  function renderSchool() {
    return `<article class="panel field-page"><p class="section-label">材料學堂・送樣指南</p><h1>手上有一袋竹屑，送樣前要記錄什麼？</h1>
      <p class="lead">讓收樣的人看得懂這袋材料從哪裡來、長什麼樣，以及你想拿它做什麼。</p>
      <div class="field-grid">
        <section><h2>記下來源</h2><p>寫下鄉鎮、日期與產生剩料的工序。若混有不同來源，請分袋標示。</p></section>
        <section><h2>拍下樣貌</h2><p>拍一張整袋照，再取少量平鋪，旁邊放尺拍近照。把可見的碎片、纖維或雜物一起記下。</p></section>
        <section><h2>標示乾濕與數量</h2><p>記錄是否曾淋雨、烘乾或露天存放。寫明實秤重量或估計袋數；若有含水率量測，再附數值和日期。</p></section>
        <section><h2>說明送樣目的</h2><p>例如「希望保留長纖維」或「想研磨成板材填料」。如果還在找用途，先提供材料現況即可。</p></section>
      </div><div class="form-actions"><a class="btn btn-ink" href="#/supply">提供材料</a><a class="btn btn-line" href="#/factory">查看加工方式</a></div></article>`;
  }

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [path, query = ""] = raw.split("?");
    const parts = path.split("/").filter(Boolean);
    const params = Object.fromEntries(new URLSearchParams(query));
    if (!parts.length) return { name: "home", params };
    if (Object.hasOwn(sectionTitles, parts[0])) return { name: parts[0], params: { ...params, town: parts[1] } };
    if (parts[0] === "catalog") return { name: "catalog", params };
    if (parts[0] === "material" && parts[1]) return { name: "material", params: { ...params, id: parts[1] } };
    if (parts[0] === "request") return { name: "request", params: { ...params, material: parts[1] || params.material || "" } };
    if (parts[0] === "supply") return { name: "supply", params };
    if (parts[0] === "cases") return { name: "request", params };
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
      supply: "supply",
      passport: "passport",
      "passport-lookup": "passport",
      about: "about",
    };
    const key = map[name] || name;
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
    return state.batches?.batches?.find((b) => b.id === id);
  }

  function filteredMaterials() {
    const q = state.filters.q.trim().toLowerCase();
    return state.catalog.materials.filter((m) => {
      if (state.filters.kind !== "全部" && m.kind !== state.filters.kind) return false;
      if (state.filters.form !== "全部" && !(m.forms || [m.form]).includes(state.filters.form)) return false;
      if (state.filters.status !== "全部" && m.supplyStatus !== state.filters.status) return false;
      if (!q) return true;
      const hay = [m.name, m.subtitle, m.summary, m.feedstock, m.kind, m.origin, ...(m.forms || [m.form]), ...(m.applications || [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function activeFilterCount() {
    let n = state.filters.kind === "全部" ? 0 : 1;
    if (state.filters.form !== "全部") n += 1;
    if (state.filters.status !== "全部") n += 1;
    return n;
  }

  function cardHtml(m, { compact = false } = {}) {
    return `
      <a class="card${compact ? " card-plate" : ""}" href="#/material/${encodeURIComponent(m.id)}">
        <figure class="media-frame">
          <img src="${escapeHtml(m.image)}" alt="${escapeHtml(m.name)}形態" loading="lazy" width="1200" height="1500">
        </figure>
        <div class="card-body">
          <p class="card-meta-line">
            <span class="${statusClass(m.supplyStatus)}"><i></i>${escapeHtml(m.supplyStatus)}</span>
            <span class="sep" aria-hidden="true">·</span>
            <span>${escapeHtml([m.kind, ...(m.forms || [m.form])].filter(Boolean).join(" · "))}</span>
          </p>
          <h3>${escapeHtml(m.name)}</h3>
          ${compact ? "" : `<p>${escapeHtml(m.subtitle)}</p>`}
          ${compact ? "" : `<span class="card-origin">${escapeHtml(m.origin)}</span>`}
        </div>
      </a>
    `;
  }

  function renderHome() {
    const featured = state.catalog.materials;
    return `
      <section class="hero fade-in" aria-labelledby="hero-brand">
        <div class="hero-media" aria-hidden="true">
          <img src="assets/img/hero-atmosphere.webp" width="1280" height="720" alt="" fetchpriority="high">
        </div>
        <div class="hero-scrim" aria-hidden="true"></div>
        <div class="hero-copy">
          <h1 id="hero-brand" class="hero-brand">地方材料補給站</h1>
          <p class="hero-lead">從南投出發，記錄地方剩料，串連加工與再利用。</p>
          <p class="station-credit">和曜應用科技發起</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/catalog">逛材料圖鑑</a>
            <a class="station-link" href="#/request">找加工</a>
            <a class="station-link" href="#/supply">提供材料</a>
          </div>
        </div>
      </section>

      <section class="section station-story" aria-labelledby="value-title">
        <h2 id="value-title">這袋料，下一個用得上它的人找得到嗎？</h2>
        <p>木工留下的刨花、泡茶後的茶渣、碾米留下的稻殼，都有一個熟悉它的人。但有一天，另一個地方的人想拿它試做一件東西，光知道原料名字，還找不到合適的樣品。</p>
        <p>所以我們替每份材料記下兩件事：它從什麼原料來，現在是什麼樣子。以竹材為例，竹料、竹片、竹粉、竹粒同出一源，拿在手裡卻是四種不同的選擇。</p>
        <h3>從一袋剩料，到一次試作</h3>
        <ol class="value-path">
          <li><strong>記下來源</strong><span>工坊說明竹屑來自哪道工序，每次約有幾袋。</span></li>
          <li><strong>看見材料</strong><span>把材料外觀與型態整理成材料卡，讓訪客看外觀、查來源、索樣。</span></li>
          <li><strong>討論加工</strong><span>依用途評估保留纖維或研磨成粉，再確認粒徑與乾濕條件。</span></li>
          <li><strong>驗證用途</strong><span>由需求方拿樣試作，判斷是否適合板材填充等應用。</span></li>
        </ol>
        <a class="text-link" href="#/material/bamboo-shavings">第一個地方故事：竹山的竹屑與竹絲 →</a>
      </section>
      <section class="section station-story" aria-labelledby="resource-title">
        <h2 id="resource-title">你可以在這裡找到哪些資源？</h2>
        <dl class="resource-rows">
          <div><dt>工坊、農友</dt><dd>有剩料，想找用途</dd><dd><a href="#/supply">提供材料 →</a></dd></div>
          <div><dt>企業、研發團隊</dt><dd>找樣品，或討論客製規格</dd><dd><a href="#/catalog">查材料圖鑑</a> · <a href="#/factory">找加工</a></dd></div>
          <div><dt>公所、社區與公益組織</dt><dd>盤點在地資源，補充鄉鎮材料線索</dd><dd><a href="#/map">看材料地圖 →</a></dd></div>
          <div><dt>學校、初次送樣者</dt><dd>學會觀察、拍照與記錄一份樣品</dd><dd><a href="#/school">讀送樣指南 →</a></dd></div>
        </dl>
      </section>
      <section class="station-feature"><div><p class="section-label">南投・竹山</p><h2>材料地圖</h2><p>第一站，南投竹山。從一把竹屑，認識家鄉的材料。</p></div><a class="btn btn-line" href="#/map">探索材料地圖 →</a></section>
      <section class="section fade-in" aria-labelledby="feature-title">
        <div class="section-head">
          <p class="section-label">Materials</p>
          <h2 id="feature-title">圖鑑選材</h2>
        </div>
        <div class="catalog-grid catalog-grid-plates">${featured.map((m) => cardHtml(m, { compact: true })).join("")}</div>
        <p class="section-more"><a class="text-link" href="#/catalog">查看全部材料</a></p>
      </section>
    `;
  }

  function filterPanelHtml(forms, statuses) {
    return `
      <div class="filter-panel ${state.filtersOpen ? "is-open" : ""}" id="filter-panel">
        <div class="filter-group">
          <p class="filter-label">原料種類</p>
          <div class="chips" role="group" aria-label="原料種類">${["全部", ...new Set(state.catalog.materials.map(m => m.kind).filter(Boolean))].map(k => `<button type="button" class="chip" data-filter-kind="${escapeHtml(k)}" aria-pressed="${state.filters.kind === k}">${escapeHtml(k)}</button>`).join("")}</div>
        </div><div class="filter-group">
          <p class="filter-label">材料型態</p>
          <div class="chips" role="group" aria-label="型態">
            ${forms
              .map(
                (f) =>
                  `<button type="button" class="chip" data-filter-form="${escapeHtml(f)}" aria-pressed="${
                    state.filters.form === f
                  }">${escapeHtml(f)}</button>`
              )
              .join("")}
          </div>
        </div>
        <div class="filter-group">
          <p class="filter-label">供應狀態</p>
          <div class="chips" role="group" aria-label="供應狀態">
            ${statuses
              .map(
                (s) =>
                  `<button type="button" class="chip" data-filter-status="${escapeHtml(s)}" aria-pressed="${
                    state.filters.status === s
                  }">${escapeHtml(s)}</button>`
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderCatalog() {
    const items = filteredMaterials();
    const forms = ["全部", ...new Set(state.catalog.materials.flatMap(m => m.forms || [m.form]))];
    const statuses = ["全部", ...state.catalog.filters.statuses];
    const filterN = activeFilterCount();
    return `
      <header class="page-hero page-hero-catalog fade-in">
        <nav class="breadcrumb"><a href="#/">首頁</a> / 材料圖鑑</nav>
        <div class="page-hero-row">
          <div>
            <h1>地方材料圖鑑</h1><p>按原料與型態交叉查找，例如「竹材 × 粉末」。各分類依實際收錄逐步上架。</p>
          </div>
          <p class="result-count" id="result-count" aria-live="polite">${items.length} 項</p>
        </div>
      </header>
      <div class="toolbar fade-in">
        <div class="search">
          <label class="visually-hidden" for="q">搜尋材料</label>
          <input id="q" type="search" placeholder="搜尋名稱、用途、料源…" value="${escapeHtml(state.filters.q)}" />
        </div>
        <button type="button" class="filter-toggle" id="filter-toggle" aria-expanded="${
          state.filtersOpen ? "true" : "false"
        }" aria-controls="filter-panel">
          篩選${filterN ? ` · ${filterN}` : ""}
        </button>
      </div>
      ${filterPanelHtml(forms, statuses)}
      <div class="catalog-grid catalog-grid-plates fade-in" id="catalog-grid">
        ${
          items.length
            ? items.map((m) => cardHtml(m, { compact: true })).join("")
            : '<div class="empty">目前沒有符合條件的公開品項。<a href="#/request">洽詢找料</a> · <button type="button" class="text-btn" id="clear-filters">清除篩選</button></div>'
        }
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
      <header class="page-hero page-hero-compact fade-in">
        <nav class="breadcrumb"><a href="#/">首頁</a> / <a href="#/catalog">材料圖鑑</a> / ${escapeHtml(m.name)}</nav>
      </header>
      <article class="detail-layout fade-in">
        <div class="detail-media">
          <figure class="media-frame">
            <img src="${escapeHtml(({"bamboo-powder":"assets/img/powder-macro.webp","bamboo-shavings":"assets/img/shavings-macro.webp"})[m.id] || m.image)}" alt="${escapeHtml(m.name)}形態示意" width="1200" height="1500">
          </figure>
          <figcaption>${escapeHtml(m.feedstock)} · 材料形態示意</figcaption>
        </div>
        <div class="detail-body">
          <p class="card-meta-line">
            <span class="${statusClass(m.supplyStatus)}"><i></i>${escapeHtml(m.supplyStatus)}</span>
            <span class="sep" aria-hidden="true">·</span>
            <span>${escapeHtml(m.form)}</span>
          </p>
          <h1>${escapeHtml(m.name)}</h1>
          <p class="detail-kicker">${escapeHtml(m.subtitle)}</p>
          <p class="detail-lead">${escapeHtml(m.summary)}</p>
          <p class="status-note">${escapeHtml(m.statusNote)}</p>

          <section class="spec-block">
            <h2>客戶指定／試單規格</h2>
            ${rowsHtml(m.customerSpec)}
          </section>
          <section class="spec-block">
            <h2>實際量測</h2>
            ${
              m.measured?.length
                ? rowsHtml(m.measured)
                : '<p class="form-hint">尚無儀器量測值。交付批次建立後寫入護照；此前維持待確認。</p>'
            }
          </section>
          <section class="spec-block">
            <h2>待確認</h2>
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
                  .map((b) => `<li><a href="#/passport/${encodeURIComponent(b.id)}">${escapeHtml(b.id)}</a></li>`)
                  .join("")}</ul></section>`
              : ""
          }
          <div class="detail-actions detail-actions-inline">
            <a class="btn btn-ink" href="#/request/${encodeURIComponent(m.id)}">索樣／洽詢此材料</a>
            <a class="btn btn-line" href="#/catalog">返回圖鑑</a>
          </div>
        </div>
      </article>
      <div class="detail-bar" role="region" aria-label="材料行動">
        <div class="detail-bar-inner">
          <div class="detail-bar-copy">
            <strong>${escapeHtml(m.name)}</strong>
            <span>${escapeHtml(m.supplyStatus)} · ${escapeHtml(m.form)}</span>
          </div>
          <a class="btn btn-ink" href="#/request/${encodeURIComponent(m.id)}">索樣／洽詢</a>
        </div>
      </div>
    `;
  }

  function renderRequest() {
    const supply = state.route.name === "supply";
    const title = supply ? "提供材料" : "找加工";
    const material = materialById(state.route.params.material);
    return `
      <div class="panel panel-form fade-in">
        <nav class="breadcrumb"><a href="#/">首頁</a> / ${title}</nav>
        <h1>${title}</h1>
        <p class="lead">${supply ? "農友、加工廠、社區或公部門都可以提供材料線索。請告訴我們哪裡有剩料、目前的樣貌，以及大約的數量。" : "可洽詢破碎、烘乾、研磨、篩分、造粒或燃料棒成型。請描述原料和預期用途，由團隊確認適用製程與試作條件。"}</p>
        <form id="request-form" class="form-stack">
          <label>${supply ? "材料名稱" : "材料或加工項目"}
            <input required name="material" value="${escapeHtml(material?.name || state.route.params.process || "")}" placeholder="例如：竹粉">
          </label>
          <label>${supply ? "來源地與材料現況" : "預期用途與加工規格"}
            <textarea required name="spec" placeholder="${supply ? "例如：竹山竹器加工剩下的竹屑，已裝袋" : "例如：想將竹屑研磨成粉，用於複材填料試作"}">${supply && state.route.params.origin ? escapeHtml(state.route.params.origin) + "・" : ""}</textarea>
          </label>
          <label>${supply ? "可提供的數量與頻率" : "需求數量與交期"}
            <input required name="qty" placeholder="${supply ? "例如：每月約 5 袋，重量待確認" : "例如：50 公斤，希望 12 月中試作"}">
          </label>
          <div class="form-actions">
            <button class="btn btn-ink" type="submit">開啟郵件草稿</button>
            <a class="btn btn-line" href="mailto:contact@hoyao.com">直接寄信</a>
          </div>
          <p class="form-hint">請在郵件程式中確認後寄出。收件：contact@hoyao.com</p>
        </form>
      </div>
    `;
  }

  function renderPassportLookup() {
    return `
      <div class="panel panel-passport fade-in">
        <nav class="breadcrumb"><a href="#/">首頁</a> / 批次護照</nav>
        <p class="section-label">Batch passport</p>
        <h1>批次護照</h1>
        <p class="lead">目前尚無公開批次頁。若您已取得樣品，請提供標籤編號或照片，由和曜協助核對來源、加工與量測紀錄。</p>
        <div class="passport-cta">
          <a class="btn btn-ink" href="mailto:contact@hoyao.com?subject=%E6%89%B9%E6%AC%A1%E8%B3%87%E6%96%99%E6%B4%BD%E8%A9%A2">洽詢批次資料</a>
          <a class="btn btn-line" href="#/catalog">先瀏覽材料</a>
        </div>
      </div>
    `;
  }

  function renderAbout() {
    return `
      <div class="panel fade-in">
        <nav class="breadcrumb"><a href="#/">首頁</a> / 關於</nav>
        <h1>關於地方材料補給站</h1>
        <p class="lead">和曜應用科技股份有限公司從南投的農業副產物與竹木加工剩料出發，協助研發與採購團隊選料、找樣，並依粒徑、含水率與包裝需求協調加工。</p>
        <section class="spec-block">
          <h2>服務內容</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:16px"><figure style="margin:0"><img src="assets/img/sample-room.webp" alt="樣品整理空間情境" loading="lazy" style="width:100%;display:block"><figcaption>樣品整理｜空間情境示意</figcaption></figure><figure style="margin:0"><img src="assets/img/sieve-workbench.webp" alt="篩分設備情境" loading="lazy" style="width:100%;display:block"><figcaption>粒徑分級｜設備情境示意</figcaption></figure></div>
          <ul class="plain-list">
            <li>依用途探索地方循環材料形態與供應狀態</li>
            <li>確認規格，並區分客戶指定、實測與待確認項目</li>
            <li>協調去雜、乾燥、研磨、篩分與分裝</li>
            <li>樣品備製與後續供應洽詢</li>
          </ul>
        </section>
        <section class="spec-block">
          <h2>據點與聯絡</h2>
          <p>營運與展示據點｜南投中興新村</p>
          <p class="form-hint">企業加工需求、地方材料盤點與社區合作，均可來信聯絡。</p>
          <div class="form-actions">
            <a class="btn btn-ink" href="mailto:contact@hoyao.com">contact@hoyao.com</a>
            <a class="btn btn-line" href="#/request">找加工</a>
            <a class="btn btn-line" href="https://hoyao.com/">公司官網</a>
          </div>
        </section>
      </div>
    `;
  }

  function pageTitle(name, params) {
    const base = "地方材料補給站";
    if (sectionTitles[name]) return `${sectionTitles[name]}｜${base}`;
    if (name === "catalog") return `地方材料圖鑑｜${base}`;
    if (name === "material") {
      const m = materialById(params.id);
      return m ? `${m.name}｜${base}` : `材料｜${base}`;
    }
    if (name === "supply") return `提供材料｜${base}`;
    if (name === "request") return `找加工｜${base}`;
    if (name === "passport" || name === "passport-lookup") return `批次護照｜${base}`;
    if (name === "about") return `關於｜${base}`;
    return base;
  }

  function refreshCatalogGrid() {
    const grid = document.querySelector("#catalog-grid");
    const count = document.querySelector("#result-count");
    if (!grid) return;
    const items = filteredMaterials();
    if (count) count.textContent = `${items.length} 項`;
    grid.innerHTML = items.length
      ? items.map((m) => cardHtml(m, { compact: true })).join("")
      : '<div class="empty">目前沒有符合條件的公開品項。<a href="#/request">洽詢找料</a> · <button type="button" class="text-btn" id="clear-filters">清除篩選</button></div>';
    document.querySelector("#clear-filters")?.addEventListener("click", () => {
      state.filters = { q: "", kind: "全部", form: "全部", status: "全部" };
      render();
    });
  }

  function bindViewEvents() {
    const q = document.querySelector("#q");
    if (q) {
      q.addEventListener("input", () => {
        state.filters.q = q.value;
        refreshCatalogGrid();
      });
    }

    document.querySelector("#filter-toggle")?.addEventListener("click", () => {
      state.filtersOpen = !state.filtersOpen;
      const panel = document.querySelector("#filter-panel");
      const btn = document.querySelector("#filter-toggle");
      panel?.classList.toggle("is-open", state.filtersOpen);
      btn?.setAttribute("aria-expanded", state.filtersOpen ? "true" : "false");
      const n = activeFilterCount();
      if (btn) btn.textContent = `篩選${n ? ` · ${n}` : ""}`;
    });

    document.querySelectorAll("[data-filter-kind]").forEach(btn => btn.addEventListener("click", () => {
      state.filters.kind = btn.dataset.filterKind;
      state.filtersOpen = true;
      render();
    }));
    document.querySelectorAll("[data-filter-form]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.filters.form = btn.dataset.filterForm;
        state.filtersOpen = true;
        render();
      });
    });
    document.querySelectorAll("[data-filter-status]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.filters.status = btn.dataset.filterStatus;
        state.filtersOpen = true;
        render();
      });
    });

    document.querySelector("#clear-filters")?.addEventListener("click", () => {
      state.filters = { q: "", kind: "全部", form: "全部", status: "全部" };
      render();
    });

    const form = document.querySelector("#request-form");
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const f = new FormData(form);
        const supply = state.route.name === "supply";
        const body = ["材料：" + f.get("material"), (supply ? "來源與現況：" : "用途與規格：") + f.get("spec"), (supply ? "數量與頻率：" : "數量與交期：") + f.get("qty")].join(
          "\n"
        );
        location.href =
          "mailto:contact@hoyao.com?subject=" +
          encodeURIComponent((supply ? "提供材料｜" : "材料與加工洽詢｜") + f.get("material")) +
          "&body=" +
          encodeURIComponent(body);
      };
    }
  }

  function render() {
    state.route = parseHash();
    // Desktop: keep filters open; mobile default closed unless user opened
    if (window.matchMedia("(min-width: 821px)").matches) state.filtersOpen = true;
    setActiveNav(state.route.name);
    closeMenu();
    const { name, params } = state.route;
    syncShellMode(name);
    let html = "";
    if (name === "home") html = renderHome();
    else if (name === "factory") html = renderFactory();
    else if (name === "map") html = renderMap();
    else if (name === "school") html = renderSchool();
    else if (name === "catalog") html = renderCatalog();
    else if (name === "material") html = renderMaterial(params.id);
    else if (name === "request" || name === "supply") html = renderRequest();
    else if (name === "passport-lookup" || name === "passport") html = renderPassportLookup();
    else if (name === "about") html = renderAbout();
    else html = renderHome();

    el.app.innerHTML = html;
    document.title = pageTitle(name, params);
    window.scrollTo(0, 0);
    bindViewEvents();
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

  function initNote() {
    /* Soft note stays hidden by default; quiet notice lives in About / footer only. */
    if (!el.softNote) return;
    el.softNote.hidden = true;
  }

  function syncShellMode(name) {
    document.body.classList.toggle("is-detail", name === "material");
    document.body.classList.toggle("is-home", name === "home");
  }

  async function init() {
    const data = await loadData();
    state.catalog = data.catalog;
    state.batches = data.batches || { batches: [] };
    initNote();

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
    el.app.innerHTML = `<div class="panel"><h1>無法載入資料</h1><p class="lead">${escapeHtml(err.message)}</p></div>`;
  });
})();
