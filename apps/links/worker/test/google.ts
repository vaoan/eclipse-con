import type { CellValue, Fetcher } from "../sheet";

/** A throwaway service-account key file (fresh RSA key, fake email). */
export async function fakeServiceAccountJson(): Promise<string> {
  const pair = (await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  )) as CryptoKeyPair;
  const der = (await crypto.subtle.exportKey(
    "pkcs8",
    pair.privateKey
  )) as ArrayBuffer;
  let binary = "";
  for (const byte of new Uint8Array(der)) {
    binary += String.fromCodePoint(byte);
  }
  const base64 = btoa(binary);
  const pem = `-----BEGIN PRIVATE KEY-----\n${base64}\n-----END PRIVATE KEY-----\n`;
  return JSON.stringify({
    client_email: "fco-links@test-project.iam.gserviceaccount.com",
    private_key: pem,
    token_uri: "https://oauth2.googleapis.com/token",
  });
}

/** A recorded call to the fake Google. */
export interface GoogleCall {
  readonly url: string;
  readonly method: string;
  readonly body: unknown;
}

/**
 * Fake Google endpoints: the token exchange and the Sheets values API over an
 * in-memory grid for the "Links" tab.
 *
 * @param links - Rows of the Links tab from row 2 down.
 * @returns The fetcher, the calls it saw and the live grid.
 */
export function fakeGoogle(links: CellValue[][]): {
  fetcher: Fetcher;
  calls: GoogleCall[];
  grid: CellValue[][];
  appended: CellValue[][];
} {
  const grid = links.map((row) => [...row]);
  const appended: CellValue[][] = [];
  const calls: GoogleCall[] = [];
  const fetcher: Fetcher = (input, init) => {
    const method = init?.method ?? "GET";
    const rawBody = typeof init?.body === "string" ? init.body : null;
    const body: unknown =
      rawBody?.startsWith("{") === true ? JSON.parse(rawBody) : rawBody;
    calls.push({ url: input, method, body });

    if (input.startsWith("https://oauth2.googleapis.com/token")) {
      return Promise.resolve(
        Response.json({ access_token: "fake-token", expires_in: 3600 })
      );
    }
    if (input.includes(":batchUpdate")) {
      const { data } = body as {
        data: { range: string; values: CellValue[][] }[];
      };
      for (const { range, values } of data) {
        const row = Number(/F(\d+)$/.exec(range)?.[1]) - 2;
        const target = grid[row] ?? [];
        target[5] = values[0]?.[0] ?? "";
        grid[row] = target;
      }
      return Promise.resolve(Response.json({}));
    }
    if (input.includes(":append")) {
      appended.push(...(body as { values: CellValue[][] }).values);
      return Promise.resolve(Response.json({}));
    }
    if (input.includes("/values/")) {
      return Promise.resolve(Response.json({ values: grid }));
    }
    return Promise.resolve(new Response("not found", { status: 404 }));
  };
  return { fetcher, calls, grid, appended };
}
