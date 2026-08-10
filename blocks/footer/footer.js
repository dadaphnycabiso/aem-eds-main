import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Returns the DOC footer HTML structure matching the Figma design.
 * Used as fallback when AEM footer content is unavailable or outdated.
 * Row 1: DOC brand logo. Row 2: primary link list. Row 3: NZ Government
 * logo, copyright and legal links.
 */
function getDOCFooterHTML() {
  return `
    <div>
      <div class="default-content-wrapper">
        <p><a href="/" aria-label="Department of Conservation home"><picture><img src="/content/images/footer/doc-logo-full.png" alt="Department of Conservation Te Papa Atawhai"></picture></a></p>
      </div>
    </div>
    <div>
      <div class="default-content-wrapper">
        <ul>
          <li><a href="/about">About us</a></li>
          <li><a href="/contact">Contact us</a></li>
          <li><a href="/news">News &amp; events</a></li>
          <li><a href="/publications">Publications</a></li>
          <li><a href="/careers">Careers</a></li>
          <li><a href="/accessibility">Accessibility</a></li>
        </ul>
      </div>
    </div>
    <div>
      <div class="default-content-wrapper">
        <p><picture><img src="/content/images/footer/nz-govt-logo.png" alt="Te Kāwanatanga o Aotearoa New Zealand Government"></picture></p>
        <p>© 2025 Department of Conservation. All rights reserved.</p>
        <p><a href="/terms">Terms</a> <a href="/privacy">Privacy</a> <a href="/cookies">Cookies</a></p>
      </div>
    </div>`;
}

/**
 * Checks whether the loaded footer fragment has the expected DOC structure
 * (three content rows, the first carrying the DOC brand logo).
 */
function isDOCFooter(fragment) {
  const img = fragment.querySelector('img');
  return img && img.src && (img.src.includes('doc-logo') || img.src.includes('doc-logo-full'));
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  let fragment = await loadFragment(footerPath);

  // Use DOC footer fallback if AEM content doesn't have the expected structure
  if (!fragment || !isDOCFooter(fragment)) {
    const temp = document.createElement('main');
    temp.innerHTML = getDOCFooterHTML();
    fragment = temp;
  }

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // label the three content rows: brand, links, legal
  const rows = ['brand', 'links', 'legal'];
  rows.forEach((name, i) => {
    const row = footer.children[i];
    if (row) row.classList.add(`footer-${name}`);
  });

  // insert a divider between the primary links and the legal row
  const legal = footer.querySelector('.footer-legal');
  if (legal) {
    const divider = document.createElement('hr');
    divider.className = 'footer-divider';
    legal.before(divider);
  }

  block.append(footer);
}
