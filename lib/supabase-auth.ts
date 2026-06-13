import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const authRedirectTo = Linking.createURL('auth', {
  queryParams: { mode: 'signin' },
});

function readAuthParam(url: string, key: string) {
  const parsedUrl = new URL(url);
  const hash = parsedUrl.hash.startsWith('#')
    ? parsedUrl.hash.slice(1)
    : parsedUrl.hash;
  const hashParams = new URLSearchParams(hash);

  return hashParams.get(key) ?? parsedUrl.searchParams.get(key);
}

export async function createSessionFromUrl(url: string) {
  const accessToken = readAuthParam(url, 'access_token');
  const refreshToken = readAuthParam(url, 'refresh_token');
  const errorDescription = readAuthParam(url, 'error_description');

  if (errorDescription) {
    throw new Error(errorDescription);
  }

  if (!accessToken || !refreshToken) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authRedirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error('Supabase did not return a Google sign-in URL.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirectTo, {
    showInRecents: true,
  });

  if (result.type !== 'success') {
    return null;
  }

  return createSessionFromUrl(result.url);
}

export async function signInWithEmailPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signUpWithEmailPassword({
  email,
  firstName,
  lastName,
  password,
}: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}) {
  const fullName = `${firstName} ${lastName}`.trim();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: authRedirectTo,
      data: {
        first_name: firstName,
        full_name: fullName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export { authRedirectTo };
