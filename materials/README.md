# 和曜地方循環材料供應平台（設計預覽）

路徑：`https://hoyao.com/materials/`

獨立於公司官網導覽。公開「關於」頁面向企業訪客說明服務與洽詢；上架與維護步驟見：

→ [`docs/materials-platform-maintain.md`](../docs/materials-platform-maintain.md)

## 路由速覽

| 路由 | 用途 |
|------|------|
| `#/` | 首頁 |
| `#/catalog` | 材料圖鑑 |
| `#/material/{id}` | 材料詳頁 |
| `#/request` | 提出需求 |
| `#/request/{id}?from={batchId}` | 沿用批次規格洽詢 |
| `#/cases` | 我的案件 |
| `#/passport/{id}` | 批次護照 |
| `#/about` | 關於服務 |

## 技術

靜態 HTML／CSS／JS＋JSON，適合 GitHub Pages。案件存在 localStorage。
