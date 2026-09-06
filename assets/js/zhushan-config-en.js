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
        alt: "竹山開飯了 ZHUSHAN KAI FAN LE — bamboo poles and tableware blossoms with the Bamboo Wishes rack",
        caption: "Taixi Bus Zhushan Station · Zhuqingting | Full view: bamboo grove, tableware blossoms, and Bamboo Wishes",
      }),
      process: ((base.images && base.images.process) || []).map(function (item, i) {
        var stages = [
          { stage: "Structure", label: "Drilling the perforated base and test-fitting bamboo poles — the work’s vertical rhythm begins here.", alt: "Workshop trial assembly of bamboo poles in a perforated wooden base" },
          { stage: "Collaboration", label: "Workshop pre-assembly: density and height of the bamboo grove are tuned inch by inch.", alt: "Four woodworkers posing with the bamboo structure in pre-assembly" },
          { stage: "Handwork", label: "Bamboo-fiber bowls, forks, and spoons stack on the table, then become blossoms and radial pieces.", alt: "Handwork scene with bamboo-fiber tableware and bamboo poles" },
          { stage: "Formation", label: "Tableware blossoms hang on bamboo poles — the work’s outline grows clear in pre-assembly.", alt: "Front view of the work in pre-assembly with tableware flower motifs" },
          { stage: "Detail", label: "Base trial: planting and bamboo side by side, so the ground becomes part of the work.", alt: "Close-up of planting and bamboo detail on the perforated base" },
          { stage: "Overview", label: "On-site test placement against the mountain backdrop, checking the overall rhythm.", alt: "On-site test placement of the work before the mountain backdrop" },
          { stage: "Collaboration", label: "Perforated base complete — workshop photo before assembly begins.", alt: "Two woodworkers holding the finished perforated wooden base" },
          { stage: "Bamboo Wish", label: "Bamboo Wish tag prototype: wood and twine, left blank for on-site writing.", alt: "Hand holding a wooden Bamboo Wish tag with twine" },
          { stage: "On site", label: "After the work takes shape, the creator and collaborators pose with the installation.", alt: "Creator and collaborator selfie in front of the finished installation" },
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
