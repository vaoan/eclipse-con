/** Minimal Worker: serve the sunfest teaser's static asset bundle. */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
