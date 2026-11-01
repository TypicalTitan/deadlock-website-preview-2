// FAQ (#/faq). Wireframe: the questions it has to answer, as placeholders.
import { html } from 'htm/preact';
import { Block } from '../components/block.js';
import { usePage } from '../components/layout.js';

const questions = [
  '[Question: game access, since Deadlock is invite-only]',
  '[Question: time zone, since everything is in PT]',
  '[Question: who the refs are]',
  '[Question]',
  '[Question]',
];

export function Faq() {
  usePage('FAQ');
  return html`
    <h1>[Page title: FAQ]</h1>
    <${Block} priority="P1" name="Intro"><p>[Intro text, with a link to the rules]</p><//>
    <${Block} priority="P1" name="Questions and answers">
      ${questions.map((question, i) => html`
        <details key=${i}>
          <summary>${question}</summary>
          <p>[Answer]</p>
        </details>
      `)}
    <//>
  `;
}
