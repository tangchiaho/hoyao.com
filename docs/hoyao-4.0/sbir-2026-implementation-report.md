# SBIR 實作驗證報告（Draft，未部署）

**Branch:** `cursor/nantou-sbir-2026-pages-1db6`  
**Date:** 2026-10-13  
**PR #30:** 保留為審查／文案紀錄，不併入本實作

## 新增頁面（本地預覽路徑）

| 語言 | 動態文章 | 專案履歷 |
|------|----------|----------|
| 中文 | `/zh/updates/nantou-sbir-2026.html` | `/zh/projects/nantou-sbir-2026.html` |
| 英文 | `/en/updates/nantou-sbir-2026.html` | `/en/projects/nantou-sbir-2026.html` |

本地預覽：於 repo 根目錄執行 `python3 -m http.server 8765` 後開啟：

- http://127.0.0.1:8765/zh/updates/nantou-sbir-2026.html
- http://127.0.0.1:8765/en/updates/nantou-sbir-2026.html
- http://127.0.0.1:8765/zh/projects/nantou-sbir-2026.html
- http://127.0.0.1:8765/en/projects/nantou-sbir-2026.html
- http://127.0.0.1:8765/ （首頁 SBIR 純文字卡）

## 決議落實對照

| 決議 | 實作 |
|------|------|
| 公開入選＋官方來源 | 是 |
| 不公開個別題目／金額／執行摘要 | 是；公開頁無「待確認」欄位 |
| `datePublished` = 本站首次發布 2026-10-13 | 是（中英一致） |
| 縣府公告日 2026-09-03 正文標示 | 是；與發布日分開 |
| 首頁純文字卡、無縣府 logo／無關照片 | 是（`progress-item` 無 media） |
| 作者／發布者為和曜，非縣府 | 是（NewsArticle／Article） |
| 不改竹山專頁 | 是 |
| 不 Merge／不部署 | 是 |

## SEO 檢查

- canonical／hreflang（zh-Hant ↔ en）已設
- `article:published_time` / JSON-LD `datePublished` = `2026-10-13`
- `citation` / `isBasedOn` = 縣府官方 URL
- OG 使用站內 `og-image.png`
- sitemap 已加入 4 個新 URL，`lastmod` 2026-10-13

## 連結檢查

本地腳本核對結果：**ISSUES 0 / ALL CHECKS PASSED**（絕對路徑 `/…` 以站根解析；`zhushan/` 未改動）。

已核對：四新頁存在；首頁／projects／updates／company-name-change 互鏈；sitemap 含 4 新 URL；公開頁無「待確認／待補充」、無個別題目／金額／執行摘要、無縣府 Logo／無關照片；免責句僅否定「驗收或認證」宣稱。

## Diff stat（相對 `main`）

```
 docs/hoyao-4.0/sbir-2026-implementation-report.md | (new)
 en/index.html / en/projects.html / en/updates.html / en/updates/company-name-change.html
 en/projects/nantou-sbir-2026.html | (new)
 en/updates/nantou-sbir-2026.html  | (new)
 index.html / sitemap.xml
 zh/index.html / zh/projects.html / zh/updates.html / zh/updates/company-name-change.html
 zh/projects/nantou-sbir-2026.html | (new)
 zh/updates/nantou-sbir-2026.html  | (new)
```
