import { decorateIcons } from '../../scripts/aem.js';

const HEADING_TAGS = ['h2', 'h3', 'h4'];

function cellText(cell) {
  return cell?.textContent?.trim() || '';
}

function looksLikeHref(value) {
  return /^(https?:\/\/|\/|#)/i.test(value);
}

function cellHref(cell) {
  const link = cell?.querySelector('a[href]');
  if (link) return link.getAttribute('href')?.trim() || '';
  const text = cellText(cell);
  return looksLikeHref(text) ? text : '';
}

function headingTag(block) {
  return HEADING_TAGS.find((tag) => block.classList.contains(tag)) || 'h2';
}

function visibleCtaLabel(label, href) {
  if (!label || label === href) return '';
  return label;
}

function parseCells(block) {
  const cells = [...block.children].map((row) => row.firstElementChild);

  if (cells.length >= 4) {
    return {
      subheading: cellText(cells[0]),
      heading: cellText(cells[1]),
      ctaLabel: visibleCtaLabel(cellText(cells[2]), cellHref(cells[3])),
      ctaLink: cellHref(cells[3]),
    };
  }

  const ctaCell = cells.find((cell) => cellHref(cell)) || null;
  const textCells = cells.filter((cell) => cell && cell !== ctaCell);

  let subheading = '';
  let heading = '';
  if (textCells.length === 1) {
    heading = cellText(textCells[0]);
  } else if (textCells.length >= 2) {
    subheading = cellText(textCells[0]);
    heading = cellText(textCells[1]);
  }

  const ctaLink = ctaCell ? cellHref(ctaCell) : '';
  const ctaLabel = ctaCell ? visibleCtaLabel(cellText(ctaCell), ctaLink) : '';

  return {
    subheading, heading, ctaLabel, ctaLink,
  };
}

function createCta(href, label, accessibleName) {
  const cta = document.createElement('a');
  cta.className = 'section-title-cta';
  cta.href = href;
  cta.setAttribute('aria-label', label || accessibleName);

  if (label) {
    const labelEl = document.createElement('span');
    labelEl.className = 'section-title-cta-label';
    labelEl.textContent = label;
    labelEl.setAttribute('aria-hidden', 'true');
    cta.append(labelEl);
  }

  const icon = document.createElement('span');
  icon.className = 'icon icon-arrow-narrow-right section-title-cta-icon';
  icon.setAttribute('aria-hidden', 'true');
  cta.append(icon);
  decorateIcons(cta);
  return cta;
}

/**
 * Loads and decorates the Section Title block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const {
    subheading, heading, ctaLabel, ctaLink,
  } = parseCells(block);

  const textCol = document.createElement('div');
  textCol.className = 'section-title-text';

  if (subheading) {
    const sub = document.createElement('p');
    sub.className = 'section-title-subheading';
    sub.textContent = subheading;
    textCol.append(sub);
  }

  const headingEl = document.createElement(headingTag(block));
  headingEl.className = 'section-title-heading';
  headingEl.textContent = heading;
  textCol.append(headingEl);

  block.replaceChildren(textCol);

  if (ctaLink) {
    block.append(createCta(ctaLink, ctaLabel, heading || ctaLink));
  }
}
