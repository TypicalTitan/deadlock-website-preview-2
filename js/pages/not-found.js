// Any route that isn't in the site map.
import { html } from 'htm/preact';
import { Block } from '../components/block.js';
import { usePage } from '../components/layout.js';

export function NotFound() {
  usePage('Not found');
  return html`
    <h1>[Page title: not found]</h1>
    <${Block} priority="P1" name="Message">
      <p>[Short message]</p>
      <p><a href="#/">Back to home</a></p>
    <//>
  `;
}
