// Rules (#/rules, and #/rules/<section> to open one section). Wireframe: the sections and what each holds, as
// placeholders. The real rules are in the vault's Tournament notes.
import { html } from 'htm/preact';
import { Block } from '../components/block.js';
import { usePage } from '../components/layout.js';

const sections = [
  { id: 'teams', title: 'Teams and roles', parts: ['[List: team size, roles, captain, subs]', '[“To be decided” marker]'] },
  { id: 'signups', title: 'Signups and roster lock', parts: ['[List: signing up, join requests, roster lock]'] },
  { id: 'scrims', title: 'Scrim week and seeding', parts: ['[Paragraph]', '[Table: scrim schedule, 3 rounds of 2 games]', '[List: seeding]', '[“To be decided” markers, 2]'] },
  { id: 'bracket', title: 'The bracket', parts: ['[Paragraph: double elimination]', '[Table: rounds 1 to 4]', '[List: grand final, fallback formats]'] },
  { id: 'scheduling', title: 'Series and scheduling', parts: ['[List: best of 3, booking, one game a day, booking deadline, no-shows, Pacific time]'] },
  { id: 'draft', title: 'Sides and the draft', parts: ['[Paragraph: two coin flips, naming both sides]', '[Draft order: bans A · B B · A A · B]', '[Draft order: picks A · B B · A A · B B · A A · B]', '[List: turn rules]', '[“To be decided” markers, 2]'] },
  { id: 'lanes', title: 'Lane reveal', parts: ['[Numbered steps, 4]'] },
  { id: 'game-day', title: 'Game day', parts: ['[Numbered checklist, 7 steps]', '[List: pauses, remakes, short-handed, patches, exploits]', '[“To be decided” marker]'] },
  { id: 'refs', title: 'Refs and results', parts: ['[List: who refs, result confirmation]', '[“To be decided” marker]'] },
  { id: 'prize', title: 'The prize', parts: ['[Paragraph]'] },
];

const number = i => String(i + 1).padStart(2, '0');

export function Rules({ params }) {
  usePage('Rules', params.section ? `#rules-${params.section} h2` : 'h1');
  return html`
    <h1>[Page title: rules]</h1>
    <${Block} priority="P1" name="Intro"><p>[Intro text]</p><//>
    <${Block} priority="P1" name="Section list, each with its own link">
      <ol>
        ${sections.map((section, i) => html`
          <li key=${section.id}><a href=${`#/rules/${section.id}`}>§ ${number(i)} [Section: ${section.title}]</a></li>
        `)}
      </ol>
    <//>
    ${sections.map((section, i) => html`
      <section key=${section.id} id=${`rules-${section.id}`} aria-labelledby=${`rules-${section.id}-title`}>
        <h2 id=${`rules-${section.id}-title`}>§ ${number(i)} [Section: ${section.title}]</h2>
        ${section.parts.map(part => html`<p key=${part}>${part}</p>`)}
      </section>
    `)}
  `;
}
