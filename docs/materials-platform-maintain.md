# 地方循環材料供應平台｜維護說明

公開網站路徑：`/materials/`（設計預覽，`noindex`）。  
產品主線以 PR #50「和曜材料櫃台」為準。

## 之後新增一筆材料

1. 編輯 `materials/assets/data/catalog.json` 的 `materials` 陣列。
2. 必填：`id`、`name`、`form`、`feedstock`、`origin`、`supplyStatus`、`summary`、`image`、`customerSpec`、`measured`、`pendingMeasures`、`processes`、`applications`、`relatedBatches`。
3. 展示期建議保留 `"demo": true`。
4. 若有樣品袋：在 `materials/assets/data/batches.json` 新增護照，並把批次 `id` 寫入該材料的 `relatedBatches`。
5. 本地以靜態伺服器開啟 `/materials/` 驗證圖鑑與 `#/passport/{id}`。

## 護照 → 再次洽詢

連結格式：`#/request/{materialId}?from={batchId}`  
表單會鎖定材料、顯示來源批次，並帶入該批客戶指定規格；無實測時規格區標示「維持待確認」。

## 設計取捨（內部）

- 不做大型材質圖書館目錄牆，採「材料櫃台」：少而清楚的品項 + 可追蹤案件。
- 材料／護照強制分開「客戶指定／實際量測／待確認」。
- 批次護照對齊樣品掃描，不宣稱區塊鏈或認證。
- 案件現存瀏覽器 `localStorage`（鍵 `hoyaoMaterialsCases_v1`）；正式收件另階段。

## 與 #47／#48 的關係

見 PR #50 說明：#50 為獨立產品主線；#47 的現場資產／護照／沿用洽詢概念已重做涵蓋；#48 的正式收件 API、追蹤頁、三層權限與 Apps Script **尚未**併入，留待下一階段。
