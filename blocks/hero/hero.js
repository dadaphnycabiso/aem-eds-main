import { decorateIcons } from '../../scripts/aem.js';

/**
 * Checks if this hero contains old boilerplate content that should be
 * replaced with the DOC hero-welcome block.
 */
function isBoilerplateHero(block) {
  const heading = block.querySelector('h1');
  return heading && heading.textContent.includes('AEM');
}

/**
 * Renders the DOC hero-welcome block as a temporary fallback
 * until AEM content is updated.
 */
function renderHeroWelcome(block) {
  block.className = 'hero-welcome block';
  block.closest('.hero-container')?.classList.add('hero-welcome-container');
  block.closest('.hero-wrapper')?.classList.add('hero-welcome-wrapper');

  block.innerHTML = `
    <div>
      <div><picture><img src="/images/hero-welcome-bg.png" alt="People enjoying New Zealand outdoors"></picture></div>
    </div>
    <div class="hero-welcome-content">
      <div>
        <p>Welcome</p>
        <h1>Haere mai</h1>
      </div>
      <div class="hero-welcome-pills">
        <a href="/online-bookings">Online bookings</a>
        <a href="/walking">Walking</a>
        <a href="/huts">Huts</a>
        <a href="/hunting">Hunting</a>
      </div>
    </div>
    <div class="hero-welcome-search">
      <span class="hero-welcome-search-icon"><span class="icon icon-search"></span></span>
      <input type="search" aria-label="Search" placeholder="Search">
      <button type="button" class="hero-welcome-search-submit" aria-label="Submit search">
        <span class="icon icon-search"></span>
      </button>
    </div>`;

  decorateIcons(block);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/blocks/hero-welcome/hero-welcome.css';
  document.head.append(link);
}

export default function decorate(block) {
  if (isBoilerplateHero(block)) {
    renderHeroWelcome(block);
    return;
  }

  // Standard hero decoration for non-boilerplate content
  const pic = block.querySelector('picture');
  if (pic) {
    const section = pic.closest('div');
    if (section) section.classList.add('hero-image');
  }
}
