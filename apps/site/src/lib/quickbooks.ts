/**
 * QuickBooks Online integration (direct Intuit API — Path B).
 *
 * Flow:
 *  1. GET /api/quickbooks/connect  -> redirect user to Intuit consent screen
 *  2. Intuit redirects to /api/quickbooks/callback?code=...&realmId=...
 *  3. We exchange the code for access + refresh tokens, persist them
 *  4. createInvoice() uses a (refreshed) access token to POST an invoice
 *
 * Env vars required:
 *  - QUICKBOOKS_CLIENT_ID
 *  - QUICKBOOKS_CLIENT_SECRET
 *  - QUICKBOOKS_REDIRECT_URI   (e.g. https://factory.studex-group.com/api/quickbooks/callback)
 *  - QUICKBOOKS_ENV            ("sandbox" | "production", default "sandbox")
 */

import { getToken, setToken, type QuickBooksToken } from "./token-store";

const QB_ENV = process.env.QUICKBOOKS_ENV === "production" ? "production" : "sandbox";

const DISCOVERY = {
  authUrl: "https://appcenter.intuit.com/connect/oauth2",
  tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
  apiBase:
    QB_ENV === "production"
      ? "https://quickbooks.api.intuit.com"
      : "https://sandbox-quickbooks.api.intuit.com",
};

const SCOPES = "com.intuit.quickbooks.accounting";

function clientId(): string {
  const id = process.env.QUICKBOOKS_CLIENT_ID;
  if (!id) throw new Error("QUICKBOOKS_CLIENT_ID is not set");
  return id;
}

function clientSecret(): string {
  const secret = process.env.QUICKBOOKS_CLIENT_SECRET;
  if (!secret) throw new Error("QUICKBOOKS_CLIENT_SECRET is not set");
  return secret;
}

function redirectUri(): string {
  return (
    process.env.QUICKBOOKS_REDIRECT_URI ||
    "https://factory.studex-group.com/api/quickbooks/callback"
  );
}

/** Build the Intuit consent URL. `state` guards against CSRF. */
export function getAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    response_type: "code",
    scope: SCOPES,
    redirect_uri: redirectUri(),
    state,
  });
  return `${DISCOVERY.authUrl}?${params.toString()}`;
}

function basicAuthHeader(): string {
  return "Basic " + Buffer.from(`${clientId()}:${clientSecret()}`).toString("base64");
}

/** Exchange an authorization code for tokens and persist them. */
export async function exchangeCode(code: string, realmId: string): Promise<QuickBooksToken> {
  const res = await fetch(DISCOVERY.tokenUrl, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
    }),
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  const token: QuickBooksToken = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    realmId,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  await setToken(token);
  return token;
}

/** Refresh the access token using the stored refresh token (rotates the refresh token). */
async function refreshAccessToken(token: QuickBooksToken): Promise<QuickBooksToken> {
  const res = await fetch(DISCOVERY.tokenUrl, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  const refreshed: QuickBooksToken = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    realmId: token.realmId,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  await setToken(refreshed);
  return refreshed;
}

/** Return a valid access token, refreshing if it expires within 60s. */
async function validToken(): Promise<QuickBooksToken> {
  const token = await getToken();
  if (!token) throw new Error("QuickBooks is not connected. Visit /api/quickbooks/connect first.");
  if (Date.now() >= token.expiresAt - 60_000) {
    return refreshAccessToken(token);
  }
  return token;
}

export async function isConnected(): Promise<boolean> {
  return (await getToken()) !== null;
}

/** Find an existing QuickBooks customer by email, or create one. Returns the customer Id. */
async function findOrCreateCustomer(
  token: QuickBooksToken,
  name: string,
  email: string
): Promise<string> {
  const query = `select * from Customer where PrimaryEmailAddr = '${email.replace(/'/g, "\\'")}'`;
  const queryUrl = `${DISCOVERY.apiBase}/v3/company/${token.realmId}/query?query=${encodeURIComponent(
    query
  )}&minorversion=73`;

  const found = await fetch(queryUrl, {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      Accept: "application/json",
    },
  });

  if (found.ok) {
    const body = (await found.json()) as {
      QueryResponse?: { Customer?: Array<{ Id: string }> };
    };
    const existing = body.QueryResponse?.Customer?.[0];
    if (existing) return existing.Id;
  }

  const createUrl = `${DISCOVERY.apiBase}/v3/company/${token.realmId}/customer?minorversion=73`;
  const created = await fetch(createUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      DisplayName: name || email,
      PrimaryEmailAddr: { Address: email },
    }),
  });

  if (!created.ok) {
    throw new Error(`Create customer failed (${created.status}): ${await created.text()}`);
  }
  const body = (await created.json()) as { Customer: { Id: string } };
  return body.Customer.Id;
}

export type StageInvoiceInput = {
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  stage: "deposit" | "build" | "final";
  amountUsd: number;
};

const STAGE_LABEL: Record<StageInvoiceInput["stage"], string> = {
  deposit: "Deposit (10%)",
  build: "Build milestone (40%)",
  final: "Final delivery (50%)",
};

/**
 * Create a QuickBooks invoice for one payment stage of a project.
 * Returns the created invoice Id and doc number.
 */
export async function createStageInvoice(
  input: StageInvoiceInput
): Promise<{ invoiceId: string; docNumber: string }> {
  const token = await validToken();
  const customerId = await findOrCreateCustomer(token, input.clientName, input.clientEmail);

  const url = `${DISCOVERY.apiBase}/v3/company/${token.realmId}/invoice?minorversion=73`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      CustomerRef: { value: customerId },
      BillEmail: { Address: input.clientEmail },
      Line: [
        {
          Amount: input.amountUsd,
          DetailType: "SalesItemLineDetail",
          Description: `${input.projectTitle} — ${STAGE_LABEL[input.stage]}`,
          SalesItemLineDetail: {
            ItemRef: { value: "1", name: "Services" },
            Qty: 1,
            UnitPrice: input.amountUsd,
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Create invoice failed (${res.status}): ${await res.text()}`);
  }
  const body = (await res.json()) as { Invoice: { Id: string; DocNumber: string } };
  return { invoiceId: body.Invoice.Id, docNumber: body.Invoice.DocNumber };
}

/** The 10 / 40 / 50 split for a quoted price. */
export function stageAmounts(quotedPriceUsd: number): Record<StageInvoiceInput["stage"], number> {
  return {
    deposit: Math.round(quotedPriceUsd * 0.1 * 100) / 100,
    build: Math.round(quotedPriceUsd * 0.4 * 100) / 100,
    final: Math.round(quotedPriceUsd * 0.5 * 100) / 100,
  };
}
