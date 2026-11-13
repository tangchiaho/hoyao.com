# 和曜地方循環材料供應平台（設計預覽）

路徑：`https://hoyao.com/materials/`

獨立於公司官網導覽。本目錄為可操作的第一版預覽：材料圖鑑、索樣／規格需求、案件追蹤、批次護照。

## 網站結構

| 路由 | 用途 |
|------|------|
| `#/` | 首頁：三條動線入口 |
| `#/catalog` | 材料圖鑑（搜尋／型態／供應狀態） |
| `#/material/{id}` | 材料詳頁（客戶指定／實測／待確認分開） |
| `#/request` 或 `#/request/{id}` | 提出找料／索樣需求 |
| `#/cases` | 我的案件（瀏覽器 localStorage） |
| `#/passport` | 輸入批次編號查詢 |
| `#/passport/{id}` | 批次護照 |
| `#/about` | 關於平台與上架說明 |

## 之後新增一筆材料

1. 編輯 `assets/data/catalog.json`，在 `materials` 陣列新增物件，至少包含：
   - `id`（網址用，英文短碼）
   - `name`、`subtitle`、`form`、`feedstock`、`origin`
   - `supplyStatus`：`可索樣`｜`可洽詢`｜`試作中`｜`規劃中`
   - `summary`、`statusNote`
   - `image`（建議放在 `assets/img/`）
   - `customerSpec` / `measured` / `pendingMeasures`（可為空陣列）
   - `processes`、`applications`
   - `relatedBatches`（批次 id 列表）
   - `demo: true`（展示期建議保留）
2. 若有樣品袋／可掃描標籤：在 `assets/data/batches.json` 新增護照，並把 `id` 寫入該材料的 `relatedBatches`。
3. 本地用靜態伺服器開啟 `/materials/` 驗證圖鑑與護照連結。
4. 正式收件上線前，再接後端與權限；現況表單不會送出伺服器。

### 最小範例

```json
{
  "id": "rice-husk-fines",
  "name": "稻殼細粉",
  "subtitle": "農業副產物 · 示範",
  "form": "粉末",
  "feedstock": "農業副產物",
  "origin": "南投",
  "supplyStatus": "規劃中",
  "statusNote": "示範品項。",
  "summary": "…",
  "image": "assets/img/yard-visit.jpg",
  "gallery": ["assets/img/yard-visit.jpg"],
  "processes": ["乾燥", "研磨"],
  "applications": ["填料評估"],
  "customerSpec": [],
  "measured": [],
  "pendingMeasures": ["粒徑", "含水率"],
  "relatedBatches": [],
  "demo": true
}
```

## 技術說明

- 靜態託管（GitHub Pages 友善）：HTML + CSS + JS + JSON。
- 案件存在 `localStorage` 鍵 `hoyaoMaterialsCases_v1`。
- 預覽期 `robots: noindex`；正式開放再改為 index 並寫入 sitemap。
