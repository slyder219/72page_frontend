(function () {
  const AUTH_STATUS_URL = "https://seventytwo-page-backend-707359936404.us-central1.run.app/website/auth-status";
  const mount = document.getElementById("auth-status-widget");

  if (!mount) {
    return;
  }

  mount.innerHTML = [
    '<div class="auth-status" aria-live="polite">',
    '  <div class="auth-status-head">',
    '    <div>',
    '      <h3 class="auth-status-title">Auth Status</h3>',
    '      <p class="auth-status-meta">Endpoint: <a class="auth-status-endpoint" href="' + AUTH_STATUS_URL + '" target="_blank" rel="noopener noreferrer">/website/auth-status</a></p>',
    "    </div>",
    '    <span id="auth-status-badge" class="auth-status-badge">Idle</span>',
    "  </div>",
    '  <div class="auth-status-actions">',
    '    <button id="auth-status-rerun" class="btn btn-ghost" type="button">Re-run</button>',
    '    <span id="auth-status-note" class="auth-status-note">Initial check uses GET.</span>',
    "  </div>",
    '  <div id="auth-status-summary" class="auth-status-summary">Awaiting first response...</div>',
    '  <pre id="auth-status-output" class="auth-status-output">Waiting to run auth status check...</pre>',
    "</div>"
  ].join("\n");

  const badgeEl = document.getElementById("auth-status-badge");
  const rerunButton = document.getElementById("auth-status-rerun");
  const outputEl = document.getElementById("auth-status-output");
  const noteEl = document.getElementById("auth-status-note");
  const summaryEl = document.getElementById("auth-status-summary");
  const LOG_PREFIX = "[auth-status]";

  function setBadge(label, type) {
    badgeEl.textContent = label;
    badgeEl.className = "auth-status-badge" + (type ? " " + type : "");
  }

  function prettyPayload(payload) {
    if (typeof payload === "string") {
      return payload;
    }

    try {
      return JSON.stringify(payload, null, 2);
    } catch (_error) {
      return String(payload);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSummary(summary, payload) {
    if (!payload || typeof payload !== "object") {
      summaryEl.textContent = "No structured payload to summarize.";
      return;
    }

    const rootAuth = payload.authenticated;
    const auth = payload.auth || {};
    const checks = auth.checks || {};
    const request = payload.request || {};
    const rateLimit = checks.rate_limit || {};
    const origin = checks.origin || {};
    const referer = checks.referer || {};
    const allowed = checks.allowed_origins_configured || {};

    const kvRows = [
      ["Authenticated", rootAuth],
      ["Auth.Authenticated", auth.authenticated],
      ["HTTP", summary.status + " " + summary.statusText],
      ["Method", request.method || summary.method],
      ["Path", request.path || "/website/auth-status"],
      ["Client IP", auth.client_ip || "not provided"],
      ["Origin", origin.value || request.headers?.origin || "not provided"],
      ["Referer", referer.value || request.headers?.referer || "not provided"]
    ];

    const checksList = [
      ["Allowed Origins", allowed.ok, Array.isArray(allowed.value) ? allowed.value.join(", ") : allowed.value],
      ["Origin Check", origin.ok, origin.value],
      ["Referer Check", referer.ok, referer.value],
      ["Rate Limit", rateLimit.ok, "remaining " + (rateLimit.remaining ?? "?") + " / " + (rateLimit.limit_per_minute ?? "?")]
    ];

    const kvHtml = kvRows
      .map(function (entry) {
        const label = entry[0];
        const value = entry[1] == null ? "not provided" : String(entry[1]);
        return '<div class="auth-status-kv"><span class="auth-status-k">' + escapeHtml(label) + '</span><span class="auth-status-v">' + escapeHtml(value) + "</span></div>";
      })
      .join("");

    const checksHtml = checksList
      .map(function (entry) {
        const label = entry[0];
        const ok = entry[1];
        const value = entry[2] == null ? "" : String(entry[2]);
        const state = ok === true ? "ok" : ok === false ? "fail" : "neutral";
        const stateLabel = ok === true ? "ok" : ok === false ? "fail" : "n/a";
        return '<div class="auth-status-pill ' + state + '"><strong>' + escapeHtml(label) + '</strong><span>' + escapeHtml(stateLabel + (value ? " - " + value : "")) + "</span></div>";
      })
      .join("");

    summaryEl.innerHTML = [
      '<div class="auth-status-grid">' + kvHtml + "</div>",
      '<div class="auth-status-pills">' + checksHtml + "</div>"
    ].join("\n");
  }

  async function runCheck(method) {
    const startedAt = new Date().toISOString();
    console.info(LOG_PREFIX, "request:start", { method, url: AUTH_STATUS_URL, startedAt });

    setBadge("Running", "running");
    rerunButton.disabled = true;
    summaryEl.textContent = "Running check...";
    outputEl.textContent = "Running " + method + " request...";
    noteEl.textContent = method === "GET" ? "Auth status checks use GET." : "Auth status checks use POST.";

    try {
      const response = await fetch(AUTH_STATUS_URL, {
        method,
        headers: {
          Accept: "application/json, text/plain;q=0.9"
        },
        body: method === "POST" ? JSON.stringify({ trigger: "homepage-rerun" }) : undefined
      });

      console.info(LOG_PREFIX, "request:response", {
        method,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const rawText = await response.text();
      let payload = rawText;

      try {
        payload = rawText ? JSON.parse(rawText) : { message: "No response body" };
      } catch (_error) {
        payload = rawText || "No response body";
      }

      console.info(LOG_PREFIX, "request:payload", {
        method,
        payloadType: typeof payload,
        authenticated: payload && typeof payload === "object" ? payload.authenticated : undefined
      });

      const summary = {
        method,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        checkedAt: new Date().toISOString(),
        payload
      };

      renderSummary(summary, payload);
      outputEl.textContent = prettyPayload(summary);
      setBadge(response.ok ? "OK" : "Error", response.ok ? "success" : "error");
    } catch (error) {
      console.error(LOG_PREFIX, "request:error", {
        method,
        message: error && error.message ? error.message : String(error)
      });
      summaryEl.textContent = "Request failed before a valid response body could be summarized.";
      outputEl.textContent = prettyPayload({
        method,
        checkedAt: new Date().toISOString(),
        error: error && error.message ? error.message : String(error)
      });
      setBadge("Error", "error");
    } finally {
      rerunButton.disabled = false;
    }
  }

  rerunButton.addEventListener("click", function () {
    runCheck("GET");
  });

  runCheck("GET");
})();

