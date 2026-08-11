import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Fixes broken footer images by falling back to repo-hosted SVGs.
 * AEM-authored content may reference DAM paths that don't resolve on EDS.
 */
function fixBrokenImages(container) {
  const fallbacks = {
    'doc-logo': '/icons/doc-logo.svg',
    'department of conservation': '/icons/doc-logo.svg',
    'te papa atawhai': '/icons/doc-logo.svg',
    'nz-govt': '/icons/nz-govt-logo.svg',
    'new zealand government': '/icons/nz-govt-logo.svg',
    'kāwanatanga': '/icons/nz-govt-logo.svg',
    'kawanatanga': '/icons/nz-govt-logo.svg',
  };

  container.querySelectorAll('img').forEach((img) => {
    const alt = (img.alt || '').toLowerCase();
    const src = (img.src || '').toLowerCase();
    const broken = !img.naturalWidth || src.includes('about:error') || src.includes('about:blank');

    if (!broken) return;

    const match = Object.keys(fallbacks).find((k) => alt.includes(k) || src.includes(k));
    if (match) img.src = fallbacks[match];
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  fixBrokenImages(footer);

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
