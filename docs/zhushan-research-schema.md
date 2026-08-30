# 竹山開飯了｜參與研究架構

正式名稱：**竹材新應用與地方參與觀察**  
Bamboo Applications & Local Participation Study  

副標：《竹山開飯了》參與研究  

這是探索性參與觀察（exploratory participation study）。  
受訪者為作品參與者／網站訪客，屬 convenience sample。

不要稱為：活動滿意度調查、市場驗證、消費者市場代表性調查。

網站文案使用：本次參與者、本次有效回覆、參與觀察、探索性結果、受訪者自陳。  
不要使用：台灣消費者普遍、市場已驗證、竹山市民普遍認為、消費者願意支付、市場需求已證實。

---

## A. 兩份表單必須分開

| 表單 | 用途 | 進入 outcomes.json？ |
|---|---|---|
| 參與研究問卷 `surveyFormUrl` | 研究欄位 | 可（聚合後、無個資） |
| 抽獎登記 `prizeEntryFormUrl` | 姓名、Email 或手機、抽獎同意 | **否** |

Google Form 完成頁請導向抽獎表單。  
研究問卷不要收集姓名、手機、Email。

`surveyFormUrl` 為空時，網站完整隱藏 Research CTA。  
`surveyPrizeText` 有值時，僅以小字顯示「完成問卷可參加＿＿抽獎」。

---

## B. 現場／線上分流

第一題必填：`participationMode`

| value | 選項 |
|---|---|
| `onsite` | 我人在台西客運竹山站／竹青庭現場參與 |
| `visited_online` | 我曾到過現場，但這次從網路填答 |
| `online` | 我只有線上瀏覽作品／網站 |
| `shared` | 朋友或社群分享給我 |
| `other` | 其他 |

**現場題**（僅 `onsite`、`visited_online`）  
`firstVenueVisit`、`mostImpactfulInteraction`、`revisitIntent`、`recommendIntent`

**線上題**（僅 `online`、`shared`）  
`visitIntentAfterOnline`

`other`：不要問第一次走進場域、現場最有感互動。

---

## C. Google Form 題目順序

### 共同

1. **participationMode** 參與方式（單選，必填）
2. **region** 來源地區／縣市（填空或縣市單選）
3. **zhushanRelation** 與竹山關係（單選）  
   住在竹山／南投其他地區居民／返鄉／曾居住／工作／求學與竹山有關／來竹山旅遊／路過／偶然接觸／第一次接觸竹山／其他
4. **respondentRole** 受訪者背景（單選；後台保留，N≥100 才考慮公開區分）  
   一般消費者／設計／建築／室內／營造／建材／製造／材料／餐飲／零售／教育／公部門／地方創生／ESG／永續相關／學生／其他
5. **bambooKnowledgeBefore** 參與前對竹材應用的了解程度（1–5）  
   1 幾乎不了解 … 5 非常了解
6. **knownBambooApplications** 原先知道的竹材應用（複選）  
   傳統工藝／家具／餐具／包裝／建築／室內材料／公共空間／複合材料／紡織／纖維／農業／園藝／其他／原本不太清楚
7. **bambooImaginationChange** 參與後是否更能想像竹材的不同應用  
   明顯增加／有增加／差不多／沒有增加
8. **desiredApplications** 有興趣的應用（複選，最多 3）  
   公共空間／建築材料／家具與室內／生活用品／教育體驗／地方設計商品／包裝／餐具／新型複合材料／其他
9. **purchaseFactors** 選擇竹材／植物纖維產品時最影響選擇的因素（最多 3）  
   價格／耐用程度／性能／安全性／第三方檢測／認證／外觀設計／是否環保／是否可回收／自然分解／是否使用台灣／在地材料／碳排放資訊／品牌／使用便利性／維修／售後／其他
10. **bambooConcerns** 實際使用新型竹材產品時最擔心的事（最多 3）  
    耐久性／防水／防潮／防火／強度／發霉／蟲害／清潔維護／食品／人體安全／品質穩定／價格／外觀／不了解實際效果／維修／售後／沒有特別疑慮／其他
11. **trustSignals** 什麼會增加對新型竹材產品的信任（最多 3）  
    SGS／第三方檢測／政府認證／大學／研究機構合作／實際使用案例／耐久／性能測試／碳足跡或環境資訊／清楚原料來源／知名企業採用／在地生產／材料來源／親自使用體驗／價格合理／其他
12. **preferSustainableWhenEqual** 價格與性能接近時是否優先考慮竹材／植物纖維產品  
    一定會／可能會／不一定／可能不會／不會
13. **pricePremiumTolerance** 自陳價格接受程度（不是 WTP）  
    不願意多付／約高 5%／約高 10%／約高 15%／只要整體價值足夠，價格不是唯一考量／不確定
14. **sustainabilityPurchaseAttitude** 反證題（必留）  
    - 我會主動優先選擇永續材料產品  
    - 性能與價格接近時，我會優先選永續材料產品  
    - 我支持永續理念，但實際購買仍以價格與性能為主  
    - 材料是否永續，對我的實際購買影響不大  
    - 目前沒有特別偏好
15. **localOriginEffect** 若產品使用竹山／南投竹材  
    明顯增加好感／選擇意願／有一些增加／沒什麼影響／不確定／產地不是主要考量
16. **zhushanInnovationExpectation** 期待竹山發展竹材新應用（1–5）  
    非常不期待 … 非常期待

### 現場區塊

17. **firstVenueVisit** 是否第一次走進台西客運竹山站／竹青庭（是／否）
18. **mostImpactfulInteraction** 最有感  
    作品本身／竹語／竹願／歸土／場域／老車站／竹材與植物纖維材料
19. **revisitIntent** 再訪意願 1–5
20. **recommendIntent** 推薦意願 1–5

### 線上區塊

21. **visitIntentAfterOnline** 是否更想實際到竹山／台西客運竹山站看看  
    明顯增加／有增加／差不多／沒有增加

### 自由回覆與同意

22. **futureExpectation** 希望竹山未來多一點什麼（選填）
23. **openFeedback** 留給作品、竹山或空間的一句話（選填）
24. **researchConsent** 必填勾選  
    我同意此回覆以匿名方式作為作品成果與研究分析使用。
25. **quoteConsent** 選填勾選  
    我同意我的文字回覆經匿名整理後，可能出現在作品網站、成果報告或展示內容中。
26. **ageRange** 選填  
    18 以下／18–25／26–35／36–45／46–55／56–65／66 以上／不方便回答  
    前台預設不公開。

---

## D. Google Sheet：02_參與調查

資料庫：`竹山開飯了_專案資料庫`  
工作表：`02_參與調查`

若現有欄位不足：**向右新增欄位**，不要改既有欄名、不要覆蓋舊資料。

| 欄名 | 英文字段 | 公開？ |
|---|---|---|
| 編號 | id | 否 |
| 日期 | created_at | 否 |
| 參與方式 | participationMode | 可聚合 |
| 來源地區 | region | 可聚合 |
| 來源渠道 | sourceChannel | 後台（可手填：現場 QR／網站 CTA／社群） |
| 與竹山關係 | zhushanRelation | 可聚合 |
| 受訪者背景 | respondentRole | 後台；N≥100 才考慮區分 |
| 年齡區間 | ageRange | 後台，不公開 |
| 第一次到場 | firstVenueVisit | 現場樣本可聚合 |
| 原先竹材了解程度 | bambooKnowledgeBefore | 可聚合 |
| 原先知道的竹材應用 | knownBambooApplications | 優先公開 |
| 參與後材料想像改變 | bambooImaginationChange | 優先公開 |
| 有興趣應用 | desiredApplications | 可公開 |
| 選擇考量 | purchaseFactors | 優先公開 Top 5 |
| 新材料疑慮 | bambooConcerns | 優先公開 Top 5 |
| 信任因素 | trustSignals | 優先公開 Top 5 |
| 價格性能接近時採用意願 | preferSustainableWhenEqual | 優先公開 |
| 價格溢價接受程度 | pricePremiumTolerance | 可公開；只寫「自陳價格接受程度」 |
| 永續採購態度 | sustainabilityPurchaseAttitude | 優先公開 |
| 在地來源影響 | localOriginEffect | 可公開 |
| 竹山創新期待 | zhushanInnovationExpectation | 可公開 |
| 最有感互動 | mostImpactfulInteraction | 現場樣本 |
| 線上後到訪意願 | visitIntentAfterOnline | 線上樣本 |
| 再訪意願 | revisitIntent | 現場樣本 |
| 推薦意願 | recommendIntent | 現場樣本 |
| 未來期待 | futureExpectation | 僅 quoteConsent=TRUE |
| 自由留言 | openFeedback | 僅 quoteConsent=TRUE |
| 同意研究使用 | researchConsent | 有效樣本條件 |
| 同意引用原話 | quoteConsent | 公開引言條件 |
| 有效樣本 | valid | 操作欄；TRUE 才納入 N |
| 資料性質 | dataKind | 操作欄：survey／invalid／test |
| 備註 | notes | 操作欄 |

有效樣本：`researchConsent` 為真，且非測試列。

公開引言：必須 `quoteConsent = TRUE`。

---

## E. 樣本數規則

| N | 網站呈現 |
|---|---|
| `< 20` | 不強調百分比；實際數量與匿名文字 |
| `20–49` | 可顯示比例，標示「初步參與觀察」 |
| `50+` | 正常呈現核心比例 |
| `100+` | 才考慮角色／現場線上 segmentation |

---

## F. 公開成果 JSON

檔案：`/assets/data/zhushan-outcomes.json`

只填入真實聚合。空陣列不顯示。不要寫入模擬統計。

抽獎個資、年齡、姓名、Email、手機不得進入此檔。

`voices[]` 僅能來自 `quoteConsent = TRUE` 的 `openFeedback`／`futureExpectation`。

竹願主題 `wishThemes` 是質性內容觀察，不是正式 survey research。
