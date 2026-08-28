import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

// Button variation classes authored on the button-container (via the Button
// component's linkType / size / shape select fields) that should be mirrored
// onto the child <a class="button">, which decorateButtons() resets to a bare
// `button` (or `button primary`/`button secondary` for strong/em wrapping).
const BUTTON_VARIATION_CLASSES = [
  'primary', 'secondary', 'outline', 'ghost', 'ghost-inverted', 'destructive',
  'button-small', 'button-mini', 'button-round', 'button-square',
];

/**
 * Capture existing button variation classes from <a> elements BEFORE
 * decorateButtons() resets them. The XWalk delivery pipeline applies the
 * linkType value as a class on the <a>, but decorateButtons() in aem.js
 * unconditionally sets a.className = 'button', wiping it out.
 * @param {Element} element container element
 */
function captureButtonVariations(element) {
  element.querySelectorAll('a').forEach((a) => {
    const saved = BUTTON_VARIATION_CLASSES.filter((cls) => a.classList.contains(cls));
    if (saved.length) {
      a.dataset.btnVariations = saved.join(' ');
    }
  });
}

/**
 * Restore captured button variation classes and also mirror any variation
 * classes found on the .button-container onto the a.button.
 * Runs AFTER decorateButtons().
 * @param {Element} element container element
 */
export function decorateButtonVariations(element) {
  element.querySelectorAll('a.button').forEach((a) => {
    // Restore classes that were on the <a> before decorateButtons() stripped them
    if (a.dataset.btnVariations) {
      a.dataset.btnVariations.split(' ').forEach((cls) => a.classList.add(cls));
      delete a.dataset.btnVariations;
    }
    // Also check the container for classes (size/shape delivered there)
    const container = a.closest('.button-container');
    if (!container) return;
    BUTTON_VARIATION_CLASSES.forEach((cls) => {
      if (container.classList.contains(cls)) a.classList.add(cls);
    });
  });
}

/**
 * Adds a screen-reader-only "(external link)" label to anchors that point
 * outside doc.govt.nz, so assistive-technology users know the link leaves
 * the site. Skips anchors already decorated as buttons.
 * @param {HTMLElement} main The main container element
 */
export function decorateExternalLinks(main) {
  const defined = main.querySelectorAll('a[href^="http"]:not([href*="doc.govt.nz"], .button)');
  defined.forEach((a) => {
    if (a.querySelector('.sr-only')) return;
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = '(external link)';
    a.appendChild(span);
  });
}

/**
 * Converts remapped RTE block elements to semantic paragraphs with CSS classes.
 * The RTE blocks dropdown only supports standard HTML elements, so h6 and
 * h1 are repurposed as "Body 2" and "Caption" in the Text Block. This function
 * converts them to <p> with the appropriate class on the delivered page.
 * H1 is safe to convert here because the Title component uses its own wrapper.
 * @param {HTMLElement} main The main container element
 */
export function decorateTextStyles(main) {
  const mapping = [
    { selector: '.default-content-wrapper h6', className: 'text-body-small' },
    { selector: '.default-content-wrapper h1', className: 'text-caption' },
  ];
  mapping.forEach(({ selector, className }) => {
    main.querySelectorAll(selector).forEach((el) => {
      const p = document.createElement('p');
      p.className = className;
      p.innerHTML = el.innerHTML;
      [...el.attributes].forEach((attr) => {
        if (attr.name !== 'class') p.setAttribute(attr.name, attr.value);
      });
      el.replaceWith(p);
    });
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  captureButtonVariations(main);
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateTextStyles(main);
  decorateExternalLinks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
