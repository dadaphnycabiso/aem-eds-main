import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Splits a bilingual nav label into two lines: a small "Te Reo" label above
 * the main item name. Content authors write "Te Reo | Item Name" (pipe
 * separated). The first anchor/text node in each top-level <li> is decorated.
 * @param {Element} navSections The nav sections container
 */
function decorateNavItems(navSections) {
  navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((li) => {
    // the label lives in the first child that isn't the submenu <ul>
    const labelHost = [...li.children].find((c) => c.tagName !== 'UL') || li;
    const link = labelHost.querySelector('a');
    const target = link || labelHost;
    const raw = target.textContent.trim();
    if (!raw) return;

    const [top, main] = raw.includes('|')
      ? raw.split('|').map((s) => s.trim())
      : [null, raw];

    target.textContent = '';
    if (top) {
      const topSpan = document.createElement('span');
      topSpan.className = 'nav-item-label';
      topSpan.textContent = top;
      target.append(topSpan);
    }
    const nameSpan = document.createElement('span');
    nameSpan.className = 'nav-item-name';
    nameSpan.textContent = main;
    target.append(nameSpan);
  });
}

/**
 * Turns the search icon placeholder in the tools area into a search input.
 * @param {Element} navTools The nav tools container
 */
function decorateSearch(navTools) {
  const searchIcon = navTools.querySelector('.icon-search');
  if (!searchIcon) return;
  const host = searchIcon.closest('p') || searchIcon.parentElement;
  const search = document.createElement('div');
  search.className = 'nav-search';
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');
  search.append(searchIcon, input);
  host.replaceWith(search);
}

/**
 * Marks the ABN badge image wrapper so it can be styled/positioned.
 * @param {Element} navTools The nav tools container
 */
function decorateAbnBadge(navTools) {
  const badge = navTools.querySelector('p > picture, p > img');
  if (!badge) return;
  const host = badge.closest('p');
  host.classList.add('nav-abn');
}

/**
 * Returns the DOC navigation HTML structure matching the Figma design.
 * Used as fallback when AEM nav content is unavailable or outdated.
 */
function getDOCNavHTML() {
  return `
    <div>
      <div class="default-content-wrapper">
        <p><a href="/"><picture><img src="/icons/doc-logo.svg" alt="Department of Conservation - Te Papa Atawhai"></picture></a></p>
      </div>
    </div>
    <div>
      <div class="default-content-wrapper">
        <ul>
          <li><a href="/things-to-do">Te Reo | Things to Do</a>
            <ul>
              <li><a href="/walks-and-hikes">Walks &amp; Hikes</a></li>
              <li><a href="/camping">Camping</a></li>
              <li><a href="/fishing">Fishing</a></li>
            </ul>
          </li>
          <li><a href="/places-to-go">Te Reo | Places to Go</a>
            <ul>
              <li><a href="/national-parks">National Parks</a></li>
              <li><a href="/marine-reserves">Marine Reserves</a></li>
              <li><a href="/conservation-parks">Conservation Parks</a></li>
            </ul>
          </li>
          <li><a href="/conservation">Te Reo | Conservation</a>
            <ul>
              <li><a href="/native-animals">Native Animals</a></li>
              <li><a href="/native-plants">Native Plants</a></li>
              <li><a href="/threats-and-impacts">Threats &amp; Impacts</a></li>
            </ul>
          </li>
          <li><a href="/get-involved">Te Reo | Get Involved</a>
            <ul>
              <li><a href="/volunteer">Volunteer</a></li>
              <li><a href="/donate">Donate</a></li>
              <li><a href="/events">Events</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <div>
      <div class="default-content-wrapper">
        <p><picture><img src="/icons/abn-badge.svg" alt="Always Be Naturing"></picture></p>
    <p><span class="icon icon-search"></span></p>
    <p class="button-container"><a href="/login" class="button"><span class="icon icon-user"></span> Log In</a></p>
      </div>
    </div>`;
}

/**
 * Checks if loaded nav fragment has the expected DOC structure.
 */
function isDOCNav(fragment) {
  const firstImg = fragment.querySelector('img');
  return firstImg && firstImg.src && firstImg.src.includes('doc-logo');
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  let fragment = await loadFragment(navPath);

  // Use DOC nav fallback if AEM content doesn't have expected structure
  if (!isDOCNav(fragment)) {
    const temp = document.createElement('main');
    temp.innerHTML = getDOCNavHTML();
    fragment = temp;
  }

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container').className = '';
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
    decorateNavItems(navSections);
  }

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    decorateAbnBadge(navTools);
    decorateSearch(navTools);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
