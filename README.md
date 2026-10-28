# quote-agent-demo

An auto-repair quoting assistant. A customer describes the problem, the agent asks the follow-up questions a good service advisor would ask, and it builds an itemized estimate from the shop's own price book. Every estimate goes to the owner for approval before the customer sees it.

**[▶ Try the live demo](https://xschaudhry.github.io/quote-agent-demo/)** · Demo shop and prices only, no real customer data.

## What it shows

- **Guided intake.** Problem, then vehicle, then one diagnostic question (for example "front or back?" for brake noise).
- **Estimates from the shop's own rules.** Labor rate, parts prices, per-vehicle multipliers, shop supplies with a cap, and tax on parts.
- **Real shop conventions.** Labor billed to the nearest 0.1 hour, "only charged if confirmed" lines for diagnostics, and urgency notes (a flashing check engine light).
- **A person approves before sending.** The estimate stops at the owner.

## How it works

```
index.html          chat interface (plain HTML/JS, no build step)
src/price-book.js   the shop's prices and rules: the only file to change for a new shop
src/engine.js       pure quoting logic, runs in the browser and in Node
test/               unit tests for the pricing math
```

The engine and the conversation are separate. In a client build, the chat layer is a language model that reads the customer's message and calls `buildEstimate()`. The numbers always come from the shop's price book, never from the model, so quotes stay consistent and auditable.

```js
const { buildEstimate } = require('./src/engine');
buildEstimate({ scenario: 'brakes', vehicle: 'civic', answer: 'front' });
// → { items: [...], parts: 219, labor: 216, supplies: 17.4, tax: 19.5, total: 471.9, note: '...' }
```

## Run it

Open `index.html` in a browser. To run the tests (Node 18+):

```bash
npm test
```

## Adapt it to a shop

Edit `src/price-book.js` with the shop's labor rate, tax rate, parts prices and common jobs. Then check accuracy with [calibration-kit](https://github.com/xschaudhry/calibration-kit) against the shop's past hand-written quotes.

---

Built by [Chaudhry Usman](https://www.linkedin.com/in/chaudhryusmantrx/) · TRXmode. I build custom AI quoting, follow-up and staff Q&A agents for service businesses. Contact: usman@trxmode.com
