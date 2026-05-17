import * as SecureStore from 'expo-secure-store';

const SECURE_KEYS = {
  accessToken: 'vestory_access_token',
  refreshToken: 'vestory_refresh_token',
  tokenExpiry: 'vestory_token_expiry',
  userEmail: 'vestory_user_email',
  userName: 'vestory_user_name',
};

const GMAIL_BASE = 'https://gmail.googleapis.com/gmail/v1';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

export async function saveTokens(tokens: {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEYS.accessToken, tokens.accessToken);
  if (tokens.refreshToken) {
    await SecureStore.setItemAsync(SECURE_KEYS.refreshToken, tokens.refreshToken);
  }
  const expiry = Date.now() + tokens.expiresIn * 1000;
  await SecureStore.setItemAsync(SECURE_KEYS.tokenExpiry, String(expiry));
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SECURE_KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SECURE_KEYS.refreshToken);
}

export async function isTokenExpired(): Promise<boolean> {
  const expiry = await SecureStore.getItemAsync(SECURE_KEYS.tokenExpiry);
  if (!expiry) return true;
  // Refresh 60 seconds before actual expiry
  return Date.now() > parseInt(expiry) - 60_000;
}

export async function saveUserInfo(email: string, name: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEYS.userEmail, email);
  await SecureStore.setItemAsync(SECURE_KEYS.userName, name);
}

export async function getUserInfo(): Promise<{ email: string; name: string } | null> {
  const email = await SecureStore.getItemAsync(SECURE_KEYS.userEmail);
  const name = await SecureStore.getItemAsync(SECURE_KEYS.userName);
  if (!email) return null;
  return { email, name: name ?? email };
}

export async function clearTokens(): Promise<void> {
  await Promise.all(Object.values(SECURE_KEYS).map(k => SecureStore.deleteItemAsync(k)));
}

export async function isSignedIn(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

export async function refreshAccessToken(
  clientId: string,
  refreshToken: string,
): Promise<string | null> {
  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });
    const data = await res.json();
    if (data.access_token) {
      await saveTokens({
        accessToken: data.access_token,
        expiresIn: data.expires_in ?? 3600,
      });
      return data.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Get a valid token (auto-refresh if needed)
// ---------------------------------------------------------------------------

export async function getValidToken(clientId: string): Promise<string | null> {
  const expired = await isTokenExpired();
  if (!expired) return getAccessToken();

  const refresh = await getRefreshToken();
  if (!refresh) return null;

  return refreshAccessToken(clientId, refresh);
}

// ---------------------------------------------------------------------------
// Gmail API calls
// ---------------------------------------------------------------------------

async function gmailGet(path: string, token: string): Promise<any> {
  const res = await fetch(`${GMAIL_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Gmail API error: ${res.status}`);
  return res.json();
}

export interface GmailMessage {
  id: string;
  threadId: string;
}

// Fetch list of message IDs matching the query
export async function listMessages(
  token: string,
  query: string,
  maxResults: number = 200,
): Promise<GmailMessage[]> {
  const encoded = encodeURIComponent(query);
  const data = await gmailGet(
    `/users/me/messages?q=${encoded}&maxResults=${maxResults}`,
    token,
  );
  return data.messages ?? [];
}

export interface GmailMessageDetail {
  id: string;
  subject: string;
  from: string;
  body: string;
  date: string;
}

// Fetch full message detail and decode body
export async function getMessage(
  token: string,
  messageId: string,
): Promise<GmailMessageDetail | null> {
  try {
    const data = await gmailGet(
      `/users/me/messages/${messageId}?format=full`,
      token,
    );

    const headers: Record<string, string> = {};
    (data.payload?.headers ?? []).forEach((h: { name: string; value: string }) => {
      headers[h.name.toLowerCase()] = h.value;
    });

    const body = extractBody(data.payload);

    return {
      id: data.id,
      subject: headers['subject'] ?? '',
      from: headers['from'] ?? '',
      body,
      date: headers['date'] ?? '',
    };
  } catch {
    return null;
  }
}

// Recursively extract plain text body from Gmail payload
function extractBody(payload: any): string {
  if (!payload) return '';

  // Direct body
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  // Multipart — prefer text/plain, fallback to text/html
  if (payload.parts) {
    const plain = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (plain?.body?.data) return decodeBase64Url(plain.body.data);

    const html = payload.parts.find((p: any) => p.mimeType === 'text/html');
    if (html?.body?.data) return stripHtml(decodeBase64Url(html.body.data));

    // Nested multipart
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }

  return '';
}

function decodeBase64Url(data: string): string {
  // Gmail uses base64url encoding (- instead of +, _ instead of /)
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
  } catch {
    return atob(base64);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fetch user profile from Google
export async function fetchUserProfile(
  token: string,
): Promise<{ email: string; name: string } | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return { email: data.email ?? '', name: data.name ?? data.email ?? '' };
  } catch {
    return null;
  }
}
