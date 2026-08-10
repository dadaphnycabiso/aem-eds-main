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
 * Returns true when the page still carries old AEM boilerplate content
 * that should be replaced with DOC-designed components.
 */
function isBoilerplatePage(main) {
  const h1 = main.querySelector('h1');
  return h1 && h1.textContent.includes('AEM');
}

/**
 * Injects a cards-featured block after the hero section as a fallback
 * when AEM content is unavailable.
 */
function buildFeaturedUpdates(main) {
  if (!isBoilerplatePage(main)) return;

  const heroSection = main.querySelector('.hero')?.closest('div');
  if (!heroSection) return;

  const section = document.createElement('div');
  section.innerHTML = `
    <div class="cards-featured block" data-block-name="cards-featured" data-block-status="initialized">
      <div><div><p>Subheading</p><h2>Featured updates</h2></div></div>
      <div>
        <div><picture><img src="/images/hero-welcome-bg.png" alt="Wildlife in New Zealand"></picture></div>
        <div><p>Wildlife health</p><h3>Avian influenza</h3><p>DOC is closely monitoring the avian influenza situation and working to protect native bird populations across New Zealand.</p></div>
      </div>
      <div>
        <div><picture><img src="/images/hero-welcome-bg.png" alt="Hahei Shore"></picture></div>
        <div><p>News</p><h3>Hahei Shoreline Update</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></div>
      </div>
      <div>
        <div><picture><img src="/images/hero-welcome-bg.png" alt="Aoraki Mt Cook"></picture></div>
        <div><p>Blog</p><h3>Aoraki/Mount Cook</h3><p>The eagerly anticipated trail reopening has been confirmed for this season.</p></div>
      </div>
      <div>
        <div><picture><img src="/images/hero-welcome-bg.png" alt="Kokako bird"></picture></div>
        <div><p>Event</p><h3>Kōkako Recovery</h3><p>Alan Saunders was a leading figure in the kōkako recovery programme.</p></div>
      </div>
    </div>`;

  heroSection.after(section);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildFeaturedUpdates(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
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
