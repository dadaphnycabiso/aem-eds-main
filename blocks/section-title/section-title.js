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
      heading: cellText(cells[0]),
      subheading: cellText(cells[1]),
      ctaLabel: visibleCtaLabel(cellText(cells[2]), cellHref(cells[3])),
      ctaLink: cellHref(cells[3]),
    };
  }

  const ctaCell = cells.find((cell) => cellHref(cell)) || null;
  const textCells = cells.filter((cell) => cell && cell !== ctaCell);

  let heading = '';
  let subheading = '';
  if (textCells.length === 1) {
    heading = cellText(textCells[0]);
  } else if (textCells.length >= 2) {
    heading = cellText(textCells[0]);
    subheading = cellText(textCells[1]);
  }

  const ctaLink = ctaCell ? cellHref(ctaCell) : '';
  const ctaLabel = ctaCell ? visibleCtaLabel(cellText(ctaCell), ctaLink) : '';

  return {
    subheading, heading, ctaLabel, ctaLink,
  };
}

function createCta(href, label, accessibleName) {
  const cta = document.createElement('a');
  cta.className = 'section-title__cta';
  cta.href = href;
  cta.setAttribute('aria-label', label || accessibleName);

  if (label) {
    const labelEl = document.createElement('span');
    labelEl.className = 'section-title__cta-label';
    labelEl.textContent = label;
    labelEl.setAttribute('aria-hidden', 'true');
    cta.append(labelEl);
  }

  const icon = document.createElement('span');
  icon.className = 'icon icon-arrow-narrow-right section-title__cta-icon';
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
  const level = headingTag(block);

  block.classList.add(`section-title--${level}`);

  const textCol = document.createElement('div');
  textCol.className = 'section-title__text';

  const headingEl = document.createElement(level);
  headingEl.className = 'section-title__heading';
  headingEl.textContent = heading;
  textCol.append(headingEl);

  if (subheading) {
    const sub = document.createElement('p');
    sub.className = 'section-title__subheading';
    sub.textContent = subheading;
    textCol.append(sub);
  }

  block.replaceChildren(textCol);

  if (ctaLink) {
    block.append(createCta(ctaLink, ctaLabel, heading || ctaLink));
  }
}
