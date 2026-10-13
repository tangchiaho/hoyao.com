# 南投縣地方型 SBIR（115 年度）｜官網納入提案與文案草稿

**狀態：** 草稿／配置建議；**等待確認後再上線**  
**分支：** `cursor/hoyao-4-phase1-audit-1db6`  
**關聯：** [`phase1-audit-and-proposal.md`](./phase1-audit-and-proposal.md)

---

## 1. 已核實資訊（官方來源）

| 項目 | 內容 | 來源 |
|------|------|------|
| 公告單位 | 南投縣政府建設處 | 官方新聞頁 |
| 公告日期 | 2026/09/03（民國 115/09/03） | 頁面標示 |
| 公告標題 | 115年度「地方產業創新研發推動計畫」（地方型SBIR）審查結果出爐，共有16家廠商獲補助 | 官方 |
| 申請／核定 | 全年度受理 26 件；核定 16 家；通過率 62% | 官方 |
| 和曜是否入選 | 是；名單載「和曜建材科技股份有限公司」 | 官方 |
| 現公司名稱 | 和曜應用科技股份有限公司 | 站內改名頁（2026-08-12 核准） |
| 官方來源 URL | https://www.nantou.gov.tw/big5/bureau/news_content.php?dptid=376480000au180000&cid=802&id=168394 | — |

### 明確不得寫入的內容

- **不得**將 16 家合計補助「1,177 萬 9,000 元」寫成和曜個別補助額  
- **不得**宣稱計畫已驗收、研發成果已取得認證、或已量產  
- **不得**擅自使用南投縣政府標誌／logo  
- 個別**計畫題目、補助金額、執行內容**：官方名單未逐案揭露 → 以「待確認」欄位保留，確認前不上具體數字或成果描述  

### 官方全文中與產業類別相關之表述（僅作背景，不改寫為和曜個案）

公告稱獲補助廠商多屬地方特色產業，研發重點涵蓋農業食品、觀光休憩、精密電子及生活工藝等。  
**不宜**在未確認和曜個別計畫題目前，將上述類別直接寫成和曜本案主題。

---

## 2. 全站配置建議（保留現有設計語言）

不大幅重構；沿用現有 `progress-item`、`update-row`、`page-hero`、`prose` 樣式。

### 2.1 建議新增檔案（確認後實作）

| 路徑 | 用途 |
|------|------|
| `/zh/updates/nantou-sbir-2026.html` | 中文最新動態文章 |
| `/en/updates/nantou-sbir-2026.html` | 英文最新動態文章 |
| `/zh/projects/nantou-sbir-2026.html` | 中文專案履歷 |
| `/en/projects/nantou-sbir-2026.html` | 英文專案履歷 |

並更新：

- `/`、`/zh/index.html`、`/en/index.html`（首頁精簡入口）  
- `/zh/projects.html`、`/en/projects.html`  
- `/zh/updates.html`、`/en/updates.html`  
- `/sitemap.xml`  

### 2.2 首頁｜精簡 SBIR 入口

放在「專案與進展」區塊，**與育成進駐並列或置於其前**（日期較新：2026.09）。  
建議只顯示一則精簡 `progress-item`（**無政府 logo、可不強制大圖**；若要圖，僅用現有中性企業影像或純文字列，避免誤用縣府標誌）。

**中文首頁列表稿：**

```html
<a class="progress-item" href="/zh/projects/nantou-sbir-2026.html">
  <div class="progress-meta">
    <span class="date"><time datetime="2026-09">2026.09</time></span>
    Grant · Nantou SBIR
  </div>
  <h3>獲選南投縣 115 年度地方型 SBIR 核定補助</h3>
  <p>南投縣政府公告 115 年度地方型 SBIR 審查結果，和曜名列核定補助廠商。詳見專案履歷與官方公告。</p>
</a>
```

**英文首頁列表稿：**

```html
<a class="progress-item" href="/en/projects/nantou-sbir-2026.html">
  <div class="progress-meta">
    <span class="date"><time datetime="2026-09">2026.09</time></span>
    Grant · Nantou SBIR
  </div>
  <h3>Selected for Nantou County’s 2026 Local SBIR program</h3>
  <p>HOYAO is listed among firms approved in Nantou County’s announced 2026 Local SBIR results. See the project page and official notice.</p>
</a>
```

首頁「最新動態」可加一則文字列（無縮圖亦可），指向 updates 文章；避免與專案區重複堆疊過長敘事——**建議首頁專案區 1 則 + 動態區 1 則短列**即可。

### 2.3 專案與進展列表

在竹山、育成之外新增第三則（或依時間：SBIR → 竹山 → 育成）。  
列表文案同上，連到專案履歷頁。

### 2.4 與公司名稱變更頁的連結

三處互相連結：

1. SBIR 動態／專案文內：「公告使用舊名…」→ `/zh/updates/company-name-change.html`  
2. 公司名稱變更頁底部「相關」→ SBIR 動態與專案頁  
3. About 改名段落实作階段可加一句「其後並獲地方型 SBIR 核定（公告仍載舊名）」並連過去（可選）

### 2.5 官方來源

文章與專案頁皆提供可點擊的完整官方 URL，`target="_blank" rel="noopener noreferrer"`，並以文字標示「南投縣政府建設處｜官方公告」，**不用 logo**。

---

## 3. 中文｜最新動態文章草稿

**建議路徑：** `/zh/updates/nantou-sbir-2026.html`  
**建議發布日：** `2026-09-03`（對齊公告日）或站內上線日（實作時二選一，需一致）

### SEO

| 欄位 | 建議 |
|------|------|
| `<title>` | 獲選南投縣 115 年度地方型 SBIR 核定補助｜和曜應用科技股份有限公司 |
| `description` | 南投縣政府 2026/09/03 公告 115 年度地方型 SBIR 審查結果，和曜（公告載舊名和曜建材科技股份有限公司）名列核定補助廠商。 |
| `canonical` | `https://hoyao.com/zh/updates/nantou-sbir-2026.html` |
| `hreflang` | zh-Hant ↔ en 對應頁；x-default → `https://hoyao.com/` |
| `og:type` | `article` |
| `og:image` | 沿用站內 `og-image.png`（**不用縣府標誌**） |
| `article:published_time` | `2026-09-03` |

### 頁面結構草稿

**Eyebrow：** `Update · 2026.09.03`  
**H1：** 獲選南投縣 115 年度地方型 SBIR 核定補助  

**Lead：**  
南投縣政府建設處於 2026 年 9 月 3 日公告 115 年度「地方產業創新研發推動計畫」（地方型 SBIR）審查結果。公告顯示全年度受理 26 件申請、核定 16 家廠商，通過率 62%；名單包含和曜（公告記載為「和曜建材科技股份有限公司」）。

**正文：**

南投縣政府表示，辦理地方型 SBIR 旨在鼓勵縣內中小企業加強創新研發，協助產業進步與發展。115 年度審查結果已於官方新聞專區公告。

和曜於公告名單中以「和曜建材科技股份有限公司」記載。公司名稱已於 2026 年 8 月 12 日正式核准變更為「和曜應用科技股份有限公司」。有關名稱變更說明，請見：[公司名稱正式變更為和曜應用科技股份有限公司](./company-name-change.html)。

本案個別計畫題目、補助金額與執行內容，待內部資料確認後再行補充；本頁僅陳述官方已公告之核定事實，不涉及驗收狀態或認證結果。

更多說明請見專案履歷：[南投縣 115 年度地方型 SBIR](../projects/nantou-sbir-2026.html)。

**官方來源：**  
[南投縣政府建設處｜115 年度地方型 SBIR 審查結果公告](https://www.nantou.gov.tw/big5/bureau/news_content.php?dptid=376480000au180000&cid=802&id=168394)

### JSON-LD（Article）草稿

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首頁",
          "item": "https://hoyao.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "最新動態",
          "item": "https://hoyao.com/zh/updates.html"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "獲選南投縣 115 年度地方型 SBIR 核定補助",
          "item": "https://hoyao.com/zh/updates/nantou-sbir-2026.html"
        }
      ]
    },
    {
      "@type": "NewsArticle",
      "headline": "獲選南投縣 115 年度地方型 SBIR 核定補助",
      "datePublished": "2026-09-03",
      "dateModified": "2026-09-03",
      "inLanguage": "zh-Hant",
      "mainEntityOfPage": "https://hoyao.com/zh/updates/nantou-sbir-2026.html",
      "author": {
        "@type": "Organization",
        "name": "和曜應用科技股份有限公司",
        "alternateName": ["和曜", "HOYAO", "HOYAO APPLIED TECHNOLOGIES"]
      },
      "publisher": {
        "@type": "Organization",
        "name": "和曜應用科技股份有限公司",
        "logo": {
          "@type": "ImageObject",
          "url": "https://hoyao.com/assets/logo/hoyao-wordmark.svg"
        }
      },
      "description": "南投縣政府公告 115 年度地方型 SBIR 審查結果，和曜名列核定補助廠商。",
      "about": [
        "地方型SBIR",
        "南投縣政府",
        "和曜應用科技股份有限公司"
      ],
      "citation": "https://www.nantou.gov.tw/big5/bureau/news_content.php?dptid=376480000au180000&cid=802&id=168394"
    }
  ]
}
```

---

## 4. English｜Updates article draft

**Path:** `/en/updates/nantou-sbir-2026.html`

### SEO

| Field | Draft |
|------|------|
| `<title>` | Selected for Nantou County 2026 Local SBIR｜HOYAO APPLIED TECHNOLOGIES |
| `description` | On 3 September 2026, Nantou County Government announced 2026 Local SBIR results. HOYAO is listed among approved firms (announcement uses the former company name). |
| `canonical` | `https://hoyao.com/en/updates/nantou-sbir-2026.html` |
| `hreflang` | en ↔ zh-Hant pair |
| `og:type` | `article` |
| `article:published_time` | `2026-09-03` |

### Copy draft

**Eyebrow:** `Update · 2026.09.03`  
**H1:** Selected for Nantou County’s 2026 Local SBIR program  

**Lead:**  
On 3 September 2026, the Construction Department of Nantou County Government announced the review results of the 2026 “Local Industry Innovation R&D Promotion Program” (Local SBIR). The notice states that 26 applications were received and 16 firms were approved (62% approval rate). The published list includes HOYAO under the former name 和曜建材科技股份有限公司.

**Body:**  
According to the county government, Local SBIR aims to encourage innovation and R&D among local SMEs. The 2026 results are published on the official news page.

HOYAO appears on the announced list as 和曜建材科技股份有限公司. The company’s registered name was formally changed to 和曜應用科技股份有限公司 on 12 August 2026. See: [Company name formally changed to HOYAO Applied Technologies](./company-name-change.html).

The specific project title, individual grant amount, and detailed scope for HOYAO will be added after internal confirmation. This page states only what the official announcement confirms and does not claim project acceptance, certification, or completed deliverables.

Project record: [Nantou County 2026 Local SBIR](../projects/nantou-sbir-2026.html).

**Official source:**  
[Nantou County Government｜2026 Local SBIR results notice](https://www.nantou.gov.tw/big5/bureau/news_content.php?dptid=376480000au180000&cid=802&id=168394)

### JSON-LD

Mirror the Chinese `NewsArticle` graph with `inLanguage: "en"`, English headline/description, and English breadcrumb labels; keep the same `citation` URL.

---

## 5. 專案履歷頁草稿（中／英）

**路徑：**  
- `/zh/projects/nantou-sbir-2026.html`  
- `/en/projects/nantou-sbir-2026.html`

### 5.1 頁面區塊（中文）

**Eyebrow：** `2026.09 · Projects & Progress`  
**H1：** 南投縣 115 年度地方型 SBIR 核定補助  

**Lead：**  
和曜名列南投縣政府公告之 115 年度地方型 SBIR 核定補助廠商。本頁整理可公開事實、名稱對照與待確認欄位。

#### 可公開事實

- 計畫名稱（計畫體系）：地方產業創新研發推動計畫（地方型 SBIR）  
- 年度：115 年度（2026）  
- 公告單位：南投縣政府建設處  
- 公告日期：2026/09/03  
- 全年度：26 件申請、16 家核定、通過率 62%  
- 和曜：列入核定補助名單  

#### 名稱對照

| 公告記載 | 現況 |
|----------|------|
| 和曜建材科技股份有限公司 | 已於 2026/08/12 核准變更為 **和曜應用科技股份有限公司** |

→ 連結：[公司名稱變更說明](../updates/company-name-change.html)

#### 待確認（確認前顯示「待補充」，不上具體值）

| 欄位 | 狀態 |
|------|------|
| 個別計畫題目／計畫名稱（和曜案） | 待確認 |
| 個別補助金額 | 待確認（**不引用** 16 家合計 1,177.9 萬元） |
| 執行期間 | 待確認 |
| 執行內容／研發重點摘要 | 待確認 |
| 可公開之階段說明（執行中／尚未結案等） | 待確認 |

#### 聲明（建議固定置於頁尾）

本頁僅依據南投縣政府已公開之審查結果公告。未經驗證之個別金額、技術數據、驗收或認證結果不予刊登。本頁不使用南投縣政府標誌。

#### 相關連結

- [最新動態：獲選公告說明](../updates/nantou-sbir-2026.html)  
- [公司名稱變更](../updates/company-name-change.html)  
- [中興新村地方創生育成村進駐](./nantou-incubator.html)  
- 官方來源（完整 URL）

### 5.2 English project page（對照）

**H1:** Nantou County 2026 Local SBIR approval  

**Lead:** HOYAO is listed among firms approved in Nantou County’s announced 2026 Local SBIR results. This page records confirmed public facts, the company-name mapping, and fields pending confirmation.

**Confirmed facts / Name mapping / Pending fields / Disclaimer / Related links** — mirror the Chinese structure.  
Pending table must explicitly say the aggregate NT$11.779 million figure is **not** HOYAO’s individual amount and must not be shown as such.

### 5.3 專案頁 JSON-LD

使用 `@type: Article`（或 `WebPage` + `Article`），含：

- `headline`、`datePublished: 2026-09-03`  
- `about`: Local SBIR, Nantou, HOYAO  
- `citation`: 官方 URL  
- `publisher` / `author`: 和曜應用科技股份有限公司  
- BreadcrumbList：首頁 → 專案與進展 → 本頁  

---

## 6. 列表頁／改名頁｜短文案

### `/zh/updates.html` 新增列（置頂或依日期 2026.09）

- **2026.09**｜獲選南投縣 115 年度地方型 SBIR 核定補助  
- 摘要：南投縣政府公告審查結果，和曜名列核定補助廠商；公告載舊公司名稱。  

### `/en/updates.html`

- **2026.09**｜Selected for Nantou County 2026 Local SBIR  
- Summary: Listed among approved firms in the county’s official notice; announcement uses the former company name.  

### 公司名稱變更頁加「相關」

中文建議句：  
「名稱變更後，南投縣政府 115 年度地方型 SBIR 核定公告仍記載舊公司名稱。說明見：[地方型 SBIR 核定](./nantou-sbir-2026.html)／[專案履歷](../projects/nantou-sbir-2026.html)。」

---

## 7. SEO／技術檢查清單（實作時）

- [ ] 中英 `canonical` + `hreflang` 成對  
- [ ] `NewsArticle`／`Article` JSON-LD 通過驗證（Rich Results 測試）  
- [ ] `sitemap.xml` 加入 4 個新 URL，`lastmod` ≥ 2026-09-03  
- [ ] OG／Twitter 使用站內 og-image，無縣府標誌  
- [ ] 全文搜尋「1177」「1,177」：除「說明為何不採用合計金額」之防呆註記外，**正面陳述不得出現為和曜金額**  
- [ ] 無「已驗收」「已認證」「通過 CNS／ISO…」等未確認字樣  
- [ ] 保留現有視覺：列表＋prose，不大改版型  

---

## 8. 待您確認後再上線的項目

請回覆：

1. **個別計畫題目**（若可公開）  
2. **個別補助金額**是否可公開；若否，維持「待補充」  
3. **執行期間／可公開摘要**  
4. 動態文章 `datePublished` 要用公告日 `2026-09-03` 或實際發佈日？  
5. 首頁 SBIR 入口要用純文字列，或可接受既有企業影像（非縣府 logo）？  
6. 是否同意依本草稿實作四頁＋列表更新（仍可先開 `/preview/` 若需要）  

---

## 9. 建議實作順序（確認後）

1. 建立中英 updates 文章 + Article JSON-LD  
2. 建立中英 projects 履歷頁  
3. 更新 updates／projects 列表與公司改名頁互鏈  
4. 首頁加入精簡 SBIR 入口  
5. 更新 sitemap  
6. 全文防呆檢查（合計金額、認證／驗收字樣、logo）  

**本文件完成前不會修改正式站頁面。**
