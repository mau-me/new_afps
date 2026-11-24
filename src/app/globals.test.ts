import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  fileURLToPath(new URL('./globals.css', import.meta.url)),
  'utf8'
);

describe('globals.css', () => {
  // No Tailwind v4, --spacing-md (etc.) tem prioridade sobre --container-md,
  // e max-w-md passa a valer 1rem: formulários e textos ficam espremidos.
  it('não define tokens de espaçamento com nomes de tamanho', () => {
    const collisions = css.match(
      /--spacing-(3xs|2xs|xs|sm|md|lg|xl|\dxl)\s*:/g
    );
    expect(collisions).toBeNull();
  });
});
