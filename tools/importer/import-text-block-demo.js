/*
 * Import transform for the "Text Block Demo" sample page.
 *
 * This is a synthetic page (no source URL to scrape). The bulk-import runner
 * still fetches a reachable URL to obtain a `document`, but this transform
 * ignores that DOM entirely and builds the page's Default Content (a single
 * Text Block: headings, paragraphs, lists, links and inline formatting) from
 * scratch. The runner then converts the returned <main> to markdown and writes
 * content/text-block-demo.plain.html.
 *
 * H1 is intentionally omitted — it is reserved for the page title only.
 */

/* global WebImporter */

export default {
  transformDOM: ({ document }) => {
    const main = document.createElement('main');

    // Helper: append an element with an HTML body to a container.
    const add = (parent, tag, html) => {
      const el = document.createElement(tag);
      if (html !== undefined) el.innerHTML = html;
      parent.append(el);
      return el;
    };

    // Each authored "section" is a wrapper div; the runner separates them with
    // <hr> horizontal rules (thematic breaks) between sections.
    const sections = [];
    const section = () => {
      const div = document.createElement('div');
      sections.push(div);
      return div;
    };

    // --- Section 1: Heading scale (H2–H5) ---------------------------------
    const s1 = section();
    add(s1, 'h2', 'Explore New Zealand’s conservation areas');
    add(s1, 'p', 'The Department of Conservation — Te Papa Atawhai — cares for around a third of Aotearoa New Zealand’s land, along with many marine reserves, historic sites, and the plants and animals that live there.');
    add(s1, 'h3', 'Places to go and things to do');
    add(s1, 'p', 'From short family walks to multi-day Great Walks, there are experiences for every level of fitness and interest across the network of national parks.');
    add(s1, 'h4', 'Staying safe in the backcountry');
    add(s1, 'p', 'Always check the weather forecast, tell someone your plans, and carry the right gear before heading out onto the tracks.');
    add(s1, 'h5', 'Booking huts and campsites');
    add(s1, 'p', 'Many huts and campsites can be booked online in advance, especially during the busy summer season.');

    // --- Section 2: Body text --------------------------------------------
    const s2 = section();
    add(s2, 'h2', 'About the work we do');
    add(s2, 'p', 'DOC works to protect New Zealand’s natural and historic heritage for everyone to enjoy, now and in the future. This includes managing predator control programmes, restoring native habitats, and supporting threatened species such as the kākāpō, kiwi and takahē.');
    add(s2, 'p', 'Much of this work is only possible thanks to volunteers, iwi, community groups and researchers who give their time and knowledge to help nature thrive.');

    // --- Section 3: Unordered list with a nested sublist ------------------
    const s3 = section();
    add(s3, 'h3', 'What to pack for a day walk');
    add(s3, 'ul', `
      <li>Sturdy footwear and warm layers</li>
      <li>Food and plenty of water</li>
      <li>Weather protection, including:
        <ul>
          <li>A waterproof rain jacket</li>
          <li>A warm hat and gloves</li>
          <li>Sunscreen and sunglasses</li>
        </ul>
      </li>
      <li>A charged phone or personal locator beacon</li>
    `);

    // --- Section 4: Ordered list with a nested sublist --------------------
    const s4 = section();
    add(s4, 'h3', 'How to book a Great Walk');
    add(s4, 'ol', `
      <li>Choose your track and dates</li>
      <li>Create or sign in to your account</li>
      <li>Complete your booking by:
        <ol>
          <li>Selecting your huts or campsites</li>
          <li>Adding the number of people in your group</li>
          <li>Paying the booking fees</li>
        </ol>
      </li>
      <li>Print or save your confirmation before you go</li>
    `);

    // --- Section 5: Internal links (doc.govt.nz) --------------------------
    const s5 = section();
    add(s5, 'h3', 'Popular sections on our website');
    add(s5, 'p', 'Start planning your next trip by visiting <a href="https://www.doc.govt.nz/things-to-do">Things to do</a> or browse destinations under <a href="https://www.doc.govt.nz/places-to-go">Places to go</a>. You can also read about our <a href="https://www.doc.govt.nz/nature">native plants and animals</a>.');

    // --- Section 6: External links ---------------------------------------
    const s6 = section();
    add(s6, 'h3', 'Related organisations');
    add(s6, 'p', 'For weather forecasts before you travel, check <a href="https://www.metservice.com">MetService</a>. You can also find general travel information via <a href="https://www.google.com">Google</a> or read about New Zealand’s environment on <a href="https://en.wikipedia.org/wiki/Conservation_in_New_Zealand">Wikipedia</a>.');

    // --- Section 7: Bold / italic / underline ----------------------------
    const s7 = section();
    add(s7, 'h3', 'Emphasis and formatting');
    add(s7, 'p', 'When you visit a national park, <strong>always follow the Leave No Trace principles</strong>. Take all your rubbish home with you and <em>keep to the marked tracks</em> to protect fragile alpine plants. Dogs are <u>not permitted</u> in most conservation areas without a permit.');

    // --- Section 8: Superscript / subscript ------------------------------
    const s8 = section();
    add(s8, 'h3', 'Facts and figures');
    add(s8, 'p', 'Aoraki / Mount Cook is New Zealand’s highest peak at 3,724 m above sea level, covering an area of roughly 707 km<sup>2</sup> within its national park.');
    add(s8, 'p', 'Healthy freshwater habitats keep dissolved oxygen (O<sub>2</sub>) levels high, which is vital for native fish and invertebrates. Wetlands also store large amounts of carbon dioxide (CO<sub>2</sub>).');

    // Assemble sections with <hr> breaks between them.
    sections.forEach((sec, i) => {
      if (i > 0) main.append(document.createElement('hr'));
      main.append(sec);
    });

    return main;
  },

  generateDocumentPath: () => '/text-block-demo',
};
