import { createOptimizedPicture } from '../../scripts/aem.js';

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
 * Image Media block — an image-only component built on top of the OOTB image
 * (asset-picker reference + alt text + createOptimizedPicture optimization).
 * The aspect ratio (4:3, 8:5, 1:1) is chosen by the author via the block's
 * "classes" model field, which lands as a modifier class on the block element
 * (e.g. `image-media image-media-4-3`) and is handled purely in CSS.
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

  // Universal Editor delivers the image as a link followed by a dedicated
  // alt-text cell; published delivery ships a <picture> that already carries
  // its alt and has no separate cell. Apply the alt cell only in the former.
  if (img && !imageCell.querySelector('picture')) {
    const altCell = cells[imageIndex + 1];
    if (altCell && !pictureFromCell(altCell)) {
      const altText = altCell.textContent.trim();
      if (altText) img.alt = altText;
    }
  }

  const figure = document.createElement('div');
  figure.className = 'image-media-frame';
  figure.append(picture);

  block.textContent = '';
  block.append(figure);
}
