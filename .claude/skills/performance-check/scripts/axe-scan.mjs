#!/usr/bin/env node
/**
 * axe-scan.mjs — WCAG 2.1 AA accessibility scan via Playwright + axe-core
 *
 * Usage:
 *   node axe-scan.mjs <base-url> [--routes <route1,route2,...>]
 *
 * Examples:
 *   node axe-scan.mjs http://localhost:5173
 *   node axe-scan.mjs http://localhost:5173 --routes root,/registration-tutorial
 *   node axe-scan.mjs "file:///Z:/path/dist-static/index.html" --routes root,/registration-tutorial
 *
 * Routes use "root" as an alias for "/" to avoid Git-Bash path expansion on Windows.
 *
 * Output: compact JSON to stdout — parse it in the skill, do not pipe to humans directly.
 */

import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const IMPACT_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };

const baseUrl = process.argv[2] ?? "http://localhost:5173";
const isFile = baseUrl.startsWith("file://");

// Parse --routes flag; use "root" as alias for "/" to avoid Git-Bash path expansion
const routesIdx = process.argv.indexOf("--routes");
const rawRoutes =
  routesIdx >= 0 ? process.argv[routesIdx + 1] : "root,/registration-tutorial";
const routes = rawRoutes
  .split(",")
  .map((r) => (r.trim() === "root" ? "/" : r.trim()));

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();

const byId = new Map();
let totalPasses = 0;
let totalIncomplete = 0;
const errors = [];

for (const route of routes) {
  const url = isFile
    ? route === "/" || route === ""
      ? baseUrl
      : `${baseUrl}#${route}`
    : `${baseUrl}${route}`;

  const page = await ctx.newPage();

  // Pre-set tracking consent so the consent gate doesn't block the scan
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem(
        "tracking_consent_v1",
        JSON.stringify({
          version: 1,
          updatedAt: new Date().toISOString(),
          source: "accept_all",
          categories: {
            necessary: true,
            analytics: true,
            personalization: true,
            advertising: true,
          },
        })
      );
    } catch {
      // localStorage may be unavailable on some origins — ignore
    }
  });

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    // Let scroll-reveal animations settle so hidden elements don't skew results
    await page.waitForTimeout(600);

    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
      .analyze();

    totalPasses += result.passes.length;
    totalIncomplete += result.incomplete.length;

    for (const v of result.violations) {
      if (!byId.has(v.id)) {
        byId.set(v.id, {
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          count: 0,
          routes: new Set(),
          elements: [],
        });
      }
      const entry = byId.get(v.id);
      entry.count += v.nodes.length;
      entry.routes.add(route);
      // Collect up to 2 element selectors per page to keep output small
      entry.elements.push(
        ...v.nodes.slice(0, 2).map((n) => n.target.join(" > "))
      );
    }
  } catch (err) {
    errors.push({ route, error: err.message });
  } finally {
    await page.close();
  }
}

await ctx.close();
await browser.close();

const violations = [...byId.values()]
  .sort((a, b) => (IMPACT_ORDER[a.impact] ?? 9) - (IMPACT_ORDER[b.impact] ?? 9))
  .map((v) => ({
    ...v,
    routes: [...v.routes],
    // Deduplicate selectors, cap at 3 to keep JSON small
    elements: [...new Set(v.elements)].slice(0, 3),
  }));

const summary = violations.reduce(
  (acc, v) => ({ ...acc, [v.impact]: (acc[v.impact] ?? 0) + v.count }),
  {}
);

const totalViolations = Object.values(summary).reduce((s, n) => s + n, 0);

process.stdout.write(
  JSON.stringify(
    {
      baseUrl,
      scanned: routes,
      summary,
      totalViolations,
      totalPasses,
      totalIncomplete,
      violations,
      errors,
    },
    null,
    2
  )
);
