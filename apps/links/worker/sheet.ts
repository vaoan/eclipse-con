/** The fields of a Google service-account key file this client needs. */
export interface ServiceAccount {
  /** `…@….iam.gserviceaccount.com` — share the Sheet with this address. */
  readonly client_email: string;
  /** PKCS#8 PEM private key. */
  readonly private_key: string;
  /** OAuth token endpoint. */
  readonly token_uri: string;
}

/** Scope for reading and writing spreadsheets. */
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const DEFAULT_TOKEN_URI = "https://oauth2.googleapis.com/token";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
/** Token lifetime requested from Google (the maximum, one hour). */
const TOKEN_SECONDS = 3600;
/** Refresh a cached token this long before it expires. */
const REFRESH_MARGIN_MS = 60_000;

/** `fetch`, injectable so tests can fake Google. */
export type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Parses the `GOOGLE_SERVICE_ACCOUNT_JSON` secret.
 *
 * @param json - Key file contents (one line).
 * @returns The account, or null when absent or malformed.
 */
export function parseServiceAccount(
  json: string | undefined
): ServiceAccount | null {
  if (!json) {
    return null;
  }
  try {
    const parsed = JSON.parse(json) as Partial<ServiceAccount>;
    if (
      typeof parsed.client_email !== "string" ||
      typeof parsed.private_key !== "string"
    ) {
      return null;
    }
    return {
      client_email: parsed.client_email,
      private_key: parsed.private_key,
      token_uri:
        typeof parsed.token_uri === "string"
          ? parsed.token_uri
          : DEFAULT_TOKEN_URI,
    };
  } catch {
    return null;
  }
}

/** base64url of bytes or a UTF-8 string. */
function base64Url(input: string | ArrayBuffer): string {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte);
  }
  let encoded = btoa(binary).replaceAll("+", "-").replaceAll("/", "_");
  while (encoded.endsWith("=")) {
    encoded = encoded.slice(0, -1);
  }
  return encoded;
}

/** DER bytes of a PEM block. */
function pemToDer(pem: string): ArrayBuffer {
  const body = pem.replaceAll(/-----[A-Z ]+-----/g, "").replaceAll(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.codePointAt(index) ?? 0;
  }
  return bytes.buffer;
}

/**
 * The signed JWT assertion Google exchanges for an access token (RS256 with
 * WebCrypto, so no Google SDK in the Worker).
 *
 * @param account - Service account.
 * @param nowSeconds - Clock in seconds.
 * @returns `header.claims.signature`.
 */
export async function signAssertion(
  account: ServiceAccount,
  nowSeconds: number
): Promise<string> {
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(
    JSON.stringify({
      iss: account.client_email,
      scope: SHEETS_SCOPE,
      aud: account.token_uri,
      iat: nowSeconds,
      exp: nowSeconds + TOKEN_SECONDS,
    })
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(account.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${header}.${claims}`)
  );
  return `${header}.${claims}.${base64Url(signature)}`;
}

const tokens = new Map<string, { token: string; expiresAt: number }>();

/** Forget cached access tokens (tests). */
export function resetTokenCache(): void {
  tokens.clear();
}

/**
 * An OAuth access token for the service account, cached per isolate until a
 * minute before it expires.
 *
 * @param account - Service account.
 * @param now - Clock, ms.
 * @param fetcher - `fetch`.
 * @returns Bearer token.
 */
export async function getAccessToken(
  account: ServiceAccount,
  now: number,
  fetcher: Fetcher
): Promise<string> {
  const cached = tokens.get(account.client_email);
  if (cached && cached.expiresAt - REFRESH_MARGIN_MS > now) {
    return cached.token;
  }
  const assertion = await signAssertion(account, Math.floor(now / 1000));
  const response = await fetcher(account.token_uri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });
  if (!response.ok) {
    throw new Error(`Google token request failed: ${response.status}`);
  }
  const body = await response.json<{
    access_token: string;
    expires_in: number;
  }>();
  tokens.set(account.client_email, {
    token: body.access_token,
    expiresAt: now + body.expires_in * 1000,
  });
  return body.access_token;
}

/** A cell value as the Sheets API returns it unformatted. */
export type CellValue = string | number | boolean;

/** Thin Sheets v4 REST client for one spreadsheet. */
export class SheetsClient {
  /**
   * @param token - OAuth bearer token.
   * @param spreadsheetId - The Sheet's ID.
   * @param fetcher - `fetch`.
   */
  constructor(
    private readonly token: string,
    private readonly spreadsheetId: string,
    private readonly fetcher: Fetcher
  ) {}

  private async call<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetcher(
      `${SHEETS_API}/${this.spreadsheetId}${path}`,
      {
        ...init,
        headers: {
          authorization: `Bearer ${this.token}`,
          "content-type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(
        `Sheets API ${path.split("?")[0] ?? ""}: ${response.status}`
      );
    }
    return response.json<T>();
  }

  /**
   * Reads a range with unformatted values (checkboxes come back as booleans).
   *
   * @param range - A1 range, e.g. `Links!A2:F`.
   * @returns Rows of cells; trailing empty cells/rows are omitted by Google.
   */
  async getValues(range: string): Promise<CellValue[][]> {
    const body = await this.call<{ values?: CellValue[][] }>(
      `/values/${encodeURIComponent(range)}?valueRenderOption=UNFORMATTED_VALUE`
    );
    return body.values ?? [];
  }

  /**
   * Writes several ranges in one request.
   *
   * @param data - Ranges and their values.
   * @returns Resolves when written.
   */
  async batchUpdate(
    data: readonly { range: string; values: CellValue[][] }[]
  ): Promise<void> {
    if (data.length === 0) {
      return;
    }
    await this.call("/values:batchUpdate", {
      method: "POST",
      body: JSON.stringify({ valueInputOption: "RAW", data }),
    });
  }

  /**
   * Appends rows below the last row of a range's table.
   *
   * @param range - Target, e.g. `Clicks by day!A:E`.
   * @param rows - Rows to append.
   * @returns Resolves when appended.
   */
  async append(range: string, rows: CellValue[][]): Promise<void> {
    if (rows.length === 0) {
      return;
    }
    await this.call(
      `/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      { method: "POST", body: JSON.stringify({ values: rows }) }
    );
  }
}

/**
 * A Sheets client for the configured Sheet, or null when `LINKS_SHEET_ID` or
 * the service-account secret is missing (sync then reports "not configured").
 *
 * @param sheetId - `LINKS_SHEET_ID`.
 * @param accountJson - `GOOGLE_SERVICE_ACCOUNT_JSON`.
 * @param now - Clock, ms.
 * @param fetcher - `fetch`.
 * @returns Client or null.
 */
export async function openSheet(
  sheetId: string | undefined,
  accountJson: string | undefined,
  now: number,
  fetcher: Fetcher
): Promise<SheetsClient | null> {
  const account = parseServiceAccount(accountJson);
  if (!sheetId || !account) {
    return null;
  }
  const token = await getAccessToken(account, now, fetcher);
  return new SheetsClient(token, sheetId, fetcher);
}
