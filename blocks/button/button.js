import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Button block — the styled button component extracted from the Figma design
 * system. Unlike the OOTB default-content button (which can only deliver
 * primary/secondary via strong/em wrappers), a block can carry the full
 * variation set to published markup:
 *   - Style:  button-primary | button-secondary | button-outline |
 *             button-ghost | button-ghost-inverted | button-destructive
 *   - Size:   (regular) | button-small | button-mini | button-round
 *   - Shape:  (rounded) | button-square
 *
 * The three variation axes are authored via `classes_*` select fields, so AEM
 * delivers them as modifier classes on the block element
 * (e.g. `class="button button-outline button-small"`). This decorate() reads
 * the authored link + label + title and renders a single `a.button`, mirroring
 * those modifier classes onto the anchor so the CSS in button.css can target it.
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];

  // Field order in the model: link, linkText, linkTitle.
  const [linkCell, textCell, titleCell] = cells;

  // Resolve the href: an aem-content link is delivered as an <a>; fall back to
  // the cell's plain text (some delivery shapes emit the raw path).
  const linkAnchor = linkCell ? linkCell.querySelector('a') : null;
  const href = (linkAnchor && linkAnchor.getAttribute('href'))
    || (linkCell ? linkCell.textContent.trim() : '');

  // Label: the explicit linkText, else the link anchor's own text, else href.
  const label = (textCell && textCell.textContent.trim())
    || (linkAnchor && linkAnchor.textContent.trim())
    || href;

  const title = titleCell ? titleCell.textContent.trim() : '';

  // Build the anchor. If there is no link yet (freshly added in UE), still
  // render a non-navigating button so the author sees the styled element.
  const a = document.createElement('a');
  a.className = 'button';
  if (href) a.href = href;
  a.textContent = label || 'Button';
  if (title) a.title = title;

  // Mirror the block's variation modifier classes onto the anchor.
  [...block.classList]
    .filter((c) => c.startsWith('button-'))
    .forEach((c) => a.classList.add(c));

  moveInstrumentation(block, a);

  block.textContent = '';
  block.append(a);
}
