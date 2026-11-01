// One required element in the wireframe: its priority and name, then placeholder content for what goes there.
import { html } from 'htm/preact';

export function Block({ priority, name, children }) {
  return html`
    <div class="block">
      <p class="block-name">${priority} · ${name}</p>
      <div class="block-body">${children}</div>
    </div>
  `;
}

// A run of blocks from [priority, element name, placeholder] rows.
export function Blocks({ rows }) {
  return rows.map(([priority, name, placeholder]) => html`
    <${Block} key=${name} priority=${priority} name=${name}><p>${placeholder}</p><//>
  `);
}
