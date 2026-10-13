# SBIR 實作驗證報告（Draft，未部署）

**Branch:** `cursor/nantou-sbir-2026-pages-1db6`  
**PR:** #31  
**Last revised:** 2026-10-13（文案／品牌／日期閘門修正）  
**PR #30:** 保留為審查／文案紀錄

## 新增頁面（本地預覽）

| 語言 | 動態文章 | 專案履歷 |
|------|----------|----------|
| 中文 | `/zh/updates/nantou-sbir-2026.html` | `/zh/projects/nantou-sbir-2026.html` |
| 英文 | `/en/updates/nantou-sbir-2026.html` | `/en/projects/nantou-sbir-2026.html` |

`python3 -m http.server 8765` 後開啟上列路徑；首頁 SBIR 為純文字 `progress-item`。

## 本輪修正摘要

1. **對外文案：** 刪除反覆「不公開金額／題目／不宣稱驗收認證」句；保留核定、公告日、舊名對照、官方來源；補一句地方創新研發與材料應用意義（無個別計畫虛構）。  
2. **英文新頁品牌：** header `brand-legal` → `HOYAO APPLIED TECHNOLOGIES`（僅兩篇 EN 新頁；全站其餘留給 4.0）。  
3. **日期：** 正文不再寫「本站發布 2026/10/13」。`datePublished`／`article:published_time` 暫留 `2026-10-13` 並加 `PRE-MERGE` 註解——**若首次公開日不是當日，Merge／部署前必須改為實際上線日**（四頁 meta／JSON-LD、列表列、sitemap `lastmod`）。  
4. **設計：** 首頁純文字卡；未改 `zhushan/`；無機關 Logo。

## SEO（四新頁）

| 檢查項 | 狀態 |
|--------|------|
| canonical | 各頁絕對 URL 正確 |
| hreflang zh-Hant ↔ en + x-default | 成對 |
| og:url / og:type=article / og:image | 站內 og-image |
| NewsArticle（updates）／Article（projects） | author／publisher＝和曜；citation／isBasedOn＝縣府公告 |
| 縣府公告日正文 | 2026/09/03 |
| datePublished | 暫定 2026-10-13；**上線前依實際首次公開日覆核** |
| sitemap 4 URL | 有；`lastmod` 同需上線前覆核 |

## 回歸測試（本輪）

見 PR 留言／本機腳本：連結、HTML、JSON-LD、首頁卡、zhushan 未變動。

## 上線前必做

- [ ] 將四頁 `datePublished`／`dateModified`／`article:*` 改為**實際首次公開日**（若非 2026-10-13）  
- [ ] 同步 updates 列表／首頁動態列日期與 `sitemap.xml` `lastmod`  
- [ ] 最終確認後再 Merge／部署  
