/**
 * 竹山開飯了 — 作品專頁集中設定（V5 Participation）
 *
 * 換正式照片：改 images.*，placeholder: false
 * 短期公開彈幕：部署 docs/zhushan-ephemeral-apps-script.js 後填 ephemeralApiUrl
 */
window.ZHUSHAN_CONFIG = {
  slug: "zhushan",
  canonicalUrl: "https://hoyao.com/zhushan/",

  dataMode: "static",

  /* 正式竹願表單（審核後進竹願牆） */
  googleFormUrl: "",
  googleFormWishEntry: "",
  wishesApiUrl: "",
  staticWishesUrl: "/assets/data/zhushan-wishes.json",
  outcomesUrl: "/assets/data/zhushan-outcomes.json",
  bambooPhrasesUrl: "/assets/data/zhushan-bamboo-phrases.json",

  /* 短期公開彈幕 API（Apps Script Web App URL）；空＝僅本機可見 */
  ephemeralApiUrl: "",
  ephemeral: {
    ttlMinutes: 20,
    maxLength: 40,
    pollMs: 8000,
    maxVisible: 6,
  },

  /* 問卷／研究（與彈幕、竹願分開） */
  surveyFormUrl: "",
  surveyPrizeText: "",

  /* 社群挑戰 */
  communityHashtag: "#竹山開飯了",
  communityMention: "",
  communityPrizeText: "",
  communitySubmissionFormUrl: "",
  communityShareFormUrl: "",
  communityDataUrl: "/assets/data/zhushan-community.json",

  contactEmail: "",

  placeholders: {
    enabled: true,
    base: "/assets/placeholders/zhushan/",
    qr: "/assets/placeholders/zhushan/qr-zhushan.png",
  },

  wishCard: {
    enabled: true,
    maxLength: 70,
    hashtag: "#竹山開飯了",
    url: "https://hoyao.com/zhushan/",
    format: "story",
    width: 1080,
    height: 1920,
  },

  bambooCard: {
    enabled: true,
    width: 1080,
    height: 1920,
    url: "https://hoyao.com/zhushan/",
  },

  animations: { enabled: true },

  video: {
    type: "youtube",
    youtubeId: "",
    url: "",
    poster: "",
    title: "從材料到作品",
    duration: "",
  },

  images: {
    hero: {
      src: "/assets/placeholders/zhushan/hero-field.svg",
      placeholder: true,
      alt: "竹山開飯了－抽象竹林視覺",
      width: 1600,
      height: 900,
      caption: "視覺預覽 · 待替換正式現場照片",
    },
    venue: {
      src: "/assets/placeholders/zhushan/venue-station.svg",
      placeholder: true,
      alt: "台西客運竹山站氛圍",
      width: 1600,
      height: 1000,
      caption: "台西客運竹山站｜場域氛圍（placeholder）",
    },
    venueGallery: [
      {
        src: "/assets/placeholders/zhushan/venue-station.svg",
        placeholder: true,
        alt: "台西客運竹山站",
        width: 1600,
        height: 1000,
        caption: "台西客運竹山站",
        size: "large",
      },
      {
        src: "/assets/placeholders/zhushan/venue-interior.svg",
        placeholder: true,
        alt: "竹青庭人文空間",
        width: 1400,
        height: 1000,
        caption: "竹青庭人文空間",
        size: "medium",
      },
      {
        src: "/assets/placeholders/zhushan/venue-detail.svg",
        placeholder: true,
        alt: "材料與空間細節",
        width: 1000,
        height: 1200,
        caption: "材料與空間細節",
        size: "tall",
      },
    ],
    process: [
      {
        id: "01",
        stage: "材料",
        label: "竹材整理",
        alt: "竹材整理",
        src: "/assets/placeholders/zhushan/process-01-material.svg",
        placeholder: true,
        width: 1200,
        height: 900,
      },
      {
        id: "02",
        stage: "構築",
        label: "竹架組裝",
        alt: "竹架組裝",
        src: "/assets/placeholders/zhushan/process-02-frame.svg",
        placeholder: true,
        width: 1200,
        height: 900,
      },
      {
        id: "03",
        stage: "手作",
        label: "麻繩固定",
        alt: "麻繩固定",
        src: "/assets/placeholders/zhushan/process-03-rope.svg",
        placeholder: true,
        width: 1200,
        height: 900,
      },
      {
        id: "04",
        stage: "協力",
        label: "木片準備",
        alt: "木片準備",
        src: "/assets/placeholders/zhushan/process-04-wood.svg",
        placeholder: true,
        width: 1200,
        height: 900,
      },
      {
        id: "05",
        stage: "進場",
        label: "進場布置",
        alt: "進場布置",
        src: "/assets/placeholders/zhushan/process-05-install.svg",
        placeholder: true,
        width: 1200,
        height: 900,
      },
      {
        id: "06",
        stage: "細節",
        label: "局部細節",
        alt: "局部細節",
        src: "/assets/placeholders/zhushan/process-06-detail.svg",
        placeholder: true,
        width: 1200,
        height: 900,
      },
    ],
    interactions: [],
    community: [],
  },

  ogImage: "https://hoyao.com/assets/images/projects/zhushan/og-image.png",

  externalLinks: {
    taixiMap: "https://share.google/7UQXuN2FdtoffdhMn",
    zhuchingtingMap: "https://share.google/JviOZVssQLkXxWZEd",
    incubationVillageWebsite: "https://zrsi.org/",
    incubationVillageFacebook: "https://www.facebook.com/zrsi2021/",
    youthDevelopmentWebsite: "https://youth.nantou.gov.tw/zh-TW",
    townCultureFacebook: "https://www.facebook.com/townway104/",
    bambooSponsorWebsite: "https://www.taiwanbamboo.shop/",
    hoyaoWebsite: "https://hoyao.com/",
    harmonyCultureWebsite: "https://harmonyculture.art",
  },

  gaMeasurementId: "",
};
