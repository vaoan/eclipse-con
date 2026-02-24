#!/usr/bin/env node
/**
 * Upload a file to pCloud.
 *
 * Usage:
 *   PCLOUD_TOKEN=xxx PCLOUD_FOLDER_ID=12345 node scripts/upload-to-pcloud.mjs dist/index.html
 *
 * Required env vars:
 *   PCLOUD_TOKEN      OAuth access token with write scope.
 * Optional env vars:
 *   PCLOUD_FOLDER_ID  Target folder ID (default: 0, the root folder).
 *   PCLOUD_API_HOST   API host override (default: https://api.pcloud.com).
 */
import { basename, resolve } from "node:path";
import { readFile, stat } from "node:fs/promises";

const token = process.env.PCLOUD_TOKEN;
const folderId = process.env.PCLOUD_FOLDER_ID ?? "0";
const apiHost = process.env.PCLOUD_API_HOST ?? "https://api.pcloud.com";
const filePath = process.argv[2];

async function main() {
  if (!token) {
    throw new Error("PCLOUD_TOKEN is required");
  }

  if (!filePath) {
    throw new Error("Provide a file path to upload, e.g. dist/index.html");
  }

  const absolutePath = resolve(filePath);
  const stats = await stat(absolutePath);
  if (!stats.isFile()) {
    throw new Error(`Path is not a file: ${absolutePath}`);
  }

  const fileName = basename(absolutePath);
  const fileBuffer = await readFile(absolutePath);
  const file = new File([fileBuffer], fileName, {
    type: "application/octet-stream",
    lastModified: stats.mtimeMs,
  });

  const form = new FormData();
  form.set("file", file);
  form.set("folderid", folderId);
  form.set("nopartial", "1");

  const endpoint = `${apiHost.replace(/\/$/, "")}/uploadfile?access_token=${encodeURIComponent(token)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: form,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.result !== 0) {
    const message = payload?.error || payload?.message || "Upload failed";
    throw new Error(`pCloud upload error: ${message}`);
  }

  const uploaded = payload?.metadata?.[0];
  const uploadedPath = uploaded?.path || uploaded?.name || fileName;
  console.log(`Uploaded ${fileName} to pCloud at ${uploadedPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
