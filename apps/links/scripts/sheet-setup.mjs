#!/usr/bin/env node
/**
 * Prepares the Google Sheet the links live in. Safe to re-run.
 *
 *   pnpm links:sheet-setup
 *
 * Needs (from .secrets / .env.local, never printed):
 *   GOOGLE_SERVICE_ACCOUNT_JSON  the service account's key file (one line)
 *   LINKS_SHEET_ID               or the value in apps/links/wrangler.toml
 * and the Sheet shared with the service account's email as Editor (this
 * script prints that address if access is denied).
 *
 * Sets up tab "Links" (slug | destino | etiqueta | campaña | activo | estado):
 * frozen bold header, red highlight on an invalid slug or a destination
 * without https://, a checkbox column, a warning-only protection on the
 * status column the sync writes, and a first row for fco.bz/s27 when empty.
 * Also tab "Clicks by day" with its header, filled nightly by the Worker.
 */
import { createSign } from "node:crypto";
import { loadEnv, requireValue, wranglerVar } from "./env.mjs";

const LINKS = "Links";
const SUMMARY = "Clicks by day";
const LINKS_HEADER = [
  "slug",
  "destino",
  "etiqueta",
  "campaña",
  "activo",
  "estado (lo escribe el sistema)",
];
const SUMMARY_HEADER = ["fecha", "slug", "país", "clics", "visitantes únicos"];
const FIRST_LINK = [
  "s27",
  "https://sunfest2027.furrycolombia.com",
  "Imán / QR impreso",
  "sunfest2027",
  true,
];
const ROWS = 1000;
const RED = { red: 0.98, green: 0.8, blue: 0.8 };
const STATUS_PROTECTION =
  "fco-links: columna de estado (la escribe la sincronización)";

const env = loadEnv();
const account = JSON.parse(
  requireValue(
    env,
    "GOOGLE_SERVICE_ACCOUNT_JSON",
    "Add the service account key to .env.local."
  )
);
const sheetId = env.LINKS_SHEET_ID || wranglerVar("LINKS_SHEET_ID");
if (!sheetId) {
  console.error("Missing LINKS_SHEET_ID (env or apps/links/wrangler.toml).");
  process.exit(1);
}

/** OAuth token for the service account (JWT bearer grant, RS256). */
async function accessToken() {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: account.token_uri ?? "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256")
    .update(unsigned)
    .sign(account.private_key, "base64url");
  const response = await fetch(
    account.token_uri ?? "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: `${unsigned}.${signature}`,
      }),
    }
  );
  if (!response.ok) {
    throw new Error(`Google token request failed: ${response.status}`);
  }
  return (await response.json()).access_token;
}

const token = await accessToken();

/** Call the Sheets API for this spreadsheet. */
async function sheets(method, path, body) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}${path}`,
    {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }
  );
  if (response.status === 403 || response.status === 404) {
    console.error(
      `No access to the Sheet. Share it with ${account.client_email} as Editor, then re-run.`
    );
    process.exit(1);
  }
  if (!response.ok) {
    throw new Error(
      `Sheets ${method} ${path}: ${response.status} ${await response.text()}`
    );
  }
  return response.json();
}

const fields =
  "sheets(properties(sheetId,title,index),conditionalFormats,protectedRanges)";
let spreadsheet = await sheets("GET", `?fields=${encodeURIComponent(fields)}`);
const titles = spreadsheet.sheets.map((sheet) => sheet.properties.title);

// Tabs: reuse a lone empty default tab as "Links"; add whatever is missing.
const setupTabs = [];
if (!titles.includes(LINKS)) {
  const lone =
    spreadsheet.sheets.length === 1 && !titles.includes(SUMMARY)
      ? spreadsheet.sheets[0]
      : null;
  setupTabs.push(
    lone
      ? {
          updateSheetProperties: {
            properties: { sheetId: lone.properties.sheetId, title: LINKS },
            fields: "title",
          },
        }
      : { addSheet: { properties: { title: LINKS, index: 0 } } }
  );
}
if (!titles.includes(SUMMARY)) {
  setupTabs.push({ addSheet: { properties: { title: SUMMARY } } });
}
if (setupTabs.length > 0) {
  await sheets("POST", ":batchUpdate", { requests: setupTabs });
  spreadsheet = await sheets("GET", `?fields=${encodeURIComponent(fields)}`);
}
const tab = (title) =>
  spreadsheet.sheets.find((sheet) => sheet.properties.title === title);
const links = tab(LINKS);
const summary = tab(SUMMARY);
const linksId = links.properties.sheetId;
const column = (index) => ({
  sheetId: linksId,
  startRowIndex: 1,
  endRowIndex: ROWS,
  startColumnIndex: index,
  endColumnIndex: index + 1,
});

const requests = [
  // Our conditional formats are re-created each run (delete from the end).
  ...(links.conditionalFormats ?? []).map((_, index, all) => ({
    deleteConditionalFormatRule: {
      sheetId: linksId,
      index: all.length - 1 - index,
    },
  })),
  {
    updateSheetProperties: {
      properties: { sheetId: linksId, gridProperties: { frozenRowCount: 1 } },
      fields: "gridProperties.frozenRowCount",
    },
  },
  {
    updateSheetProperties: {
      properties: {
        sheetId: summary.properties.sheetId,
        gridProperties: { frozenRowCount: 1 },
      },
      fields: "gridProperties.frozenRowCount",
    },
  },
  ...[linksId, summary.properties.sheetId].map((id) => ({
    repeatCell: {
      range: { sheetId: id, startRowIndex: 0, endRowIndex: 1 },
      cell: { userEnteredFormat: { textFormat: { bold: true } } },
      fields: "userEnteredFormat.textFormat.bold",
    },
  })),
  {
    setDataValidation: {
      range: column(4),
      rule: {
        condition: { type: "BOOLEAN" },
        showCustomUi: true,
        strict: true,
      },
    },
  },
  {
    addConditionalFormatRule: {
      index: 0,
      rule: {
        ranges: [column(0)],
        booleanRule: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue:
                  '=AND(LEN(A2)>0, NOT(REGEXMATCH(A2, "^[a-z0-9-]{1,32}$")))',
              },
            ],
          },
          format: { backgroundColor: RED },
        },
      },
    },
  },
  {
    addConditionalFormatRule: {
      index: 1,
      rule: {
        ranges: [column(1)],
        booleanRule: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue:
                  '=AND(LEN(B2)>0, NOT(REGEXMATCH(B2, "^https://")))',
              },
            ],
          },
          format: { backgroundColor: RED },
        },
      },
    },
  },
  ...((links.protectedRanges ?? []).some(
    (range) => range.description === STATUS_PROTECTION
  )
    ? []
    : [
        {
          addProtectedRange: {
            protectedRange: {
              range: column(5),
              description: STATUS_PROTECTION,
              warningOnly: true,
            },
          },
        },
      ]),
];
await sheets("POST", ":batchUpdate", { requests });

const updates = [
  { range: `${LINKS}!A1:F1`, values: [LINKS_HEADER] },
  { range: `'${SUMMARY}'!A1:E1`, values: [SUMMARY_HEADER] },
];
const firstRow = await sheets(
  "GET",
  `/values/${encodeURIComponent(`${LINKS}!A2:B2`)}`
);
if (!firstRow.values?.length) {
  updates.push({ range: `${LINKS}!A2:E2`, values: [FIRST_LINK] });
  console.log(
    "seeded row 2: fco.bz/s27 → https://sunfest2027.furrycolombia.com"
  );
}
await sheets("POST", "/values:batchUpdate", {
  valueInputOption: "USER_ENTERED",
  data: updates,
});

console.log(
  `Sheet ready: https://docs.google.com/spreadsheets/d/${sheetId}/edit`
);
console.log(`Service account with access: ${account.client_email}`);
