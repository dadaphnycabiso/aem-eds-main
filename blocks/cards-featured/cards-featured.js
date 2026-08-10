import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Decorate the body cell of a card: category eyebrow, title, description and
 * optional keyword tags.
 */
function decorateBody(body) {
  body.className = 'cards-featured-card-body';

  // Category eyebrow = first paragraph (before any heading).
  const first = body.querySelector('p, h1, h2, h3, h4, h5, h6');
  if (first && first.tagName === 'P' && !first.previousElementSibling) {
    first.classList.add('cards-featured-category');
    const slug = first.textContent.trim().toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (slug) first.classList.add(`cat-${slug}`);
  }

  // Titles (any heading level authored inside the card).
  body.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    h.classList.add('cards-featured-title');
  });

  // Description paragraphs (everything that isn't the category).
  body.querySelectorAll('p').forEach((p) => {
    if (!p.classList.contains('cards-featured-category')) {
      p.classList.add('cards-featured-body');
    }
  });

  // Keyword tags authored as a bullet list.
  const tags = body.querySelector('ul');
  if (tags) tags.classList.add('cards-featured-tags');
}

export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const header = document.createElement('div');
  header.className = 'cards-featured-header';

  const grid = document.createElement('div');
  grid.className = 'cards-featured-grid';

  const featuredWrap = document.createElement('div');
  featuredWrap.className = 'cards-featured-featured';

  const list = document.createElement('ul');
  list.className = 'cards-featured-list';

  let cardIndex = 0;

  rows.forEach((row) => {
    const hasImage = !!row.querySelector('picture');

    // A leading text-only row is the section header (eyebrow + heading).
    if (!hasImage && cardIndex === 0 && !featuredWrap.hasChildNodes()) {
      while (row.firstElementChild) {
        const cell = row.firstElementChild;
        while (cell.firstElementChild) header.append(cell.firstElementChild);
        cell.remove();
      }
      // Style the header eyebrow / heading.
      const firstP = header.querySelector('p');
      if (firstP && firstP.tagName === 'P' && !firstP.previousElementSibling) {
        firstP.classList.add('cards-featured-eyebrow');
      }
      header.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
        h.classList.add('cards-featured-heading');
      });
      return;
    }

    const card = document.createElement('div');
    card.className = 'cards-featured-card';
    moveInstrumentation(row, card);

    [...row.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-featured-card-image';
      } else {
        decorateBody(div);
      }
      card.append(div);
    });

    if (cardIndex === 0) {
      card.classList.add('is-featured');
      featuredWrap.append(card);
    } else {
      const li = document.createElement('li');
      li.append(card);
      list.append(li);
    }
    cardIndex += 1;
  });

  // Optimize pictures.
  [...featuredWrap.querySelectorAll('picture > img'), ...list.querySelectorAll('picture > img')]
    .forEach((img) => {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      img.closest('picture').replaceWith(optimizedPic);
    });

  if (header.hasChildNodes()) block.append(header);
  if (featuredWrap.hasChildNodes()) grid.append(featuredWrap);
  if (list.hasChildNodes()) grid.append(list);
  block.append(grid);
}
