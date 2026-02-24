#!/usr/bin/env node
/**
 * Guided helper to obtain a pCloud OAuth access token.
 * - Reads client_id/client_secret from env or prompts you.
 * - Spins up a local http://localhost:<port>/callback to catch the redirect automatically.
 * - Opens the authorize URL in your browser; you sign in and approve.
 * - Exchanges the code for an access_token and prints it. Nothing is stored.
 */
import http from "node:http";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = createInterface({ input, output });

async function prompt(question, fallback) {
  const answer = await rl.question(
    fallback ? `${question} (${fallback}): ` : `${question}: `
  );
  return answer.trim() || fallback || "";
}

function launchBrowser(url) {
  const isWindows = process.platform === "win32";
  const opener = isWindows ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  const child = spawn(opener, [url], { stdio: "ignore", shell: true });
  child.on("error", () => {
    console.log(`\nOpen this URL in your browser:\n${url}\n`);
  });
}

function startRedirectServer(port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (!req.url?.startsWith("/callback")) {
        res.writeHead(404).end();
        return;
      }
      const url = new URL(req.url, `http://localhost:${port}`);
      const code = url.searchParams.get("code");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        `<body style="font-family: sans-serif; background:#0a0b1a; color:#e8e4df;"><h2>You can close this window.</h2><p>Returned code: ${code ?? "missing"}</p></body>`
      );
      resolve({ code, server });
    });
    server.listen(port);
  });
}

async function exchangeCode({ clientId, clientSecret, redirectUri, code }) {
  const tokenResponse = await fetch("https://api.pcloud.com/oauth2_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }).toString(),
  });
  const payload = await tokenResponse.json().catch(() => ({}));

  if (!tokenResponse.ok || payload.result !== 0 || !payload.access_token) {
    const message = payload?.error || payload?.message || "Token exchange failed";
    throw new Error(message);
  }
  return payload;
}

async function main() {
  console.log("pCloud OAuth helper — nothing is stored, keep your secrets safe.\n");

  const clientId =
    process.env.PCLOUD_CLIENT_ID || (await prompt("Client ID (pCloud developer app)"));
  const clientSecret =
    process.env.PCLOUD_CLIENT_SECRET || (await prompt("Client Secret"));
  const port = Number(process.env.PCLOUD_REDIRECT_PORT || "4280");
  const redirectUri =
    process.env.PCLOUD_REDIRECT_URI || `http://localhost:${port}/callback`;
  const scope = process.env.PCLOUD_SCOPE || (await prompt("Scope", "upload"));

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("client_id, client_secret, and redirect_uri are required.");
  }

  console.log(`\nListening on ${redirectUri} to catch the redirect...`);
  const redirectPromise = startRedirectServer(port);

  const authorizeUrl = new URL("https://my.pcloud.com/oauth2/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", scope);

  console.log("\nOpening browser for authorization...");
  launchBrowser(authorizeUrl.toString());
  console.log(`If it doesn't open automatically, visit:\n${authorizeUrl.toString()}\n`);

  const { code, server } = await redirectPromise;
  server.close();

  if (!code) {
    throw new Error("No authorization code returned. Try again and ensure you approve access.");
  }

  const payload = await exchangeCode({ clientId, clientSecret, redirectUri, code });

  console.log("\nAccess token (keep it secret, do NOT commit it):");
  console.log(payload.access_token);
  if (payload.expires_in) {
    console.log(`Expires in: ${payload.expires_in} seconds`);
  }
  rl.close();
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  rl.close();
  process.exit(1);
});
