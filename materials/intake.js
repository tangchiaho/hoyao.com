(function (global) {
  "use strict";

  function cfg() {
    return global.HOYAO_MATERIALS_CONFIG || {};
  }

  function apiBase() {
    var c = cfg();
    if (c.intakeApiUrl) return c.intakeApiUrl;
    var host = location.hostname;
    var local =
      host === "127.0.0.1" || host === "localhost" || host === "0.0.0.0";
    if (c.useLocalMockWhenEmpty && local && c.localMockApiUrl) {
      return c.localMockApiUrl;
    }
    return "";
  }

  function newClientRequestId() {
    if (global.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "cr-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function postJson(body) {
    var base = apiBase();
    if (!base) {
      return Promise.reject(new Error("intake_not_configured"));
    }
    return fetch(base, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
      redirect: "follow",
    }).then(function (res) {
      return res.text().then(function (text) {
        var data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          throw new Error("invalid_response");
        }
        if (!res.ok && !data.ok) {
          var e = new Error(data.error || "request_failed");
          e.payload = data;
          e.status = res.status;
          throw e;
        }
        return data;
      });
    });
  }

  function submitOrder(fields) {
    var clientRequestId = fields.clientRequestId || newClientRequestId();
    try {
      sessionStorage.setItem("hoyaoMaterialsLastClientRequestId", clientRequestId);
    } catch (err) {}

    var payload = {
      action: "submit",
      clientRequestId: clientRequestId,
      consentContact: !!fields.consentContact,
      contactName: fields.contactName || "",
      contactEmail: fields.contactEmail || "",
      contactPhone: fields.contactPhone || "",
      material: fields.material || "",
      spec: fields.spec || "",
      qty: fields.qty || "",
      process: fields.process || "",
      due: fields.due || "",
      useCase: fields.useCase || "",
    };

    return postJson(payload).then(function (data) {
      if (data && data.ok && data.orderId) {
        try {
          localStorage.setItem(
            "hoyaoMaterialsLastOrder",
            JSON.stringify({
              orderId: data.orderId,
              accessToken: data.accessToken,
              trackUrl: data.trackUrl,
              at: new Date().toISOString(),
            })
          );
        } catch (err) {}
      }
      return data;
    });
  }

  function getOrder(orderId, accessToken, adminToken) {
    return postJson({
      action: "get",
      orderId: orderId,
      accessToken: accessToken || "",
      adminToken: adminToken || "",
    });
  }

  function updateStatus(fields) {
    return postJson(
      Object.assign({ action: "updateStatus" }, fields || {})
    );
  }

  function statusLabel(code) {
    var map = cfg().statusLabels || {};
    return map[code] || code || "未知";
  }

  function bindFormalForm(form, options) {
    options = options || {};
    var statusEl = options.statusEl;
    var resultEl = options.resultEl;
    var submitBtn = form.querySelector('[type="submit"]');
    var submitting = false;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submitting) return;
      if (!form.consentContact || !form.consentContact.checked) {
        setStatus(statusEl, "請先同意留下聯絡資料，以便回覆規格與進度。", true);
        return;
      }
      if (!apiBase()) {
        setStatus(
          statusEl,
          "正式收件尚未設定 intakeApiUrl。請和曜部署 Apps Script 後再啟用。",
          true
        );
        return;
      }

      submitting = true;
      if (submitBtn) submitBtn.disabled = true;
      setStatus(statusEl, "送出中…", false);

      var fd = new FormData(form);
      submitOrder({
        consentContact: true,
        contactName: fd.get("contactName"),
        contactEmail: fd.get("contactEmail"),
        contactPhone: fd.get("contactPhone"),
        material: fd.get("material"),
        spec: fd.get("spec"),
        qty: fd.get("qty"),
        process: fd.get("process"),
        due: fd.get("due"),
        useCase: fd.get("useCase"),
        clientRequestId: fd.get("clientRequestId") || newClientRequestId(),
      })
        .then(function (data) {
          if (!data.ok) throw new Error(data.error || "submit_failed");
          var msg = data.duplicate
            ? "偵測到重複送出，已回傳既有工單。"
            : "已送出，後端已建立工單。";
          setStatus(statusEl, msg, false);
          if (resultEl) {
            resultEl.hidden = false;
            resultEl.innerHTML =
              "<strong>工單編號 " +
              escapeHtml(data.orderId) +
              "</strong>" +
              '<div class="note">請保存專屬連結；僅你可查看此工單進度。</div>' +
              '<p><a class="cta" href="' +
              escapeHtml(data.trackUrl || trackHref(data.orderId, data.accessToken)) +
              '">查看進度</a></p>' +
              '<p class="note">accessToken 已綁定此連結，請勿公開分享。</p>';
          }
          if (typeof options.onSuccess === "function") options.onSuccess(data);
        })
        .catch(function (err) {
          var code = err && err.message;
          var human =
            code === "intake_not_configured"
              ? "正式收件尚未設定。"
              : code === "consent_required"
                ? "需同意留下聯絡資料。"
                : code === "contact_required"
                  ? "請填姓名與 Email 或電話。"
                  : "提交失敗，請稍後再試或改用其他聯絡方式。";
          setStatus(statusEl, human + (code ? "（" + code + "）" : ""), true);
          if (typeof options.onError === "function") options.onError(err);
        })
        .then(function () {
          submitting = false;
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  function trackHref(orderId, accessToken) {
    return (
      "track.html?orderId=" +
      encodeURIComponent(orderId) +
      "&accessToken=" +
      encodeURIComponent(accessToken)
    );
  }

  function setStatus(el, text, isError) {
    if (!el) return;
    el.hidden = false;
    el.textContent = text;
    el.style.color = isError ? "#8a3b2b" : "";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  global.HoyaoMaterialsIntake = {
    apiBase: apiBase,
    submitOrder: submitOrder,
    getOrder: getOrder,
    updateStatus: updateStatus,
    statusLabel: statusLabel,
    bindFormalForm: bindFormalForm,
    newClientRequestId: newClientRequestId,
    trackHref: trackHref,
    escapeHtml: escapeHtml,
  };
})(window);
