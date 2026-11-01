// Home (#/): the tournament name, the current phase with a countdown to the next deadline, and sign-in.
import { html } from 'htm/preact';
import { useRef } from 'preact/hooks';
import { Block, Blocks } from '../components/block.js';
import { usePage } from '../components/layout.js';
import { LandingReveal } from '../components/landing-reveal.js';

const rows = [
  ['P1', 'Intro', '[One or two lines on what the event is]'],
  ['P1', 'Current phase', '[Phase: Setup, Signups open, Roster locked, Scrim week, Bracket or Finished]'],
  ['P1', 'Countdown to the next deadline', '[Days] [Hours] [Minutes] · [Date and time in PT], or [Date to be announced]'],
];

export function Home({ auth }) {
  usePage('');
  const details = useRef(null);
  const continueToTournament = () => {
    // An in-page hash would become a route. This button also bypasses the long reveal for keyboard users.
    details.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    details.current?.focus({ preventScroll: true });
  };
  return html`
    <${LandingReveal} onContinue=${continueToTournament} />
    <div class="landing-details" ref=${details} tabindex="-1">
      <${Blocks} rows=${rows} />
      <${Block} priority="P1" name="Sign-in button">
        <p>${auth.session ? html`<a href="#/me">Go to your dashboard</a>` : html`<a href="#/login">Sign in with Discord</a>`}</p>
      <//>
    </div>
  `;
}
