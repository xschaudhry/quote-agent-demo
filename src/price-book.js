// Demo price book for a fictional shop. Replace these numbers with a real shop's
// labor rate, parts prices and tax rules to adapt the agent.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PRICE_BOOK = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    shop: {
      name: 'Riverside Auto',
      laborRate: 135,      // dollars per hour
      taxRate: 0.0825,     // applied to parts and shop supplies
      suppliesRate: 0.04,  // shop supplies as a share of parts + labor
      suppliesCap: 35
    },

    // Multipliers on parts price (p) and labor hours (l) per vehicle.
    vehicles: {
      civic: { name: '2018 Honda Civic', p: 1, l: 1 },
      f150: { name: '2015 Ford F-150', p: 1.3, l: 1.15 },
      rav4: { name: '2020 Toyota RAV4', p: 1.1, l: 1 }
    },

    // Each scenario asks one follow-up question; each answer has its own job lines.
    // Line kinds: "part" uses qty x unit price, "labor" uses hours x labor rate.
    scenarios: {
      brakes: {
        label: 'Grinding when I brake',
        keywords: ['brake', 'grind', 'squeal', 'squeak', 'pad', 'rotor'],
        question: 'A grinding noise usually means the pads are worn down to metal. Is the noise from the front, the back, or are you not sure?',
        options: {
          front: {
            label: 'Front',
            note: 'Grinding means metal on metal. We recommend booking within a few days.',
            lines: [
              { d: 'Brake pads, front set', k: 'part', q: 1, u: 68 },
              { d: 'Brake rotors, front (pair)', k: 'part', q: 2, u: 71, s: 'Grinding usually damages rotors' },
              { d: 'Labor: replace pads and rotors', k: 'labor', q: 1.6 },
              { d: 'Brake fluid check and top-off', k: 'part', q: 1, u: 9 }
            ]
          },
          rear: {
            label: 'Back',
            note: 'Grinding means metal on metal. We recommend booking within a few days.',
            lines: [
              { d: 'Brake pads, rear set', k: 'part', q: 1, u: 58 },
              { d: 'Brake rotors, rear (pair)', k: 'part', q: 2, u: 64, s: 'Grinding usually damages rotors' },
              { d: 'Labor: replace pads and rotors', k: 'labor', q: 1.8 },
              { d: 'Brake fluid check and top-off', k: 'part', q: 1, u: 9 }
            ]
          },
          unsure: {
            label: 'Not sure',
            note: 'Front is most likely, so this estimate is for the front. We inspect first and call you if the back needs work too.',
            lines: [
              { d: 'Brake inspection, all four wheels', k: 'labor', q: 0.5, s: 'We confirm which axle before any work' },
              { d: 'Brake pads, front set', k: 'part', q: 1, u: 68 },
              { d: 'Brake rotors, front (pair)', k: 'part', q: 2, u: 71 },
              { d: 'Labor: replace pads and rotors', k: 'labor', q: 1.6 },
              { d: 'Brake fluid check and top-off', k: 'part', q: 1, u: 9 }
            ]
          }
        }
      },

      ac: {
        label: 'My AC is blowing warm air',
        keywords: ['ac', 'a/c', 'air', 'cool', 'cold', 'warm', 'hot'],
        question: 'Did the AC stop cooling suddenly, or has it gotten weaker over time?',
        options: {
          gradual: {
            label: 'Weaker over time',
            note: 'A slow fade usually means a small leak. The dye helps us find it at your next visit.',
            lines: [
              { d: 'AC performance check', k: 'labor', q: 0.5 },
              { d: 'Refrigerant recharge (R-1234yf)', k: 'part', q: 1, u: 95 },
              { d: 'UV leak-detection dye', k: 'part', q: 1, u: 18, s: 'Lets us find slow leaks' },
              { d: 'Labor: evacuate and recharge', k: 'labor', q: 0.8 }
            ]
          },
          sudden: {
            label: 'Stopped suddenly',
            note: 'A sudden stop is often electrical, which is cheaper to fix. If the compressor has failed, we call you with a separate quote first.',
            lines: [
              { d: 'AC system diagnosis', k: 'labor', q: 1.0, s: 'Pressure test and compressor check' },
              { d: 'Compressor clutch relay (if needed)', k: 'part', q: 1, u: 38 },
              { d: 'Labor: relay replacement', k: 'labor', q: 0.3 }
            ]
          }
        }
      },

      cel: {
        label: 'My check engine light is on',
        keywords: ['engine', 'light', 'cel', 'misfire', 'code'],
        question: 'Is the check engine light flashing, or is it on steadily?',
        options: {
          steady: {
            label: 'On steadily',
            note: 'A steady light is not urgent, but we recommend a scan this week. Parts and labor are only charged if the scan confirms a misfire.',
            lines: null // filled from celLines below
          },
          flashing: {
            label: 'Flashing',
            note: 'A flashing light means an active misfire that can damage the catalytic converter. Please drive gently and book today. Parts and labor are only charged if the scan confirms a misfire.',
            lines: null
          }
        },
        celLines: [
          { d: 'Diagnostic scan and road test', k: 'labor', q: 1.0, s: 'Reads the fault code and confirms the cause' },
          { d: 'Ignition coil (if a misfire is confirmed)', k: 'part', q: 1, u: 86 },
          { d: 'Spark plug for that cylinder', k: 'part', q: 1, u: 14 },
          { d: 'Labor: coil and plug replacement', k: 'labor', q: 0.7 }
        ]
      },

      maint: {
        label: 'Oil change and tire rotation',
        keywords: ['oil', 'rotat', 'service', 'maint', 'tire'],
        question: null,
        note: 'Takes about 45 minutes. You can wait in the lobby.',
        lines: [
          { d: 'Full synthetic oil, 5 qt', k: 'part', q: 5, u: 8.4 },
          { d: 'Oil filter', k: 'part', q: 1, u: 12 },
          { d: 'Labor: oil change and tire rotation', k: 'labor', q: 0.6 },
          { d: 'Multi-point inspection', k: 'part', q: 1, u: 0, s: 'Free with every service' }
        ]
      }
    }
  };
});
