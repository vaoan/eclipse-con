#!/usr/bin/env node
/**
 * Helper to obtain a pCloud OAuth access token.
 *
 * Steps:
 * 1) Provide your app's client_id, client_secret, and redirect URI (as registered in pCloud).
 * 2) Open the generated authorize URL, approve, then paste back the ?code=... from the redirect.
 * 3) Script exchanges the code for an access_token and prints it (nothing is stored).
 */
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = createInterface({ input, output });

async function prompt(question, fallback) {
  const answer = await rl.question(
    fallback ? `${question} (${fallback}): ` : `${question}: `
  );
  return answer.trim() || fallback || "";
}

async function main() {
  console.log("pCloud OAuth helper — nothing is stored, keep your secrets safe.\n");

  const clientId = await prompt("Client ID");
  const clientSecret = await prompt("Client Secret");
  const redirectUri = await prompt("Redirect URI", "https://localhost/blank");
  const scope = await prompt("Scope", "upload");

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("client_id, client_secret, and redirect_uri are required.");
  }

  const authorizeUrl = new URL("https://my.pcloud.com/oauth2/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", scope);

  console.log("\n1) Open this URL, approve access, and copy the 'code' from the redirect:");
  console.log(authorizeUrl.toString());

  const code = await prompt("\nPaste the 'code' query param from the redirect URL");
  if (!code) {
    throw new Error("Authorization code is required.");
  }

  const tokenResponse = await fetch("https://api.pcloud.com/oauth2_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
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

  console.log("\nAccess token (keep it secret, don’t commit it):");
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
