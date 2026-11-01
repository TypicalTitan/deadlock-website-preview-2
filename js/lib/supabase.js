// Supabase: the client, Discord sign-in and the current session. Nothing loads until config.js has the project URL
// and key, so before then the site simply runs signed out.
import { useEffect, useState } from 'preact/hooks';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../config.js';

export const configured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Read before the client starts, because finishing a sign-in can rewrite the address bar.
const returnParams = new URLSearchParams(location.search);
const RETURN_KEY = 'deadlock-tournament:return-to';
let client;

export function getClient() {
  if (!configured) return Promise.resolve(null);
  // PKCE brings the login back as ?code= instead of tokens after the #, which the hash routes need for themselves.
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { flowType: 'pkce' } }),
  );
  return client;
}

export async function signIn() {
  const supabase = await getClient();
  if (!supabase) return;
  try {
    sessionStorage.setItem(RETURN_KEY, location.hash); // a convenience: without it, the player lands on home
  } catch {}
  // Discord sends the player back to the site root, the address on Supabase's redirect allow list.
  await supabase.auth.signInWithOAuth({ provider: 'discord', options: { redirectTo: location.origin + location.pathname } });
}

export async function signOut() {
  const supabase = await getClient();
  await supabase?.auth.signOut();
}

// Back from Discord: clear ?code= (or ?error=) from the address bar and reopen the page the player started on.
// Returns Discord's error message when the sign-in failed.
function finishReturn() {
  if (!returnParams.has('code') && !returnParams.has('error')) return null;
  let hash = location.hash;
  try {
    hash ||= sessionStorage.getItem(RETURN_KEY) ?? '';
    sessionStorage.removeItem(RETURN_KEY);
  } catch {}
  history.replaceState(null, '', location.pathname + hash);
  dispatchEvent(new HashChangeEvent('hashchange'));
  return returnParams.get('error_description') ?? returnParams.get('error');
}

// { session, error }: the signed-in session (null when signed out) and any sign-in error.
export function useAuth() {
  const [auth, setAuth] = useState({ session: null, error: null });
  useEffect(() => {
    let subscription;
    getClient().then(async supabase => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession(); // this also finishes a ?code= sign-in
      setAuth({ session: data.session, error: finishReturn() });
      subscription = supabase.auth.onAuthStateChange((_event, session) => setAuth(a => ({ ...a, session }))).data.subscription;
    });
    return () => subscription?.unsubscribe();
  }, []);
  return auth;
}

// The name and avatar Discord shared at sign-in.
export function discordProfile(session) {
  const meta = session?.user?.user_metadata ?? {};
  return { name: meta.custom_claims?.global_name ?? meta.full_name ?? meta.name ?? 'Player', avatar: meta.avatar_url ?? null };
}
