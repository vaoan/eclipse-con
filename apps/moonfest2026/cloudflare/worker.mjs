const CARRD_ORIGIN = "https://furrycolombia.carrd.co";
const CARRD_HOST = "furrycolombia.carrd.co";
const PRIMARY_DOMAIN = "https://furrycolombia.com";
const INTERNAL_ERROR_STATUS = 503;
const INTERNAL_ERROR_TEXT = "Temporary worker error";
const RUNTIME_CONFIG_KEYS = [
  "VITE_ANALYTICS_ENABLED",
  "VITE_ANALYTICS_ENDPOINT",
  "VITE_ANALYTICS_PROFILE",
  "VITE_APP_NAME",
  "VITE_APP_VERSION",
  "VITE_CF_WEB_ANALYTICS_ENABLED",
  "VITE_CF_WEB_ANALYTICS_TOKEN",
  "VITE_DEBUG",
  "VITE_DEFAULT_LOCALE",
  "VITE_ENABLE_TEST_IDS",
  "VITE_GA_MEASUREMENT_ENABLED",
  "VITE_GA_MEASUREMENT_ID",
  "VITE_GTM_ENABLED",
  "VITE_GTM_CONTAINER_ID",
  "VITE_POSTHOG_API_KEY",
  "VITE_POSTHOG_HOST",
  "VITE_SUPPORTED_LOCALES",
];

function isCarrdProxyHost(hostname) {
  return hostname === "furrycolombia.com";
}

function rewriteCarrdString(value) {
  return value
    .replaceAll(CARRD_ORIGIN, PRIMARY_DOMAIN)
    .replaceAll(`//${CARRD_HOST}`, "//furrycolombia.com")
    .replaceAll(CARRD_HOST, "furrycolombia.com");
}

function rewriteCarrdHeaders(headers) {
  const nextHeaders = new Headers(headers);
  nextHeaders.delete("set-cookie");

  const location = nextHeaders.get("location");
  if (location) {
    nextHeaders.set("location", rewriteCarrdString(location));
  }

  return nextHeaders;
}

function buildRuntimeConfig(env) {
  return Object.fromEntries(
    RUNTIME_CONFIG_KEYS.map((key) => [
      key,
      typeof env[key] === "string" ? env[key] : "",
    ])
  );
}

function serializeRuntimeConfig(runtimeConfig) {
  return JSON.stringify(runtimeConfig).replaceAll("<", "\\u003c");
}

function injectRuntimeConfig(html, env) {
  const runtimeConfig = buildRuntimeConfig(env);
  const runtimeScript = `<script>window.__ECLIPSE_CON_RUNTIME_CONFIG__=${serializeRuntimeConfig(runtimeConfig)};</script>`;

  if (html.includes("</head>")) {
    return html.replace("</head>", `${runtimeScript}</head>`);
  }

  return `${runtimeScript}${html}`;
}

function buildProxyRequestInit(request, headers) {
  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  return init;
}

function buildWorkerErrorResponse(message = INTERNAL_ERROR_TEXT) {
  return new Response(message, {
    status: INTERNAL_ERROR_STATUS,
    headers: {
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

async function proxyCarrdRequest(request) {
  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(
    `${incomingUrl.pathname}${incomingUrl.search}`,
    CARRD_ORIGIN
  );
  const upstreamHeaders = new Headers(request.headers);
  upstreamHeaders.set("host", CARRD_HOST);
  upstreamHeaders.set("origin", CARRD_ORIGIN);

  const upstreamRequest = new Request(
    upstreamUrl,
    buildProxyRequestInit(request, upstreamHeaders)
  );

  const upstreamResponse = await fetch(upstreamRequest);
  const responseHeaders = rewriteCarrdHeaders(upstreamResponse.headers);
  const contentType = responseHeaders.get("content-type") ?? "";

  if (contentType.includes("text/html")) {
    const html = rewriteCarrdString(await upstreamResponse.text());
    responseHeaders.delete("content-length");
    return new Response(html, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  }

  // Buffer the body so stream errors stay inside the caller's try/catch
  // instead of escaping after the handler returns (which causes Error 1101).
  const body = await upstreamResponse.arrayBuffer();
  return new Response(body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

async function serveAppAsset(request, env) {
  const assetResponse = await env.ASSETS.fetch(request);
  const responseHeaders = new Headers(assetResponse.headers);
  const contentType = responseHeaders.get("content-type") ?? "";

  if (!contentType.includes("text/html")) {
    // Buffer the body so stream errors stay inside the caller's try/catch
    // instead of escaping after the handler returns (which causes Error 1101).
    const body = await assetResponse.arrayBuffer();
    return new Response(body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers: responseHeaders,
    });
  }

  const html = injectRuntimeConfig(await assetResponse.text(), env);
  responseHeaders.delete("content-length");
  return new Response(html, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers: responseHeaders,
  });
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (isCarrdProxyHost(url.hostname)) {
        return await proxyCarrdRequest(request);
      }

      return await serveAppAsset(request, env);
    } catch (error) {
      console.error("Worker request failed", {
        message: error instanceof Error ? error.message : String(error),
        method: request.method,
        url: request.url,
      });

      try {
        if (!isCarrdProxyHost(new URL(request.url).hostname)) {
          return await env.ASSETS.fetch(request);
        }
      } catch (assetError) {
        console.error("Worker asset fallback failed", {
          message:
            assetError instanceof Error
              ? assetError.message
              : String(assetError),
          method: request.method,
          url: request.url,
        });
      }

      return buildWorkerErrorResponse();
    }
  },
};
