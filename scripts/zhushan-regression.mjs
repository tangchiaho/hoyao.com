/**
 * Zhushan QA round-2 regression (headless Chrome)
 * Covers ZH/EN: phrase draw/card, wish input/card/download, film iframe,
 * keep-button hidden without form, no JS errors after qrcode removal.
 */
import puppeteer from "puppeteer-core";

const BASE = process.env.ZS_BASE || "http://127.0.0.1:8790";
const CHROME =
  process.env.CHROME_PATH ||
  "/usr/local/bin/google-chrome" ||
  "/usr/bin/google-chrome";

const results = [];
function ok(name, pass, detail = "") {
  results.push({ name, pass: !!pass, detail });
  const mark = pass ? "PASS" : "FAIL";
  console.log(`${mark}  ${name}${detail ? " — " + detail : ""}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function collectErrors(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err && err.message ? err.message : err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push("console: " + msg.text());
  });
  return errors;
}

async function waitCfg(page) {
  await page.waitForFunction(() => !!window.ZHUSHAN_CONFIG && !!window.BambooShareCard, {
    timeout: 15000,
  });
}

async function testLocale(page, path, locale) {
  const errors = await collectErrors(page);
  await page.goto(BASE + path, { waitUntil: "networkidle0", timeout: 60000 });
  await waitCfg(page);

  // No qrcode script / global required
  const qrState = await page.evaluate(() => ({
    scripts: [...document.scripts].map((s) => s.src).filter((s) => /qrcode/i.test(s)),
    hasQrGlobal: typeof window.qrcode === "function",
    hasCard: !!(window.BambooShareCard && window.BambooShareCard.render),
  }));
  ok(`${locale}: no qrcode script tag`, qrState.scripts.length === 0, JSON.stringify(qrState.scripts));
  ok(`${locale}: BambooShareCard loaded`, qrState.hasCard);

  // Film iframe
  const film = await page.evaluate(() => {
    const iframe = document.querySelector(".zs-film__frame iframe");
    const open = document.getElementById("zs-film-open");
    return {
      src: iframe ? iframe.getAttribute("src") : null,
      title: iframe ? iframe.getAttribute("title") : null,
      openHref: open ? open.getAttribute("href") : null,
    };
  });
  ok(
    `${locale}: YouTube embed M5rjYNHwBAE`,
    !!(film.src && film.src.includes("M5rjYNHwBAE")),
    film.src || "missing"
  );
  ok(
    `${locale}: Open on YouTube link`,
    !!(film.openHref && film.openHref.includes("M5rjYNHwBAE")),
    film.openHref || "missing"
  );

  // Bamboo phrase draw → card
  const drawSel = "#zs-draw-phrase";
  ok(`${locale}: phrase draw button present`, !!(await page.$(drawSel)));
  if (await page.$(drawSel)) {
    await page.click(drawSel);
    await page.waitForFunction(
      () => {
        const el = document.getElementById("zs-slip-text");
        return el && !el.hidden && (el.textContent || "").trim().length > 0;
      },
      { timeout: 15000 }
    ).catch(() => null);
    const phraseText = await page.$eval("#zs-slip-text", (el) => (el.textContent || "").trim()).catch(() => "");
    ok(`${locale}: phrase text after draw`, phraseText.length > 0, phraseText.slice(0, 40));

    await page.waitForSelector("#zs-phrase-card-btn:not([hidden])", { timeout: 5000 }).catch(() => null);
    const phraseCardVisible = await page.evaluate(() => {
      const b = document.getElementById("zs-phrase-card-btn");
      return !!(b && !b.hidden);
    });
    ok(`${locale}: phrase card button shown`, phraseCardVisible);
    if (phraseCardVisible) {
      await page.click("#zs-phrase-card-btn");
      await page.waitForFunction(
        () => {
          const img = document.getElementById("zs-phrase-card-preview");
          const result = document.getElementById("zs-phrase-card-result");
          return (
            result &&
            !result.hidden &&
            img &&
            img.src &&
            img.src.startsWith("data:image/png")
          );
        },
        { timeout: 25000 }
      ).catch(() => null);
      const phraseCard = await page.evaluate(() => {
        const img = document.getElementById("zs-phrase-card-preview");
        return {
          ready: !!(img && img.src && img.src.startsWith("data:image/png")),
          bytes: img && img.src ? img.src.length : 0,
        };
      });
      ok(`${locale}: phrase card PNG generated`, phraseCard.ready, `bytes≈${phraseCard.bytes}`);
    }
  }

  // Wish keep hidden without backend
  const keepState = await page.evaluate(() => {
    const btn = document.getElementById("zs-keep-wish-btn");
    const hint = document.querySelector(".zs-thought-hint--inline");
    return {
      exists: !!btn,
      hidden: btn ? !!(btn.hidden || btn.getAttribute("aria-hidden") === "true") : null,
      hint: hint ? hint.textContent.trim() : "",
      formUrl: (window.ZHUSHAN_CONFIG && window.ZHUSHAN_CONFIG.googleFormUrl) || "",
    };
  });
  ok(
    `${locale}: keep wish hidden when no form`,
    keepState.formUrl === "" && keepState.hidden === true,
    JSON.stringify(keepState)
  );

  // Wish input + drift (before card UI hides composer) + card + download
  const input = await page.$("#zs-thought-input");
  ok(`${locale}: wish input present`, !!input);
  if (input) {
    await page.evaluate(() => {
      const el = document.getElementById("zs-thought-input");
      if (el) el.scrollIntoView({ block: "center" });
    });
    await page.click("#zs-thought-input", { clickCount: 3 });
    const wishText =
      locale === "ZH"
        ? "希望竹山的竹子能走到更遠的餐桌"
        : "May Zhushan bamboo reach farther tables";
    await page.type("#zs-thought-input", wishText);
    const typed = await page.$eval("#zs-thought-input", (el) => el.value);
    ok(`${locale}: wish text can be entered`, typed.includes(wishText.slice(0, 8)), typed);

    // Drift while composer still visible
    if (await page.$("#zs-ephemeral-btn")) {
      const before = errors.length;
      await page.evaluate(() => document.getElementById("zs-ephemeral-btn").click());
      await sleep(500);
      const drift = await page.evaluate(() => {
        const st = document.getElementById("zs-ephemeral-status");
        const live = document.getElementById("zs-ephemeral-live");
        return {
          status: st && !st.hidden ? st.textContent.trim() : "",
          live: live ? live.textContent.trim() : "",
        };
      });
      ok(
        `${locale}: drift announces local-only`,
        /飄過|drift|device|畫面|API/i.test(drift.status + " " + drift.live),
        JSON.stringify(drift)
      );
      ok(`${locale}: drift no JS error`, errors.length === before, errors.slice(before).join(" | "));
    }

    await page.click("#zs-wish-generate-btn");
    await page.waitForFunction(
      () => {
        const img = document.getElementById("zs-card-preview");
        const result = document.getElementById("zs-card-result");
        return (
          result &&
          !result.hidden &&
          img &&
          img.src &&
          img.src.startsWith("data:image/png")
        );
      },
      { timeout: 25000 }
    ).catch(() => null);

    const wishCard = await page.evaluate(() => {
      const img = document.getElementById("zs-card-preview");
      const result = document.getElementById("zs-card-result");
      const edit = document.getElementById("zs-card-edit");
      return {
        ready: !!(img && img.src && img.src.startsWith("data:image/png")),
        shown: result ? !result.hidden : false,
        bytes: img && img.src ? img.src.length : 0,
        editLabel: edit ? edit.textContent.trim() : "",
      };
    });
    ok(`${locale}: wish card generated`, wishCard.ready && wishCard.shown, `bytes≈${wishCard.bytes}`);
    ok(
      `${locale}: wish edit label corrected`,
      locale === "ZH" ? wishCard.editLabel === "修改文字" : wishCard.editLabel === "Edit text",
      wishCard.editLabel
    );

    const dlOk = await page.evaluate(() => {
      try {
        const canvas = document.getElementById("zs-card-canvas");
        if (!canvas || !window.BambooShareCard) return { ok: false, reason: "missing" };
        const ctx = canvas.getContext("2d");
        const pixel = ctx.getImageData(540, 960, 1, 1).data;
        const nonEmpty = pixel[3] > 0 || pixel[0] + pixel[1] + pixel[2] > 0;
        const dataUrl = canvas.toDataURL("image/png");
        return {
          ok: nonEmpty && dataUrl.startsWith("data:image/png") && dataUrl.length > 5000,
          len: dataUrl.length,
        };
      } catch (e) {
        return { ok: false, reason: String(e) };
      }
    });
    ok(`${locale}: wish card canvas exportable PNG`, dlOk.ok, JSON.stringify(dlOk));

    if (await page.$("#zs-card-download")) {
      const beforeErr = errors.length;
      await page.evaluate(() => document.getElementById("zs-card-download").click());
      await sleep(400);
      ok(`${locale}: download click no new pageerror`, errors.length === beforeErr, errors.slice(beforeErr).join(" | "));
    }
  }

  // Filter noisy console errors (optional resource 404s for templates)
  const critical = errors.filter(
    (e) =>
      !/Failed to load resource/i.test(e) &&
      !/net::ERR_/i.test(e) &&
      !/favicon/i.test(e)
  );
  ok(`${locale}: no critical pageerrors`, critical.length === 0, critical.join(" | ") || "none");
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  try {
    const pageZh = await browser.newPage();
    pageZh.setDefaultTimeout(30000);
    await pageZh.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await testLocale(pageZh, "/zhushan/", "ZH");
    await pageZh.close();

    const pageEn = await browser.newPage();
    pageEn.setDefaultTimeout(30000);
    await pageEn.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await testLocale(pageEn, "/zhushan/en/", "EN");
    await pageEn.close();
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.pass);
  console.log("\n=== SUMMARY ===");
  console.log(`total=${results.length} pass=${results.length - failed.length} fail=${failed.length}`);
  if (failed.length) {
    failed.forEach((f) => console.log("FAIL:", f.name, f.detail));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
