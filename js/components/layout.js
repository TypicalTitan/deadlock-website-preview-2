// The frame around every page: the phase banner, grouped navigation and the account corner. Wireframe only:
// every required element is here, unstyled and with placeholder text, for the real design to replace.
import { html } from 'htm/preact';
import { useEffect, useRef } from 'preact/hooks';
import { discordProfile, signOut } from '../lib/supabase.js';
import { Navigation } from './navigation.js';

// "/teams/abc" still counts as being in Teams.
const inSection = (href, path) => (href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`));
const current = (href, path) => (inSection(href, path) ? 'page' : undefined);

let arrived = false; // false until the first page has rendered

// Every page calls this. It sets the tab title, and when the player comes from another page it starts at the top
// with focus on the page's heading (or on `selector`, such as one rules section), so keyboard and screen reader
// users land on the new page instead of the link they followed.
export function usePage(title, selector = 'h1') {
  useEffect(() => {
    document.title = title ? `${title} · Deadlock Tournament` : 'Deadlock Tournament';
  }, [title]);

  useEffect(() => {
    const firstLoad = !arrived;
    arrived = true;
    if (firstLoad && selector === 'h1') return; // a fresh page load keeps the browser's own focus
    const target = document.querySelector(`main ${selector}`);
    if (!target) return;
    if (selector === 'h1') window.scrollTo(0, 0);
    else target.scrollIntoView({ block: 'start' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }, [selector]);
}

function Account({ auth }) {
  if (!auth.session) return html`<a href="#/login">Sign in</a>`;
  return html`
    <span>[Avatar] ${discordProfile(auth.session).name}</span>
    <button type="button" onClick=${signOut}>Sign out</button>
  `;
}

export function Layout({ path, auth, children }) {
  const main = useRef(null);
  const shell = useRef(null);
  const chrome = useRef(null);
  const landing = path === '/';

  useEffect(() => {
    if (!landing) return;
    const element = shell.current;
    const header = chrome.current;
    // Reserve room for wrapped navigation while its background stays over the image.
    const measure = () => element.style.setProperty('--site-chrome-height', `${header.getBoundingClientRect().height}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    measure();
    return () => {
      observer.disconnect();
      element.style.removeProperty('--site-chrome-height');
    };
  }, [landing]);

  const skipToMain = event => {
    event.preventDefault(); // "#main" would otherwise be read as a route
    main.current?.focus();
  };

  const wireframeNote = html`
    <p class="wireframe-note">
      Wireframe: text in [brackets] is a placeholder. P1 before signups open · P2 before scrim week · P3 before Round 1 · P4 nice to have.
    </p>
  `;

  return html`
    <div class="site-shell" ref=${shell}>
    <a class="skip-link" href="#main" onClick=${skipToMain}>Skip to content</a>
    <div class=${`site-chrome${landing ? ' site-chrome--overlay' : ''}`} ref=${chrome}>
    <p class="phase-banner">[Phase] · [Time until the next deadline]</p>
    <header class="site-header">
      <a class="site-name" href="#/" aria-label="Home" aria-current=${current('/', path)}>[Tournament name]</a>
      <${Navigation} path=${path} />
      <div class="account"><${Account} auth=${auth} /></div>
    </header>
    ${!landing && wireframeNote}
    ${auth.error && html`<p class="notice" role="alert">[Sign-in error message] (${auth.error})</p>`}
    </div>
    <main id="main" ref=${main} tabindex="-1">${children}</main>
    ${landing && wireframeNote}
    <footer>[Footer: friends-only, run by fans, not affiliated with or endorsed by Valve]</footer>
    </div>
  `;
}
