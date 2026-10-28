const test = require('node:test');
const assert = require('node:assert');
const { matchScenario, buildEstimate, priceBook } = require('../src/engine');

test('matches free text to a scenario', () => {
  assert.equal(matchScenario('My brakes squeal when I stop'), 'brakes');
  assert.equal(matchScenario('the AC is blowing hot air'), 'ac');
  assert.equal(matchScenario('check engine light came on'), 'cel');
  assert.equal(matchScenario('due for an oil change'), 'maint');
  assert.equal(matchScenario('my radio is broken'), null);
});

test('front brakes on a Civic add up', () => {
  const e = buildEstimate({ scenario: 'brakes', vehicle: 'civic', answer: 'front' });
  // parts: 68 + 2*71 + 9 = 219; labor: 1.6 hr * 135 = 216
  assert.equal(e.parts, 219);
  assert.equal(e.labor, 216);
  assert.equal(e.supplies, 17.4);
  assert.equal(e.tax, round2((219 + 17.4) * priceBook.shop.taxRate));
  assert.equal(e.total, round2(e.parts + e.labor + e.supplies + e.tax));
});

test('truck multipliers raise parts and labor', () => {
  const civic = buildEstimate({ scenario: 'brakes', vehicle: 'civic', answer: 'front' });
  const truck = buildEstimate({ scenario: 'brakes', vehicle: 'f150', answer: 'front' });
  assert.ok(truck.parts > civic.parts);
  assert.ok(truck.labor > civic.labor);
});

test('labor hours round to the nearest 0.1', () => {
  const e = buildEstimate({ scenario: 'brakes', vehicle: 'f150', answer: 'front' });
  const hours = e.items.find(i => i.kind === 'labor').hours;
  assert.equal(hours, 1.8); // 1.6 * 1.15 = 1.84
});

test('shop supplies are capped', () => {
  const book = structuredClone(priceBook);
  book.shop.suppliesRate = 1;
  const e = buildEstimate({ scenario: 'maint', vehicle: 'civic' }, book);
  assert.equal(e.supplies, book.shop.suppliesCap);
});

test('every scenario and answer builds a valid estimate', () => {
  for (const [key, s] of Object.entries(priceBook.scenarios)) {
    const answers = s.question ? Object.keys(s.options) : [undefined];
    for (const answer of answers) {
      for (const vehicle of Object.keys(priceBook.vehicles)) {
        const e = buildEstimate({ scenario: key, vehicle, answer });
        assert.ok(e.total > 0 && Number.isFinite(e.total), `${key}/${answer}/${vehicle}`);
        assert.ok(e.note);
      }
    }
  }
});

test('rejects unknown inputs', () => {
  assert.throws(() => buildEstimate({ scenario: 'nope', vehicle: 'civic' }));
  assert.throws(() => buildEstimate({ scenario: 'brakes', vehicle: 'civic', answer: 'side' }));
});

function round2(n) { return Math.round(n * 100) / 100; }
