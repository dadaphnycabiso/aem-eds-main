import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;

/**
 * DOC "Haere mai" hero banner.
 *
 * Authored in AEM as a model-based block, so each field is delivered as its own
 * row: background image, subheading, heading, category links (richtext) and a
 * search placeholder. AEM delivers the image reference as a plain text link
 * (`<a href="…png">`) rather than a <picture>, so we convert it here.
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Classify every delivered row.
  let picture = null;
  const textRows = [];
  rows.forEach((row) => {
    const existingPic = row.querySelector('picture');
    const imgLink = [...row.querySelectorAll('a')]
      .find((a) => IMAGE_EXT.test(a.getAttribute('href') || ''));
    if (existingPic) {
      picture = existingPic;
    } else if (imgLink) {
      picture = createOptimizedPicture(imgLink.getAttribute('href'), imgLink.textContent.trim(), true);
    } else {
      textRows.push(row);
    }
  });

  // The pills row is the one carrying (non-image) links; the rest are plain
  // text rows delivered in model order: subheading, heading, search.
  const pillsRow = textRows.find((row) => row.querySelector('a'));
  const plainRows = textRows.filter((row) => row !== pillsRow);
  const [subheadingRow, headingRow, searchRow] = plainRows;

  block.textContent = '';

  // Full-bleed background image.
  if (picture) {
    block.append(picture);
  } else {
    block.classList.add('no-image');
  }

  // Centered content column: subheading + heading + category pills.
  const content = document.createElement('div');
  content.className = 'hero-welcome-content';

  const subheadingText = subheadingRow ? subheadingRow.textContent.trim() : '';
  if (subheadingText) {
    const p = document.createElement('p');
    p.textContent = subheadingText;
    content.append(p);
  }

  const headingText = headingRow ? headingRow.textContent.trim() : '';
  if (headingText) {
    const h1 = document.createElement('h1');
    h1.textContent = headingText;
    content.append(h1);
  }

  if (pillsRow) {
    const pills = document.createElement('div');
    pills.className = 'hero-welcome-pills';
    pillsRow.querySelectorAll('a').forEach((a) => {
      // strip default EDS button classes so pills style cleanly
      a.classList.remove('button', 'primary', 'secondary');
      const container = a.closest('.button-container');
      pills.append(a);
      if (container && !container.childElementCount) container.remove();
    });
    content.append(pills);
  }

  block.append(content);

  // Prominent rounded search bar.
  const placeholder = (searchRow ? searchRow.textContent.trim() : '') || 'Search';
  const search = document.createElement('div');
  search.className = 'hero-welcome-search';
  search.innerHTML = `
      <span class="hero-welcome-search-icon"><span class="icon icon-search"></span></span>
      <input type="search" aria-label="${placeholder}" placeholder="${placeholder}">
      <button type="button" class="hero-welcome-search-submit" aria-label="Submit search">
        <span class="icon icon-search"></span>
      </button>`;
  decorateIcons(search);
  block.append(search);
}
