// Quote engine: turns a scenario, vehicle and answer into an itemized estimate.
// Pure functions, no network calls; runs in the browser and in Node.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./price-book'));
  else root.QuoteEngine = factory(root.PRICE_BOOK);
})(typeof self !== 'undefined' ? self : this, function (book) {
  const round2 = n => Math.round(n * 100) / 100;

  // Finds the scenario a free-text message is about, or null.
  function matchScenario(text, priceBook = book) {
    const words = text.toLowerCase();
    for (const [key, s] of Object.entries(priceBook.scenarios)) {
      if (s.keywords.some(k => new RegExp('\\b' + k.replace('/', '\\/')).test(words))) return key;
    }
    return null;
  }

  function linesFor(scenario, answer) {
    if (!scenario.question) return { lines: scenario.lines, note: scenario.note };
    const opt = scenario.options[answer];
    if (!opt) throw new Error(`Unknown answer "${answer}"`);
    return { lines: opt.lines || scenario.celLines, note: opt.note };
  }

  function buildEstimate({ scenario, vehicle, answer }, priceBook = book) {
    const s = priceBook.scenarios[scenario];
    const v = priceBook.vehicles[vehicle];
    if (!s) throw new Error(`Unknown scenario "${scenario}"`);
    if (!v) throw new Error(`Unknown vehicle "${vehicle}"`);
    const { laborRate, taxRate, suppliesRate, suppliesCap } = priceBook.shop;
    const { lines, note } = linesFor(s, answer);

    let parts = 0, labor = 0;
    const items = lines.map(l => {
      if (l.k === 'labor') {
        const hours = round2(Math.round(l.q * v.l * 10) / 10); // shops bill to the nearest 0.1 hr
        const amount = round2(hours * laborRate);
        labor += amount;
        return { description: l.d, kind: 'labor', hours, amount, note: l.s || null };
      }
      const amount = round2(l.q * l.u * v.p);
      parts += amount;
      return { description: l.d, kind: 'part', qty: l.q, amount, note: l.s || null };
    });

    const supplies = round2(Math.min(suppliesCap, (parts + labor) * suppliesRate));
    const tax = round2((parts + supplies) * taxRate);
    return {
      shop: priceBook.shop.name,
      vehicle: v.name,
      items,
      parts: round2(parts),
      labor: round2(labor),
      supplies,
      tax,
      total: round2(parts + labor + supplies + tax),
      note
    };
  }

  return { matchScenario, buildEstimate, priceBook: book };
});
