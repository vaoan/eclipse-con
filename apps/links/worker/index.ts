import { authenticate } from "./access";
import { handleApi } from "./api";
import { ADMIN_HOST, type Env } from "./env";
import { handleRedirect } from "./redirect";
import { handleScheduled } from "./scheduled";

/** Cloudflare's per-colo cache; absent outside the Workers runtime. */
function defaultCache(): Cache | undefined {
  return typeof caches === "undefined" ? undefined : caches.default;
}

/**
 * Dashboard host: `/api/*` after the Access check, otherwise the SPA. Local
 * `wrangler dev` (localhost) reaches the API under `/api` too.
 */
async function handleAdmin(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) {
    return env.ASSETS.fetch(request);
  }
  const auth = await authenticate(request, env);
  if (!auth.ok) {
    return auth.response;
  }
  return handleApi(request, {
    env,
    identity: auth.identity,
    now: Date.now(),
    fetcher: (input, init) => fetch(input, init),
    cache: defaultCache(),
  });
}

export default {
  /**
   * Routes by host: admin.fco.bz → dashboard + API; anything else (fco.bz)
   * → short-link redirect.
   */
  async fetch(request, env, context): Promise<Response> {
    const url = new URL(request.url);
    const isLocalApi =
      url.hostname === "localhost" && url.pathname.startsWith("/api/");
    if (url.hostname === ADMIN_HOST || isLocalApi) {
      return handleAdmin(request, env);
    }
    return handleRedirect(request, {
      env,
      waitUntil: (promise) => {
        context.waitUntil(promise);
      },
      cache: defaultCache(),
      now: Date.now(),
    });
  },

  /** The single every-minute cron; see `scheduled.ts` for the fan-out. */
  async scheduled(controller, env): Promise<void> {
    await handleScheduled(
      controller.scheduledTime,
      env,
      defaultCache(),
      (input, init) => fetch(input, init)
    );
  },
} satisfies ExportedHandler<Env>;
