// Navigation disclosures use ordinary buttons and links, including on touch and keyboards.
import { html } from 'htm/preact';
import { useEffect, useRef, useState } from 'preact/hooks';

export const navigationGroups = [
  { id: 'event', label: 'Event', links: [
    { href: '/rules', label: 'Rules' },
    { href: '/faq', label: 'FAQ' },
    { href: '/scrims', label: 'Scrims' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/bracket', label: 'Bracket' },
    { href: '/champions', label: 'Champions' },
  ] },
  { id: 'players', label: 'Players', links: [
    { href: '/teams', label: 'Teams' },
    { href: '/players', label: 'Players' },
  ] },
  { id: 'mine', label: 'My tournament', links: [
    { href: '/me', label: 'Dashboard', who: 'signed in' },
    { href: '/profile', label: 'Profile', who: 'signed in' },
  ] },
  { id: 'tools', label: 'Tools', links: [
    { href: '/ref', label: 'Ref', who: 'refs' },
    { href: '/admin', label: 'Admin', who: 'admin' },
  ] },
];

const inSection = (href, path) => path === href || path.startsWith(`${href}/`);

export function Navigation({ path }) {
  const [compact, setCompact] = useState(() => matchMedia('(max-width: 700px)').matches);
  const [expanded, setExpanded] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const navigation = useRef(null);
  const menuButton = useRef(null);
  const groupButtons = useRef({});
  const drawer = useRef(null);
  const surface = useRef(null);
  const closeButton = useRef(null);
  const openingFrame = useRef(null);
  const closingTimer = useRef(null);
  const ownsScrollLock = useRef(false);

  const cancelPending = () => {
    if (openingFrame.current !== null) cancelAnimationFrame(openingFrame.current);
    if (closingTimer.current !== null) clearTimeout(closingTimer.current);
    openingFrame.current = null;
    closingTimer.current = null;
  };

  const close = (restoreFocus = false) => {
    cancelPending();
    if (drawer.current?.open) drawer.current.close();
    if (ownsScrollLock.current) document.documentElement.classList.remove('navigation-open');
    ownsScrollLock.current = false;
    setOpenGroup(null);
    setExpanded(false);
    if (restoreFocus && menuButton.current?.getClientRects().length) menuButton.current.focus({ preventScroll: true });
  };

  const openDrawer = () => {
    if (!drawer.current || drawer.current.open) return;
    cancelPending();
    setOpenGroup(null);
    setExpanded(false);
    ownsScrollLock.current = !document.documentElement.classList.contains('navigation-open');
    document.documentElement.classList.add('navigation-open');
    drawer.current.showModal();
    closeButton.current?.focus({ preventScroll: true });
    // Commit the offscreen starting position before changing the animated state.
    getComputedStyle(surface.current).transform;
    openingFrame.current = requestAnimationFrame(() => {
      openingFrame.current = null;
      if (drawer.current?.open) setExpanded(true);
    });
  };

  const dismissDrawer = () => {
    cancelPending();
    setExpanded(false);
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 380;
    closingTimer.current = setTimeout(() => close(true), duration);
  };

  useEffect(() => { close(); }, [path]);

  useEffect(() => {
    const media = matchMedia('(max-width: 700px)');
    const resize = () => {
      close();
      setCompact(media.matches);
    };
    media.addEventListener('change', resize);
    return () => {
      media.removeEventListener('change', resize);
      close();
    };
  }, []);

  useEffect(() => {
    const outside = event => {
      if (!drawer.current?.open && !navigation.current?.contains(event.target)) close();
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  const escape = event => {
    if (event.key === 'Tab' && drawer.current?.open) {
      const controls = [...drawer.current.querySelectorAll('button:not([disabled]), a[href]')]
        .filter(element => element.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
      return;
    }
    if (event.key !== 'Escape') return;
    if (drawer.current?.open) {
      dismissDrawer();
    } else if (openGroup !== null) {
      groupButtons.current[openGroup]?.focus();
      setOpenGroup(null);
    } else return;
    event.preventDefault();
    event.stopPropagation();
  };

  const follow = href => {
    // Close a modal synchronously before the hash changes, so route-heading focus is not stolen.
    const modal = drawer.current?.open;
    close(modal && href === path);
    if (href === path) {
      if (!modal) groupButtons.current[openGroup]?.focus();
    }
  };

  const groups = html`
    <ul class="nav-groups">
      ${navigationGroups.map(group => {
        const active = group.links.some(link => inSection(link.href, path));
        return html`
          <li class="nav-group" key=${group.id} data-active=${active}>
            <button class="nav-group-toggle" id=${`nav-trigger-${group.id}`} type="button"
              ref=${element => { groupButtons.current[group.id] = element; }}
              data-active=${active} aria-expanded=${openGroup === group.id}
              aria-controls=${`nav-panel-${group.id}`}
              onClick=${() => setOpenGroup(openGroup === group.id ? null : group.id)}>
              ${group.label}
              <svg class="nav-chevron" width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
                <path d="M1 1l5 5 5-5" />
              </svg>
            </button>
            <ul class="nav-dropdown" id=${`nav-panel-${group.id}`} hidden=${openGroup !== group.id}
              aria-labelledby=${`nav-trigger-${group.id}`}>
              ${group.links.map(link => html`
                <li key=${link.href}>
                  <a href=${`#${link.href}`} aria-current=${inSection(link.href, path) ? 'page' : undefined}
                    onClick=${() => follow(link.href)}>
                    ${link.label}${link.who && html` <span class="audience">(${link.who})</span>`}
                  </a>
                </li>
              `)}
            </ul>
          </li>
        `;
      })}
    </ul>
  `;

  return html`
    <nav class="site-navigation" aria-label="Main" ref=${navigation} onKeyDown=${escape}
      onFocusOut=${event => {
        if (!drawer.current?.open && event.relatedTarget && !navigation.current?.contains(event.relatedTarget)) close();
      }}>
      <button class="nav-menu-toggle" type="button" ref=${menuButton}
        aria-label="Open navigation" aria-expanded=${expanded} aria-controls="primary-navigation"
        onClick=${openDrawer}>
        <svg class="nav-menu-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 5h18M3 12h18M3 19h18" />
        </svg>
        <span>Menu</span>
      </button>
      ${!compact && html`<div id="primary-navigation" class="nav-panel">${groups}</div>`}
      ${compact && html`
        <dialog class="nav-drawer" ref=${drawer} data-expanded=${expanded} aria-labelledby="nav-drawer-title"
          onCancel=${event => { event.preventDefault(); dismissDrawer(); }}
          onClose=${() => { if (!drawer.current?.open) close(); }}>
          <div class="nav-drawer__surface" ref=${surface}>
            <header class="nav-drawer__header">
              <button class="nav-drawer__close" ref=${closeButton} type="button" aria-label="Close navigation" onClick=${dismissDrawer}>
                <svg class="nav-menu-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
              </button>
              <h2 id="nav-drawer-title">Menu</h2>
            </header>
            <div id="primary-navigation" class="nav-panel">
              <a class="nav-drawer__home" href="#/" onClick=${() => follow('/')}>Home</a>
              ${groups}
              <a class="nav-drawer__account" href="#/login" onClick=${() => follow('/login')}>Sign in</a>
            </div>
          </div>
        </dialog>
      `}
    </nav>
  `;
}
