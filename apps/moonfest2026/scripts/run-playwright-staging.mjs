import { spawnSync } from "node:child_process";

const baseUrl =
  process.env.PLAYWRIGHT_BASE_URL ??
  "https://eclipse-con-staging.furrycolombia.workers.dev";

const command =
  process.platform === "win32"
    ? [
        "cmd.exe",
        ["/c", "pnpm", "playwright", "test", "e2e/browser-routing.spec.ts"],
      ]
    : ["pnpm", ["playwright", "test", "e2e/browser-routing.spec.ts"]];

const result = spawnSync(command[0], command[1], {
  stdio: "inherit",
  env: {
    ...process.env,
    PLAYWRIGHT_BASE_URL: baseUrl,
  },
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
