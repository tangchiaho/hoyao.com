/**
 * 竹山開飯了 — 作品專頁集中設定
 * 替換照片、表單、社群資料時，優先修改此檔。
 */
window.ZHUSHAN_CONFIG = {
  slug: "zhushan",
  canonicalUrl: "https://hoyao.com/zhushan/",

  dataMode: "static",

  googleFormUrl: "",
  googleFormWishEntry: "",
  wishesApiUrl: "",
  staticWishesUrl: "/assets/data/zhushan-wishes.json",
  useMockWishes: false,

  communityShareFormUrl: "",
  communityDataUrl: "/assets/data/zhushan-community.json",

  wishCard: {
    enabled: true,
    maxLength: 70,
    hashtag: "#竹山開飯了",
    url: "https://hoyao.com/zhushan/",
  },

  animations: {
    enabled: true,
  },

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
      src: "",
      alt: "竹山開飯了－竹子重生的永續花園",
      width: 1600,
      height: 900,
      caption: "",
    },
    venue: {
      src: "",
      alt: "台西客運竹山站／竹青庭人文空間",
      width: 1600,
      height: 900,
    },
    process: [],
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
  },

  outcomes: {
    visible: false,
    exhibitionPeriod: "",
    participants: null,
    digitalWishes: null,
    onsiteWishes: null,
    pageViews: null,
    validSamples: null,
    firstVisitRate: null,
    perceptionChangeRate: null,
    willingnessToTryRate: null,
    topApplications: null,
    topDecisionFactors: null,
  },

  gaMeasurementId: "",
};
