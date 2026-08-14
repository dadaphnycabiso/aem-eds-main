import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;

/**
 * Resolve the author's image from a cell into an optimized <picture>.
 * Handles both delivery shapes this project produces:
 *   - Published/preview (.aem.page / localhost): image arrives as a <picture>.
 *   - Universal Editor (field-per-row): image arrives as a plain <a href="*.png">.
 * Returns the picture, or null if the cell holds no image.
 */
function pictureFromCell(cell) {
  if (!cell) return null;
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

/**
 * Image block — the OOTB image component (asset-picker reference + alt text +
 * createOptimizedPicture optimization) extended with:
 *   - an author-selectable aspect ratio (4:3, 8:5, 1:1), applied as a modifier
 *     class on the block element and handled purely in CSS;
 *   - an optional "Image Name / Caption" overlaid on the bottom of the frame.
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];

  // Locate the image cell (first cell that resolves to a picture).
  const imageIndex = cells.findIndex((c) => pictureFromCell(c));
  if (imageIndex === -1) {
    // No image authored yet — leave the block empty so the layout can show
    // its empty state without throwing.
    block.textContent = '';
    return;
  }

  const imageCell = cells[imageIndex];
  const picture = pictureFromCell(imageCell);
  const img = picture.querySelector('img');
  const consumed = [imageCell];

  // Universal Editor delivers the image as a link followed by a dedicated
  // alt-text cell; published delivery ships a <picture> that already carries
  // its alt and has no separate cell. Apply the alt cell only in the former.
  if (img && !imageCell.querySelector('picture')) {
    const altCell = cells[imageIndex + 1];
    if (altCell && !pictureFromCell(altCell)) {
      consumed.push(altCell);
      const altText = altCell.textContent.trim();
      if (altText) img.alt = altText;
    }
  }

  const frame = document.createElement('div');
  frame.className = 'image-frame';
  frame.append(picture);

  const figure = document.createElement('figure');
  figure.className = 'image-figure';
  moveInstrumentation(block, figure);
  figure.append(frame);

  // The first remaining non-empty text cell is the optional caption.
  const captionCell = cells.find((c) => !consumed.includes(c) && c.textContent.trim());
  const captionText = captionCell ? captionCell.textContent.trim() : '';
  if (captionText) {
    const caption = document.createElement('figcaption');
    caption.className = 'image-caption';
    caption.textContent = captionText;
    // figcaption must be a direct child of figure; overlaid via CSS.
    figure.append(caption);
  }

  block.textContent = '';
  block.append(figure);
}
