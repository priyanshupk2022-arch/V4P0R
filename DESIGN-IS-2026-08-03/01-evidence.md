# Evidence

## Current product

- `/` combines telemetry, scenarios, inventory, offboarding, and audit in one 603-line client component: `src/app/page.tsx:222`.
- `/demo/prava` combines the six-step provider journey in one 500-line client component: `src/app/demo/prava/page.tsx:287`.
- Existing dark tokens and semantic states are reusable: `src/app/globals.css:3`, `src/app/globals.css:76`.
- Current accessibility foundations include focus-visible, screen-reader helpers, and reduced motion: `src/app/globals.css:37`, `src/app/globals.css:185`.
- Provider adapters are imported into a client page: `src/app/demo/prava/page.tsx:1`.
- Senso relevance is displayed as hard-coded `96.4%`: `src/app/demo/prava/page.tsx:384`.
- Homepage and partner approval interactions include simulated states: `src/app/page.tsx:420`.
- Current orchestration truth is repair-in-progress, so old clean-pass copy must not drive UI claims: `orchestration/state.json:7`.

## Frentix reference

- Published system: Inter, dark surfaces, purple emphasis, bright semantic accents, large monetary hierarchy, rounded cards, action shortcuts, icon-led transaction rows, and explicit completion screens.
- Flow: entry/auth, summary home, frequent actions, activity history, insights, cards, profile.
- Adaptable principles: summary first, frequent actions second, history third; progressive disclosure; strong confirmation states.
- Protected expression not to copy: name/logo, exact palette, gradients, pixel geometry, navigation composition, icons, copy, charts, imagery, sample data, and complete screen sequence.

## Authoritative VAPOR journey

`purchase intent -> Senso evidence -> deterministic policy -> Linq approval when required -> Prava permission/passkey -> one-time credential -> merchant checkout -> expected sandbox outcome -> redacted durable audit`.

The UI must represent provider-derived states and never convert missing evidence into synthetic success.

