/*
 * Import transform for the site index page.
 *
 * The bulk-import runner regenerates the ENTIRE content/index.plain.html from
 * this transform's output (via html2md -> md2da). To keep the existing curated
 * content byte-safe, this transform does NOT parse rendered/decorated DOM: it
 * reconstructs each authored block from the raw .plain.html source verbatim as
 * a gridtable, then appends a new "Image" section (3 aspect-ratio variants)
 * after the "Featured updates" (cards-featured) section.
 */

/* global WebImporter */

const TITLE_CASE = (s) => s
  .split('-')
  .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
  .join(' ');

/**
 * Reconstruct one authored block (`<div class="name variant...">`) into the
 * gridtable cells array the importer expects. First class = block name, any
 * remaining classes = variant tokens shown in the header parenthetical.
 */
function blockToCells(blockDiv, document) {
  const classes = [...blockDiv.classList];
  const name = classes[0];
  const variants = classes.slice(1).map((c) => c.replace(/-/g, ' '));
  const header = variants.length ? `${TITLE_CASE(name)} (${variants.join(', ')})` : TITLE_CASE(name);

  const rows = [[header]];
  [...blockDiv.children].forEach((rowDiv) => {
    const cells = [...rowDiv.children].map((cellDiv) => {
      const holder = document.createElement('div');
      while (cellDiv.firstChild) holder.append(cellDiv.firstChild);
      return holder;
    });
    rows.push(cells.length ? cells : ['']);
  });
  return rows;
}

/**
 * Build one image block's cells: image cell + caption cell.
 */
function imageCells(document, {
  src, alt, variant, caption,
}) {
  const header = `Image (${variant.replace(/-/g, ' ')})`;
  const img = document.createElement('img');
  img.src = src;
  if (alt) img.alt = alt;
  return [[header], [img], [caption || '']];
}

export default {
  transformDOM: ({ document }) => {
    const main = document.createElement('main');

    // Top-level sections of the raw .plain.html (each wrapper div holds one block).
    const sections = [...document.body.children].filter((el) => el.tagName === 'DIV');

    let cardsSectionEl = null;
    const built = sections.map((section) => {
      const blockDiv = [...section.children].find((c) => c.classList.length);
      const wrapper = document.createElement('div');
      if (blockDiv) {
        const table = WebImporter.DOMUtils.createTable(blockToCells(blockDiv, document), document);
        wrapper.append(table);
        if (blockDiv.classList.contains('cards-featured')) cardsSectionEl = wrapper;
      } else {
        // default content (no block) — move through verbatim
        while (section.firstChild) wrapper.append(section.firstChild);
      }
      return { wrapper, blockDiv };
    });

    // Build the new Image section (three variants) sourced from the DAM assets.
    const imageSection = document.createElement('div');
    const images = [
      {
        src: '/content/dam/aem-eds-site/hahei-walk.png', alt: 'Coastal walking track at Hahei', variant: 'image-8-5', caption: 'Hahei coastal walk',
      },
      {
        src: '/content/dam/aem-eds-site/tongariro-bridge.png', alt: 'Suspension bridge over the Tongariro River', variant: 'image-4-3', caption: 'Tongariro River bridge',
      },
      {
        src: '/content/dam/aem-eds-site/kokako.png', alt: 'A kōkako perched on a mossy branch', variant: 'image-1-1', caption: '',
      },
    ];
    images.forEach((img) => {
      imageSection.append(WebImporter.DOMUtils.createTable(imageCells(document, img), document));
    });

    // Assemble: existing sections in order, with the image section inserted
    // immediately after the cards-featured section, separated by <hr> breaks.
    const ordered = [];
    built.forEach(({ wrapper }) => {
      ordered.push(wrapper);
      if (wrapper === cardsSectionEl) ordered.push(imageSection);
    });
    // Fallback: if cards section wasn't found, append image section before metadata.
    if (!cardsSectionEl) ordered.splice(Math.max(ordered.length - 1, 0), 0, imageSection);

    ordered.forEach((sec, i) => {
      if (i > 0) main.append(document.createElement('hr'));
      main.append(sec);
    });

    return main;
  },

  generateDocumentPath: () => '/index',
};
