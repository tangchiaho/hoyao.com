# 竹山開飯了｜動態資料設定

作品頁只讀公開 JSON。姓名、Email、手機不可進入公開 API。

## A. 建立 Google Form（竹願）

建議題目：

1. 與竹山的關係（單選）：竹山在地／南投其他地區／外地旅客／工作／就學／其他
2. 年齡區間（單選）：18歲以下／18–29／30–39／40–49／50–59／60以上
3. 是否第一次來到台西客運竹山站／竹青庭（單選）：是／否
4. 最有感的作品部分（單選）：主作品／竹語／竹願／歸土
5. 你希望未來的竹山多一點什麼（單選）：竹產業新應用／青年參與／返鄉／地方文化空間／永續環境／地方飲食與生活／其他
6. 留一句話給未來的竹山（簡答，必填）

不要強迫姓名、手機、Email。  
表單完成後：回應 → 連結至試算表。

把表單「傳送」連結貼到 `assets/js/zhushan-config.js` 的 `googleFormUrl`。

## B. Google Sheet 欄位名稱

第一列請使用這些英文欄名（可再對應 Form 題目）：

| 欄名 | 說明 |
|---|---|
| `id` | 可手動或用公式編號，如 W001 |
| `created_at` | 送出時間 |
| `message` | 竹願文字 |
| `relation` | 與竹山的關係 |
| `age_range` | 年齡區間 |
| `first_visit` | 是否第一次來訪 |
| `favorite` | 最有感互動 |
| `future_theme` | 希望竹山多一點什麼 |
| `approved` | 公開審核。`TRUE` 才顯示 |
| `featured` | 精選（選填） |
| `published_at` | 公開時間（選填） |

聯絡資料若因抽獎需要，請放在**另外的欄**，Apps Script 範例不會輸出那些欄。

## C. 如何設定 approved

在 Sheet 新增 `approved` 欄。  
人工看過留言後填 `TRUE`。空白或 `FALSE` 不會出現在網站。

## D. 如何貼 Apps Script

1. 打開該 Google Sheet
2. 擴充功能 → Apps Script
3. 貼上 `docs/zhushan-google-apps-script.js`
4. 將 `SHEET_NAME` 改成工作表名稱（預設 `Wishes`）
5. 儲存

## E. 取得 Apps Script Web App URL

1. 部署 → 新增部署作業
2. 類型：網頁應用程式
3. 執行身分：我
4. 存取權：所有人
5. 部署後複製 Web App URL

若之後改程式：部署 → 管理部署作業 → 編輯 → 新版本。

## F. 貼到 zhushan-config.js 哪裡

```js
googleFormUrl: "https://docs.google.com/forms/d/e/XXXX/viewform",
wishesApiUrl: "https://script.google.com/macros/s/XXXX/exec",
communityShareFormUrl: "https://docs.google.com/forms/d/e/YYYY/viewform",
```

## G. 切換資料模式

API（建議）：

```js
dataMode: "api",
wishesApiUrl: "https://script.google.com/macros/s/XXXX/exec",
useMockWishes: false,
```

Static JSON（不靠 Apps Script）：

```js
dataMode: "static",
staticWishesUrl: "/assets/data/zhushan-wishes.json",
useMockWishes: false,
```

然後把已審核留言整理進 `/assets/data/zhushan-wishes.json`，經 GitHub 發佈。

`useMockWishes: true` 僅供本機開發，production 必須是 `false`。

## H. 更新 Community Moments

編輯 `/assets/data/zhushan-community.json`：

```json
{
  "items": [
    {
      "platform": "Instagram",
      "handle": "@example",
      "text": "一句話",
      "url": "https://...",
      "image": "/assets/images/projects/zhushan/community/001.webp",
      "approved": true
    }
  ]
}
```

圖片放在 `assets/images/projects/zhushan/community/`。  
只有 `approved: true` 會顯示。陣列為空時，整個區塊隱藏。

社群分享表單（`communityShareFormUrl`）建議題目：

- 平台：Instagram / Facebook / Threads / LINE / 其他
- 公開貼文連結（優先）
- 暱稱（選填）
- 一句話（選填）
- 是否同意作品頁公開顯示（必填）
- 是否同意作為成果紀錄引用（必填）

人工核對後再寫入 JSON。

## I. 測試 Wish Card 分享

1. 本機或正式站打開 `/zhushan/`
2. 在「帶走你的竹願」輸入一句話
3. 按「生成我的竹願卡」
4. 手機：優先測「分享我的竹願」（Web Share API）
5. 桌機：多半走「儲存竹願卡」下載 PNG

中文字型依賴頁面已載入的 Noto Serif TC。若字型尚未就緒，會等 `document.fonts.ready` 再畫。

## J. 關閉某個動態功能

| 功能 | 作法 |
|---|---|
| 進場動畫 | `animations.enabled: false` |
| 竹願表單區 | `googleFormUrl: ""`（整區隱藏） |
| 竹願牆／統計 | `wishesApiUrl: ""` 且 `dataMode` 不是有內容的 static |
| 竹願卡 | `wishCard.enabled: false` |
| 社群分享按鈕 | `communityShareFormUrl: ""` |
| 竹山片刻 | `communityDataUrl` 指到空 JSON，或清空 `items` |
| Process | `images.process: []` 且 `video.url: ""` |
| 場域圖 | `images.venue.src: ""` |

系統層 `prefers-reduced-motion: reduce` 會取消動畫與輪播。

## K. 短期公開彈幕（V5）

1. 在同一 Google Sheet 部署 `docs/zhushan-ephemeral-apps-script.js`（可與竹願共用專案，或獨立）
2. 部署為網頁應用程式（所有人可存取）
3. 把 Web App URL 貼到 `ephemeralApiUrl`
4. TTL 預設 20 分鐘；超過不再回傳

若 `ephemeralApiUrl` 為空：飄過僅本機可見（optimistic），不會跨裝置。

## L. 問卷／社群挑戰

```js
surveyFormUrl: "https://docs.google.com/forms/d/e/XXXX/viewform",
surveyPrizeText: "完成問卷可參加抽獎", // 空字串則不顯示
communitySubmissionFormUrl: "https://docs.google.com/forms/d/e/YYYY/viewform",
communityMention: "@your_account",
communityPrizeText: "",
```

抽獎個資請用獨立表單或獨立區段，勿與研究答題混為公開資料。
