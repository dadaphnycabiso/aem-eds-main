import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

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
