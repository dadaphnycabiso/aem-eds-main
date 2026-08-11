import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;

/**
 * Convert an image reference delivered as a plain text link (`<a href="…png">`)
 * into an optimized <picture>. Returns the picture, or null if the cell holds
 * no image.
 */
function pictureFromCell(cell) {
  const pic = cell.querySelector('picture');
  if (pic) return pic;
  const link = [...cell.querySelectorAll('a')]
    .find((a) => IMAGE_EXT.test(a.getAttribute('href') || ''));
  if (link) {
    return createOptimizedPicture(link.getAttribute('href'), link.textContent.trim(), false, [{ width: '750' }]);
  }
  const img = cell.querySelector('img');
  if (img) {
    return createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
  }
  return null;
}

function categorySlug(text) {
  return text.trim().toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Build a styled card body from the non-image cells of a card row.
 * Handles two delivery shapes:
 *   - AEM Universal Editor: one cell per field (category, title, description).
 *   - document authoring: a single rich cell holding <p>/<h3>/<ul>.
 */
function buildBody(cells) {
  const body = document.createElement('div');
  body.className = 'cards-featured-card-body';

  if (cells.length === 1) {
    // Rich body cell: adopt its children and style by tag.
    const cell = cells[0];
    while (cell.firstElementChild) body.append(cell.firstElementChild);
  } else {
    // Field-per-cell: interpret by model order category / title / description.
    const [catCell, titleCell, ...rest] = cells;
    if (catCell && catCell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = catCell.textContent.trim();
      body.append(p);
    }
    if (titleCell && titleCell.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = titleCell.textContent.trim();
      body.append(h3);
    }
    rest.forEach((cell) => {
      // description (richtext) and any keyword-tag list
      while (cell.firstElementChild) body.append(cell.firstElementChild);
      const leftover = cell.textContent.trim();
      if (!cell.childElementCount && leftover) {
        const p = document.createElement('p');
        p.textContent = leftover;
        body.append(p);
      }
    });
  }

  // Category eyebrow = leading paragraph.
  const first = body.querySelector('p, h1, h2, h3, h4, h5, h6');
  if (first && first.tagName === 'P' && !first.previousElementSibling) {
    first.classList.add('cards-featured-category');
    const slug = categorySlug(first.textContent);
    if (slug) first.classList.add(`cat-${slug}`);
  }

  body.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    h.classList.add('cards-featured-title');
  });

  body.querySelectorAll('p').forEach((p) => {
    if (!p.classList.contains('cards-featured-category')) {
      p.classList.add('cards-featured-body');
    }
  });

  const tags = body.querySelector('ul');
  if (tags) tags.classList.add('cards-featured-tags');

  return body;
}

export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'cards-featured-grid';

  const featuredWrap = document.createElement('div');
  featuredWrap.className = 'cards-featured-featured';

  const list = document.createElement('ul');
  list.className = 'cards-featured-list';

  rows.forEach((row, index) => {
    const cells = [...row.children];

    const card = document.createElement('div');
    card.className = 'cards-featured-card';
    moveInstrumentation(row, card);

    // Image cell (delivered as picture or as an image link).
    const imageCell = cells.find((c) => pictureFromCell(c));
    if (imageCell) {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'cards-featured-card-image';
      imageDiv.append(pictureFromCell(imageCell));
      card.append(imageDiv);
    }

    const bodyCells = cells.filter((c) => c !== imageCell);
    if (bodyCells.length) card.append(buildBody(bodyCells));

    if (index === 0) {
      card.classList.add('is-featured');
      featuredWrap.append(card);
    } else {
      const li = document.createElement('li');
      li.append(card);
      list.append(li);
    }
  });

  if (featuredWrap.hasChildNodes()) grid.append(featuredWrap);
  if (list.hasChildNodes()) grid.append(list);
  block.append(grid);
}
