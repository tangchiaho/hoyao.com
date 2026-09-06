/**
 * English overrides for /zhushan/en/
 * Load after zhushan-config.js
 */
(function () {
  "use strict";
  var base = window.ZHUSHAN_CONFIG || {};
  var en = {
    locale: "en",
    canonicalUrl: "https://hoyao.com/zhushan/en/",
    communityHashtag: "#ZHUSHANKAIFANLE",
    event: {
      venueName: "Taixi Bus Zhushan Station · Zhuqingting Cultural Space",
      venueAddress: "No. 27, Caiyuan Rd., Zhongshan Village, Zhushan Township, Nantou County",
      venueShort: "Zhushan, Nantou",
      support: "Nantou County Government · Nantou County Youth Development Office",
      executor: "Kuangte International Integrated Marketing Co., Ltd.",
    },
    wishCard: Object.assign({}, base.wishCard || {}, {
      hashtag: "#ZHUSHANKAIFANLE",
      url: "https://hoyao.com/zhushan/en/",
    }),
    bambooCard: Object.assign({}, base.bambooCard || {}, {
      url: "https://hoyao.com/zhushan/en/",
    }),
    video: Object.assign({}, base.video || {}, {
      title: "竹山開飯了 ZHUSHAN KAI FAN LE — From Bamboo to Table, From Table Back to Earth | Taixi Bus Zhushan Station",
      caption:
        "Initiated by Tang Chia-Ho, 竹山開飯了 (ZHUSHAN KAI FAN LE) documents the material journey from bamboo to table, and from table back to earth.",
    }),
    research: Object.assign({}, base.research || {}, {
      title: "Bamboo Applications & Local Participation Study",
      subtitle: "竹山開飯了 ZHUSHAN KAI FAN LE — participation study",
      disclaimer:
        "Valid responses come from work participants and site visitors. This is an exploratory participation study and does not represent general Taiwanese consumers or Zhushan residents.",
    }),
    images: Object.assign({}, base.images || {}, {
      hero: Object.assign({}, (base.images && base.images.hero) || {}, {
        alt: "竹山開飯了 ZHUSHAN KAI FAN LE — complete work presentation",
        caption: "Complete work presentation",
      }),
      process: ((base.images && base.images.process) || []).map(function (item, i) {
        var stages = [
          { stage: "Structure", label: "From perforated base plates and bamboo poles, the work finds its first vertical rhythm.", alt: "Bamboo frame and pole installation" },
          { stage: "Collaboration", label: "Workshop making and on-site pre-assembly turn the concept into a buildable structure.", alt: "Workshop bamboo structure and collaboration" },
          { stage: "Handwork", label: "Bamboo-fiber tableware is recomposed into blossoms and radial components.", alt: "Handwork with bamboo and tableware flower pieces" },
          { stage: "Formation", label: "Scattered units gradually become a complete bamboo grove.", alt: "Front view of the work in pre-assembly" },
          { stage: "Detail", label: "Planting at the base makes the ground part of the work.", alt: "Base planting detail" },
          { stage: "Overview", label: "The work after pre-assembly.", alt: "Full pre-assembly overview" },
          { stage: "Collaboration", label: "On-site collaboration and assembly.", alt: "Group photo with woodworkers and base plates" },
          { stage: "Bamboo Phrase", label: "Prototype bamboo-phrase tags.", alt: "Bamboo phrase tag prototype" },
          { stage: "Collaboration", label: "Group photo during pre-assembly.", alt: "Group photo at pre-assembly" },
        ];
        var t = stages[i] || {};
        return Object.assign({}, item, t);
      }),
    }),
    ui: {
      videoEyebrow: "Project film",
      videoMeta: "Documentary · YouTube",
      playVideo: "Play video",
      openYoutube: "Open on YouTube",
      momentFallback: "Zhushan moment",
      viewOriginal: "View original post",
      contactPrefix: "Collaboration & inquiries: ",
      hoyaoName: "HOYAO Applied Technologies Co., Ltd.",
      harmonyName: "Harmony Culture Music Co., Ltd.",
      drawAgain: "Draw again",
      fallbackPhrase: "From bamboo forest to table, and from table back to land.",
      phraseCardFail: "Could not make the phrase card. Please try again.",
      shareOpened: "System share opened",
      shareFallbackDownload: "Image sharing is not supported on this device. Downloaded as PNG instead.",
      downloadStarted: "Download started. You can also long-press the card to save it.",
      driftPublic: "It drifted by — nearby visitors may also see it briefly.",
      driftLocal: "It drifted across your screen. (Public drift API is not set up yet.)",
      submitTooFast: "That was a little quick — please wait a moment and try again.",
      driftBlocked: "This sentence can’t drift publicly.",
      wishCardMake: "Make wish card",
      wishCardView: "View my wish card",
      wishCardUpdate: "Update wish card",
      wishKept: "Your wish is kept; after review, it may appear among the wishes.",
      wishCardFail: "Could not make the wish card. Please try again.",
      defaultHashtag: "#ZHUSHANKAIFANLE",
      needLink: "Please paste your post link.",
      needValidLink: "Please enter a valid http or https link.",
      linkTooLong: "That link is too long — please check it.",
      shareSoon: "Sharing will open soon. Please try again later.",
      shareReceived: "We received your share. After review, it may appear at random in Zhushan Moments.",
      confirmInForm: "Please confirm and submit in the form that opened. After review, it will appear on the page.",
      submitFail: "Submission failed. Please try again later.",
    },
  };

  window.ZHUSHAN_CONFIG = Object.assign({}, base, en);
})();
