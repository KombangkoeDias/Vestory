import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  saveTokens,
  clearTokens,
  getUserInfo,
  saveUserInfo,
  isSignedIn,
  fetchUserProfile,
} from '../utils/gmailClient';
import { GOOGLE_IOS_CLIENT_ID, GMAIL_SCOPES } from '../constants/Config';

WebBrowser.maybeCompleteAuthSession();

const DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

interface AuthContextValue {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  userEmail: string | null;
  userName: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'com.googleusercontent.apps.212254724075-anl962rlu88nugph3bnkclpv1i0iss6t',
    path: 'oauth2redirect',
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_IOS_CLIENT_ID,
      scopes: GMAIL_SCOPES,
      redirectUri,
      usePKCE: true,
      responseType: AuthSession.ResponseType.Code,
    },
    DISCOVERY,
  );

  // Check stored auth on mount
  useEffect(() => {
    (async () => {
      const signedIn = await isSignedIn();
      if (signedIn) {
        const info = await getUserInfo();
        setUserEmail(info?.email ?? null);
        setUserName(info?.name ?? null);
        setIsAuthenticated(true);
      }
      setIsAuthLoading(false);
    })();
  }, []);

  // Handle OAuth response
  useEffect(() => {
    if (response?.type !== 'success') return;

    (async () => {
      const { code } = response.params;
      if (!code || !request?.codeVerifier) return;

      try {
        // Exchange code for tokens
        const tokenRes = await fetch(DISCOVERY.tokenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_IOS_CLIENT_ID,
            code,
            code_verifier: request.codeVerifier,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }).toString(),
        });

        const tokens = await tokenRes.json();

        if (tokens.access_token) {
          await saveTokens({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in ?? 3600,
          });

          // Fetch and save user profile
          const profile = await fetchUserProfile(tokens.access_token);
          if (profile) {
            await saveUserInfo(profile.email, profile.name);
            setUserEmail(profile.email);
            setUserName(profile.name);
          }

          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Token exchange failed:', err);
      }
    })();
  }, [response]);

  const signIn = useCallback(async () => {
    await promptAsync();
  }, [promptAsync]);

  const signOut = useCallback(async () => {
    await clearTokens();
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserName(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAuthLoading, userEmail, userName, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
