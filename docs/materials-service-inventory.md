# 材料圖鑑｜可沿用服務盤點（第二階段）

## 現況

| 能力 | 專案現況 | 材料圖鑑沿用方式 |
| --- | --- | --- |
| 靜態部署 | GitHub Pages（`hoyao.com` / CNAME） | 維持；`materials/` 不進 sitemap、維持 noindex |
| 表單收件 | 竹山頁：Google Forms + Apps Script Web App | 新增 `docs/materials-intake-apps-script.js`，Sheet 存工單 |
| 公開讀取 API | 竹山 wishes／彈幕 Apps Script `doGet`/`doPost` | 同模式：`submit` / `get` / `updateStatus` |
| 資料庫 | Google Sheet（竹山專案資料庫） | 建議新建工作簿「和曜材料圖鑑＿工單」 |
| 身分驗證 | 無站內帳號；客戶以不公開連結＋token；內部以管理 token | 三層權限見下；示範 QR 僅連公開示範資料 |
| 前端設定 | `assets/js/zhushan-config.js` 填 Web App URL | `materials/config.js` 的 `intakeApiUrl` |

## 三層權限

1. **公開圖鑑**：材料型態、供應狀態、詢價入口；示範護照／QR 僅公開示範資料。
2. **客戶**：僅能以 `orderId + accessToken` 專屬連結查看自己的工單、適用批次與報告摘要。
3. **內部**：來源窗口、成本、製程參數、損耗；需 `adminToken`（Apps Script 指令碼屬性），不進公開前端。

## 量測資料原則

- **倉儲溫濕度**與**材料含水率**分開欄位記錄。
- 每筆量測保留 `source`（資料來源）與 `method`（量測方法）；未建檔則顯示待建檔，不補數字。

## 正式啟用前和曜需提供

1. 部署 `docs/materials-intake-apps-script.js` 為 Web App（執行身分：我；存取：任何人）。
2. 將 Web App URL 填入 `materials/config.js` → `intakeApiUrl`。
3. 在指令碼屬性設定 `ADMIN_TOKEN`（內部更新狀態用）。
4. 真實樣品／批次建檔後，再把護照示範改為正式批次（或另開正式護照頁）。
