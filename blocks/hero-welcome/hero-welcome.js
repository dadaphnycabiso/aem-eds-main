import { decorateIcons } from '../../scripts/aem.js';

/**
 * DOC "Haere mai" hero banner.
 * Structure (from block content):
 *   row 1: background image
 *   row 2: subheading + heading + category pill links
 *   row 3 (optional): a single link whose text is the search placeholder,
 *                     rendered as a search bar
 */
export default function decorate(block) {
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }

  const rows = [...block.children];

  // wrap the textual content (everything after the image row) so it can be
  // centered as an overlay on top of the background image
  const contentRow = rows[1];
  if (contentRow) {
    contentRow.classList.add('hero-welcome-content');

    // category pills: the block of links following the heading
    const pillLinks = contentRow.querySelectorAll('a');
    if (pillLinks.length) {
      const pills = document.createElement('div');
      pills.className = 'hero-welcome-pills';
      pillLinks.forEach((a) => {
        // strip default button classes so pills style cleanly
        a.classList.remove('button', 'primary', 'secondary');
        const container = a.closest('.button-container');
        pills.append(a);
        if (container && !container.childNodes.length) container.remove();
      });
      contentRow.append(pills);
    }
  }

  // optional search bar: last row containing a lone paragraph of text
  const searchRow = rows[2];
  if (searchRow) {
    const text = searchRow.textContent.trim();
    searchRow.className = 'hero-welcome-search';
    searchRow.innerHTML = `
      <span class="hero-welcome-search-icon"><span class="icon icon-search"></span></span>
      <input type="search" aria-label="${text || 'Search'}" placeholder="${text || 'Search'}">
      <button type="button" class="hero-welcome-search-submit" aria-label="Submit search">
        <span class="icon icon-search"></span>
      </button>`;
    decorateIcons(searchRow);
  }
}
