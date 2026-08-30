/**
 * 竹山開飯了 — 作品專頁集中設定
 * 替換照片、表單、影片、外部連結時，優先修改此檔。
 */
window.ZHUSHAN_CONFIG = {
  slug: "zhushan",
  canonicalUrl: "https://hoyao.com/zhushan",

  /* Google Form → Google Sheets（第一階段：填入完整表單 URL） */
  googleFormUrl: "",

  /* 未來：已審核竹願 JSON 來源（Google Apps Script / Sheets API 代理） */
  wishesApiUrl: "",

  /* 竹願 mock 資料（wishesApiUrl 為空時使用） */
  wishesMockUrl: "/assets/data/zhushan-wishes-mock.json",

  /* 製作影片（未準備好前留空；poster 仍顯示靜態封面） */
  video: {
    url: "",
    poster: "/assets/images/projects/zhushan/placeholder-video-poster.svg",
    title: "從材料到作品",
  },

  /* 圖片路徑 — 準備好 WebP/AVIF 後替換 src；保留 width/height 於 HTML */
  images: {
    hero: {
      src: "/assets/images/projects/zhushan/placeholder-hero.svg",
      alt: "竹山開飯了－竹子重生的永續花園｜作品橫幅（照片待更新）",
      width: 1600,
      height: 900,
    },
    process: [
      { id: "01", label: "原始竹材", src: "/assets/images/projects/zhushan/placeholder-process.svg", alt: "原始竹材（照片待更新）" },
      { id: "02", label: "木工／鑽孔", src: "/assets/images/projects/zhushan/placeholder-process.svg", alt: "木工／鑽孔（照片待更新）" },
      { id: "03", label: "竹林組裝", src: "/assets/images/projects/zhushan/placeholder-process.svg", alt: "竹林組裝（照片待更新）" },
      { id: "04", label: "竹纖維餐具轉化", src: "/assets/images/projects/zhushan/placeholder-process.svg", alt: "竹纖維餐具轉化（照片待更新）" },
      { id: "05", label: "竹願架", src: "/assets/images/projects/zhushan/placeholder-process.svg", alt: "竹願架（照片待更新）" },
      { id: "06", label: "進場", src: "/assets/images/projects/zhushan/placeholder-process.svg", alt: "進場（照片待更新）" },
      { id: "07", label: "完成作品", src: "/assets/images/projects/zhushan/placeholder-process.svg", alt: "完成作品（照片待更新）" },
      { id: "08", label: "民眾互動", src: "/assets/images/projects/zhushan/placeholder-process.svg", alt: "民眾互動（照片待更新）" },
    ],
  },

  /* Open Graph 分享圖（1200×630；準備好後替換） */
  ogImage: "https://hoyao.com/assets/images/projects/zhushan/og-image.png",

  /* 外部連結（日後補上官方 URL） */
  externalLinks: {
    venueStory: "",
  },

  /* 成果紀錄 — visible: true 時顯示區塊 */
  outcomes: {
    visible: false,
    exhibitionPeriod: "",
    participants: null,
    digitalWishes: null,
    onsiteWishes: null,
    pageViews: null,
    socialShares: null,
    awards: [],
    press: [],
    reportPdf: "",
    presentationPdf: "",
    finalPhotos: [],
  },

  /* GA4 — 若全站已有 gtag，沿用；否則留空 */
  gaMeasurementId: "",
};
