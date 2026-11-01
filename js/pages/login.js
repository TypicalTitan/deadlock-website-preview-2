// Login (#/login): sign in with Discord, then the friends-only gate on a player's first sign-in.
import { html } from 'htm/preact';
import { Block } from '../components/block.js';
import { usePage } from '../components/layout.js';
import { configured, discordProfile, signIn, signOut } from '../lib/supabase.js';

export function Login({ auth }) {
  usePage('Sign in');

  if (auth.session) {
    return html`
      <h1>[Page title: sign in]</h1>
      <${Block} priority="P1" name="Signed in">
        <p>[Avatar] ${discordProfile(auth.session).name}</p>
        <p><a href="#/me">Go to your dashboard</a> <button type="button" onClick=${signOut}>Sign out</button></p>
      <//>
    `;
  }

  return html`
    <h1>[Page title: sign in]</h1>
    <${Block} priority="P1" name="Intro"><p>[One line: friends only, sign in with Discord]</p><//>
    <${Block} priority="P1" name="Sign in with Discord">
      <p><button type="button" onClick=${signIn} disabled=${!configured}>Sign in with Discord</button></p>
      ${!configured && html`<p>(Works once <code>site/js/config.js</code> has the Supabase URL and publishable key.)</p>`}
    <//>
    <${Block} priority="P1" name="Sign-in error"><p>[Message when sign-in fails or is cancelled]</p><//>
    <${Block} priority="P1" name="Friends-only gate, first sign-in only">
      <form onSubmit=${event => event.preventDefault()}>
        <p>
          <label for="invite-code">Invite code</label><br />
          <input id="invite-code" name="invite-code" autocomplete="off" disabled />
        </p>
        <p><button type="submit" disabled>Continue</button></p>
      </form>
      <p>[Where to get the code] · or [You’re not on the list], if the gate is an allowlist or server membership</p>
      <p>(Which one is the open decision “Invite Code or Allowlist” in the vault.)</p>
    <//>
    <${Block} priority="P1" name="After sign-in">
      <p>(A first sign-in goes straight to profile setup; everyone else goes to their dashboard.)</p>
    <//>
  `;
}
