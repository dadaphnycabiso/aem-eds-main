/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-text-block-demo.js
  var import_text_block_demo_exports = {};
  __export(import_text_block_demo_exports, {
    default: () => import_text_block_demo_default
  });
  var import_text_block_demo_default = {
    transformDOM: ({ document }) => {
      const main = document.createElement("main");
      const add = (parent, tag, html) => {
        const el = document.createElement(tag);
        if (html !== void 0) el.innerHTML = html;
        parent.append(el);
        return el;
      };
      const sections = [];
      const section = () => {
        const div = document.createElement("div");
        sections.push(div);
        return div;
      };
      const s1 = section();
      add(s1, "h2", "Explore New Zealand\u2019s conservation areas");
      add(s1, "p", "The Department of Conservation \u2014 Te Papa Atawhai \u2014 cares for around a third of Aotearoa New Zealand\u2019s land, along with many marine reserves, historic sites, and the plants and animals that live there.");
      add(s1, "h3", "Places to go and things to do");
      add(s1, "p", "From short family walks to multi-day Great Walks, there are experiences for every level of fitness and interest across the network of national parks.");
      add(s1, "h4", "Staying safe in the backcountry");
      add(s1, "p", "Always check the weather forecast, tell someone your plans, and carry the right gear before heading out onto the tracks.");
      add(s1, "h5", "Booking huts and campsites");
      add(s1, "p", "Many huts and campsites can be booked online in advance, especially during the busy summer season.");
      const s2 = section();
      add(s2, "h2", "About the work we do");
      add(s2, "p", "DOC works to protect New Zealand\u2019s natural and historic heritage for everyone to enjoy, now and in the future. This includes managing predator control programmes, restoring native habitats, and supporting threatened species such as the k\u0101k\u0101p\u014D, kiwi and takah\u0113.");
      add(s2, "p", "Much of this work is only possible thanks to volunteers, iwi, community groups and researchers who give their time and knowledge to help nature thrive.");
      const s3 = section();
      add(s3, "h3", "What to pack for a day walk");
      add(s3, "ul", `
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
      const s4 = section();
      add(s4, "h3", "How to book a Great Walk");
      add(s4, "ol", `
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
      const s5 = section();
      add(s5, "h3", "Popular sections on our website");
      add(s5, "p", 'Start planning your next trip by visiting <a href="https://www.doc.govt.nz/things-to-do">Things to do</a> or browse destinations under <a href="https://www.doc.govt.nz/places-to-go">Places to go</a>. You can also read about our <a href="https://www.doc.govt.nz/nature">native plants and animals</a>.');
      const s6 = section();
      add(s6, "h3", "Related organisations");
      add(s6, "p", 'For weather forecasts before you travel, check <a href="https://www.metservice.com">MetService</a>. You can also find general travel information via <a href="https://www.google.com">Google</a> or read about New Zealand\u2019s environment on <a href="https://en.wikipedia.org/wiki/Conservation_in_New_Zealand">Wikipedia</a>.');
      const s7 = section();
      add(s7, "h3", "Emphasis and formatting");
      add(s7, "p", "When you visit a national park, <strong>always follow the Leave No Trace principles</strong>. Take all your rubbish home with you and <em>keep to the marked tracks</em> to protect fragile alpine plants. Dogs are <u>not permitted</u> in most conservation areas without a permit.");
      const s8 = section();
      add(s8, "h3", "Facts and figures");
      add(s8, "p", "Aoraki / Mount Cook is New Zealand\u2019s highest peak at 3,724 m above sea level, covering an area of roughly 707 km<sup>2</sup> within its national park.");
      add(s8, "p", "Healthy freshwater habitats keep dissolved oxygen (O<sub>2</sub>) levels high, which is vital for native fish and invertebrates. Wetlands also store large amounts of carbon dioxide (CO<sub>2</sub>).");
      sections.forEach((sec, i) => {
        if (i > 0) main.append(document.createElement("hr"));
        main.append(sec);
      });
      return main;
    },
    generateDocumentPath: () => "/text-block-demo"
  };
  return __toCommonJS(import_text_block_demo_exports);
})();
