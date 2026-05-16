// Google OAuth — iOS client ID from Google Cloud Console
export const GOOGLE_IOS_CLIENT_ID =
  '212254724075-anl962rlu88nugph3bnkclpv1i0iss6t.apps.googleusercontent.com';

// Reverse client ID — used as the iOS URL scheme for OAuth redirect
// Format: com.googleusercontent.apps.{client-id-prefix}
export const GOOGLE_REVERSE_CLIENT_ID =
  'com.googleusercontent.apps.212254724075-anl962rlu88nugph3bnkclpv1i0iss6t';

// Gmail API scopes — read-only, no write access
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// How many days back to scan emails on first sync
export const INITIAL_SYNC_DAYS = 90;

// App scheme (matches app.json scheme)
export const APP_SCHEME = 'vestory';
