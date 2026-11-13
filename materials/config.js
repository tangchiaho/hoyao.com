/**
 * 材料圖鑑正式收件設定
 *
 * 部署 docs/materials-intake-apps-script.js 後，把 Web App URL 填入 intakeApiUrl。
 * 空字串時前端會提示尚未啟用正式收件（示範工單仍可用 localStorage）。
 */
window.HOYAO_MATERIALS_CONFIG = {
  intakeApiUrl: "",
  /* 僅供本機／驗收 mock：scripts/materials-intake-server.mjs */
  localMockApiUrl: "http://127.0.0.1:8787/",
  useLocalMockWhenEmpty: true,
  trackPath: "/materials/track.html",
  inquirePath: "/materials/inquire.html",
  demoPassportUrl: "https://hoyao.com/materials/passport/bamboo-powder-demo.html",
  statusLabels: {
    received: "已收件",
    spec_review: "規格確認中",
    sampling: "備樣／取樣",
    processing: "加工中",
    ready: "可交付",
    shipped: "已寄出",
    closed: "結案",
  },
};
