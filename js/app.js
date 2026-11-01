// Entry point: matches the hash route to a page and wraps it in the layout.
import { html, render } from 'htm/preact';
import { Layout } from './components/layout.js';
import { match, useRoute } from './lib/router.js';
import { useAuth } from './lib/supabase.js';
import { Faq } from './pages/faq.js';
import { Home } from './pages/home.js';
import { Login } from './pages/login.js';
import { NotFound } from './pages/not-found.js';
import { Rules } from './pages/rules.js';
import { pages, Wireframe } from './pages/wireframe.js';

const routes = [
  ['/', Home],
  ['/login', Login],
  ['/rules', Rules],
  ['/rules/:section', Rules],
  ['/faq', Faq],
  ...Object.keys(pages).map(pattern => [pattern, Wireframe]),
];

function App() {
  const path = useRoute();
  const auth = useAuth();

  let page = { Page: NotFound, params: {}, pattern: 'not-found' };
  for (const [pattern, Page] of routes) {
    const params = match(pattern, path);
    if (params) {
      page = { Page, params, pattern };
      break;
    }
  }
  const { Page, params, pattern } = page;

  // Keyed by pattern, so moving to another page mounts it fresh (and usePage moves focus to it).
  return html`
    <${Layout} path=${path} auth=${auth}>
      <${Page} key=${pattern} params=${params} pattern=${pattern} auth=${auth} />
    <//>
  `;
}

const root = document.getElementById('app');
root.replaceChildren(); // drop the "loading" line: Preact leaves alone markup it didn't render
render(html`<${App} />`, root);
