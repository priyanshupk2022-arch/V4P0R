# VAPOR UI/UX Blueprint

Status: authoritative UI implementation plan  
Reference direction: Frentix dark-fintech hierarchy, adapted into an original VAPOR system  
Verdict: structural redesign, preserving verified provider/domain behavior

## 1. Product experience objective

VAPOR must feel like a financial control room, not a generic wallet. A first-time judge should understand within ten seconds:

1. What risky spend was detected.
2. Why VAPOR approved, rejected, or escalated it.
3. Which partner produced each piece of evidence.
4. What happened at the merchant.
5. Where the redacted audit proof lives.

Primary audience: US finance leaders, FinOps teams, IT/security administrators, and startup operators managing employee SaaS, cloud, and AI-agent spend.

Primary promise: **Stop risky company spend before it becomes a bill.**

Expanded product promise: **Know who owns every subscription, why the company pays for it, when it renews, and whether the next charge should be allowed.**

## 2. Non-negotiable design rules

- Do not copy Frentix's logo, assets, exact palette, gradient, geometry, navigation arrangement, copy, charts, or sample data.
- Preserve the reference's useful principles: dark confidence, summary-first hierarchy, fast actions, readable financial rows, and decisive completion states.
- Never display fabricated provider evidence, random provider IDs, fake relevance, fake approval, fake card issuance, or fake merchant success.
- Every provider component must expose one of: `LIVE`, `SANDBOX`, `PENDING`, `UNAVAILABLE`, `ERROR`, or explicitly labelled `DEMO`.
- PAN, CVV, OTP, passkey material, access tokens, secrets, and raw webhook payloads never render or enter client logs.
- Existing domain/provider behavior is frozen unless a UI blocker exposes a verified bug. UI work must not silently rewrite payment contracts.

## 3. Original VAPOR visual identity

### 3.1 Color tokens

Use CSS custom properties; no component-level raw hex values.

```css
--canvas: #080A0F;
--surface-1: #0F131C;
--surface-2: #151B27;
--surface-3: #1B2331;
--border-subtle: #263044;
--border-strong: #3A4761;
--text-primary: #F7F8FC;
--text-secondary: #AAB4C5;
--text-muted: #748095;
--vapor-primary: #7C5CFF;
--vapor-primary-hover: #9279FF;
--signal-safe: #35E6B0;
--signal-warning: #FFC857;
--signal-danger: #FF6174;
--signal-info: #58B8FF;
--provider-senso: #35E6B0;
--provider-linq: #58B8FF;
--provider-prava: #A879FF;
--focus: #C7B9FF;
```

Rules:

- Purple represents VAPOR action/authority, not success.
- Green is reserved for verified safe/success states.
- Red is reserved for rejected, blocked, failed, or dangerous states.
- Yellow is reserved for review/pending/expiry risk.
- Never communicate status with color alone; pair icon + label + text.

### 3.2 Typography

- Display/headings: Satoshi, locally served; fallback Inter, system-ui.
- Body and controls: Inter, locally served; fallback system-ui.
- Identifiers, amounts, latency, policy versions: JetBrains Mono.
- Scale: 12, 14, 16, 20, 24, 32, 48px.
- Body line-height 1.5; labels 1.3; display 1.05–1.15.
- No remote font dependency in the final release.

### 3.3 Geometry and spacing

- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px.
- Card radius: 20px primary, 14px compact, 10px controls.
- Control height: 44px minimum; primary CTA 52px.
- Borders: 1px default; 2px only for selected/focus/critical states.
- Shadows are subtle and neutral; provider/status glow is prohibited.

### 3.4 Motion

- 120–180ms state transitions; 220ms maximum page transition.
- Animate opacity/transform only.
- No idle animation, particle effects, autoplay media, number roulettes, or fake scanning loops.
- Respect `prefers-reduced-motion` and remove nonessential motion.

## 4. Information architecture

Desktop sidebar / mobile bottom navigation:

1. **Overview** — exposure summary and active incidents.
2. **Incidents** — anomaly queue and decision workspace.
3. **Spend** — subscriptions, cloud/API spend, employee ownership.
4. **Cards** — Prava-backed permissions/card states, never raw credentials.
5. **Audit** — correlated evidence timeline and export.

Secondary utilities: global search, organization switcher, environment badge, provider health, help, and profile.

Demo shortcut: **Run judge journey** opens one preconfigured incident and never bypasses real provider states.

The primary navigation expands to six durable product domains once the underlying data exists:

1. **Overview** — financial exposure, active incidents, savings, and renewals.
2. **Incidents** — decisions that require investigation or approval.
3. **Subscriptions** — every recurring SaaS, AI, and cloud commitment.
4. **People** — employees, agents, ownership, department, and offboarding impact.
5. **Payments** — Prava permissions/sessions and merchant outcomes.
6. **Audit** — redacted, correlated evidence and change history.

## 5. Core screen blueprints

### Screen A — Overview `/`

Desktop composition:

- 240px sidebar.
- Top bar: organization, `SANDBOX` badge, provider health, notifications, profile.
- Hero exposure card: “Protected spend this month,” blocked amount, reviewed amount, and trend. No invented metrics; use real persisted values or `No data yet`.
- Four quick actions: Review Incident, Create Policy, Offboard Employee, Run Judge Journey.
- Active incidents list with merchant, owner, amount, reason, severity, status, and age.
- Spend pulse chart with 7D/30D/90D filters; hide chart and show empty state when data is absent.
- Recent audit activity.

Mobile composition:

- Compact greeting/environment row.
- Horizontally scrollable exposure cards.
- One prominent `Review next incident` CTA.
- Incident list, then activity.
- Five-position bottom navigation with a raised central Shield action only if it opens the next incident; it must not mimic Frentix's scan control.

### Screen B — Incident queue `/incidents`

- Filters: All, Needs review, Blocked, Approved, Failed.
- Search by merchant, employee, category, or incident ID.
- Rows/cards show severity, merchant, employee/agent, amount, trigger, provider state, and deadline.
- Selecting a row opens `/incidents/[id]`.
- Empty state: “No incidents need review.”
- Error state includes retry and correlation ID.

### Screen C — Incident decision workspace `/incidents/[id]`

This is the product's signature screen.

Desktop three-zone layout:

1. **Incident summary** — merchant, item, amount, employee/agent, budget, trigger, and requested time.
2. **Decision canvas** — policy verdict, explanation, rule/version, and available action.
3. **Evidence rail** — ordered Senso → Policy → Linq → Prava → Merchant → Audit timeline.

Primary CTA is state-dependent:

- `Run policy check`
- `Request approval in iMessage`
- `Continue with Prava`
- `Open merchant checkout`
- `View final audit record`

Never show multiple enabled primary actions simultaneously.

### Screen D — Senso evidence drawer

- Query text.
- Retrieval status and timestamp.
- Document title, content ID, supporting excerpt, and retrieval relevance.
- `No matching evidence` and `Provider unavailable` are distinct states.
- Relevance is the returned value; never hard-code it or label it confidence.
- Evidence links to the incident and policy decision ID.

### Screen E — Linq approval state

- Approver name/role and masked phone.
- Message state: dispatching, delivered, pending, approved, rejected, expired, failed.
- Instruction: “React 👍 to approve or 👎 to reject.”
- Countdown to expiry; no infinite spinner.
- Duplicate/wrong-approver/stale reactions appear only in audit details, not as success.
- Optional demo simulator must live behind `DEMO ONLY` and cannot satisfy the golden path.

### Screen F — Prava permission and checkout

- Show merchant, exact amount, currency, purpose, permission/session state, and expiry.
- Never display full PAN/CVV or provide fake credential artwork.
- Passkey state: unsupported, ready, awaiting, approved, cancelled, failed.
- Checkout state: ready, opening merchant, attempted, expected sandbox decline, completed if provider-derived, timeout, failed.
- Display redacted session/order/transaction references only.
- Final state must distinguish `Expected sandbox decline` from `Payment completed`.

### Screen G — Audit `/audit`

- Correlation-ID search.
- Filters by provider, status, employee, merchant, and date.
- Timeline rows show timestamp, actor/provider, event, result, and redacted reference.
- “Immutable” or “durable” labels require verified database persistence; otherwise say `Session activity`.
- Export produces redacted JSON/CSV only.

### Screen H — Spend inventory `/spend`

- Tabs: Subscriptions, Cloud & API, Employees, Agents.
- Subscription rows show owner, renewal, amount, card/permission state, last activity.
- Offboarding action previews affected subscriptions and requires confirmation.
- API spike detail compares current spend with the configured baseline; no invented AI risk score.

### Screen I — Subscription command center `/subscriptions`

This is the commercial center of VAPOR. It answers “what are we paying for, who owns it, and what happens next?”

- Filters: category, department, owner, status, renewal window, billing cadence, risk, and payment state.
- Default table fields: vendor, product/plan, category, owner, department, amount, cadence, next renewal, usage signal, auto-renew state, and risk.
- Saved views: Renewing in 30 days, No active owner, Offboarded owner, Unused/unknown usage, Price increased, Policy violation, and AI/API spend.
- Bulk actions require review: assign owner, request justification, schedule renewal review, propose cancellation, or change policy.
- “Cancel” is never shown as completed unless an official provider/vendor operation confirms it.
- Mobile converts rows into compact subscription cards with owner, amount, renewal, and next action.

### Screen J — Subscription detail `/subscriptions/[id]`

Header:

- Vendor and product name.
- Lifecycle status: trial, active, paused, cancellation pending, cancelled, expired, or unknown.
- Current recurring amount, cadence, next renewal, annualized committed spend, and payment control state.

Sections:

1. **Ownership** — employee UID, name, role, department, manager, cost center, business owner, and technical owner.
2. **Commercials** — plan, seats, unit price, currency, contract start/end, renewal date, notice period, auto-renew, and source of truth.
3. **Usage** — last activity, active seats, assigned seats, utilization, and evidence timestamp. Unknown usage stays unknown.
4. **Payment** — Prava permission/session reference, merchant descriptor, limit, policy, and recent outcomes; credentials remain hidden.
5. **Risk** — orphaned owner, offboarded owner, duplicate category, unusual increase, policy mismatch, and missing evidence.
6. **History** — created, owner changes, approvals, renewals, payments, policy decisions, and offboarding actions.

Primary action changes by state: Assign owner, Review renewal, Request justification, Adjust policy, Pause payment authority, or View merchant outcome.

### Screen K — Employee spend profile `/people/[employeeUid]`

Employee UID is an immutable internal UUID. Payroll ID, email, and provider IDs are external identifiers and must not become the primary key.

Header:

- Name, role, department, manager, employment status, start date, optional end date, cost center, and internal UID.
- Spend summary: monthly recurring spend, annualized commitment, active subscriptions, pending requests, cards/permissions, and unresolved incidents.

Sections:

- Owned subscriptions.
- Assigned licenses.
- Purchase requests and approvals.
- Payment permissions and outcomes.
- Policy exceptions.
- Last verified activity.
- Offboarding impact preview.

Employment status values: invited, active, leave, offboarding scheduled, offboarded, and archived.

### Screen L — Offboarding control room `/people/[employeeUid]/offboarding`

The UI creates an impact plan before taking action:

1. Identify subscriptions owned by the employee.
2. Separate business ownership from assigned seat/access.
3. Identify active payment permissions/cards.
4. Identify upcoming renewals and cancellation windows.
5. Assign transfer owners for business-critical tools.
6. Propose revoke, transfer, retain, or investigate per item.
7. Require human confirmation for destructive actions.
8. Record provider-confirmed outcomes and unresolved work.

Never treat employee termination as automatic subscription cancellation. Some tools must be transferred, retained for legal/data reasons, or investigated.

### Screen M — Category intelligence `/categories/[categoryId]`

- Category hierarchy, monthly/annualized spend, vendors, subscriptions, owners, departments, duplicates, and trend.
- Compare tools only when the underlying capability tags are known.
- Highlight category concentration and duplicate-tool opportunities without claiming savings until an action is confirmed.
- Show “unclassified” as a first-class queue; never force low-confidence categorization.

### Screen N — Renewal calendar `/renewals`

- Calendar/list toggle for renewals at 7, 30, 60, and 90 days.
- Each renewal exposes owner, notice deadline, amount, usage evidence, policy, and decision status.
- Workflow: evidence collection → owner justification → finance decision → payment-policy update → confirmed outcome.

## 6.1 Canonical category taxonomy

Use a two-level taxonomy with an optional confidence/source field:

```text
SaaS
  Productivity
  Collaboration
  Developer tools
  Design and creative
  Sales and CRM
  Marketing
  Finance and accounting
  HR and recruiting
  Security and identity
  Data and analytics
  Customer support
  Legal and compliance

Cloud infrastructure
  Compute
  Storage
  Database
  Networking
  Observability
  Security
  Data platform

AI
  Model API
  Agent platform
  Model hosting
  Vector database
  AI developer tooling
  AI productivity

Professional services
Hardware and devices
Travel and expenses
Other
Unclassified
```

Category records contain `category_id`, `parent_category_id`, `name`, `source`, `confidence`, `reviewed_by`, and `reviewed_at`. Rules and human review outrank AI suggestions.

## 6.2 Canonical commercial data model

The UI and backend share these durable objects:

- **Organization** — tenant, currency, timezone, policy defaults.
- **Employee** — internal UID, employment lifecycle, department, manager, and cost center.
- **Vendor** — canonical vendor identity plus observed merchant descriptors/domains.
- **Product** — vendor offering and capability tags.
- **Subscription** — recurring commercial relationship and lifecycle.
- **Subscription ownership** — business owner, technical owner, finance owner, and assigned users with effective dates.
- **Purchase intent** — requested merchant, item, amount, currency, purpose, and requester.
- **Policy decision** — deterministic verdict, rules, version, and reasons.
- **Approval** — approver, channel, correlation, expiry, and first valid outcome.
- **Payment authority** — Prava permission/session references and exact constraints.
- **Transaction** — provider-derived merchant outcome in integer minor units.
- **Risk signal** — observed condition, severity, source, timestamp, and resolution.
- **Audit event** — actor, action, object, correlation ID, redacted evidence, and persistence status.

Required subscription fields:

```text
subscription_id
organization_id
vendor_id
product_id
category_id
status
billing_cadence
amount_minor
currency
start_date
contract_end_date
next_renewal_date
cancellation_notice_date
auto_renew
seat_count
active_seat_count
business_owner_employee_uid
technical_owner_employee_uid
cost_center
department
payment_authority_reference
usage_evidence_at
source_system
created_at
updated_at
```

Amounts always use integer minor units plus ISO currency. Dates store UTC timestamps while the interface renders the organization's timezone.

## 6.3 Product lifecycle flows

### New purchase

`request → identity/ownership → category → Senso evidence → deterministic policy → Linq approval if needed → Prava authority → merchant outcome → subscription created or linked → audit`

### Recurring charge

`renewal approaching → owner and usage evidence → policy evaluation → allow/review/block → payment outcome → next renewal updated → audit`

### Spend anomaly

`provider/usage signal → baseline comparison → incident → owner investigation → policy action → payment control where officially supported → resolution → audit`

### Employee offboarding

`employment event → impact discovery → transfer/revoke/retain plan → human confirmation → supported provider actions → unresolved queue → audit`

### Orphaned subscription

`missing/inactive owner → manager/department lookup → temporary finance owner → justification request → transfer/cancel/investigate decision → audit`

## 6. Judge journey

Use a persistent seven-step progress rail:

1. Intent
2. Senso
3. Policy
4. Linq
5. Prava
6. Merchant
7. Audit

Golden scenario:

`Employee requests a high-value developer tool → Senso retrieves procurement policy → deterministic policy requires approval → finance approver reacts in Linq → Prava creates exact purchase authority → user completes Passkey → one-time credential is used at merchant → sandbox decline is recorded → redacted audit timeline closes the loop.`

Alternative scenarios:

- Rogue merchant: deterministic rejection; no Prava authority created.
- API spike: automatic block/freeze only if the official account contract supports the action; otherwise show escalation.
- Offboarded employee: identify linked spend and revoke only through supported provider operations.

## 7. State contract

Every asynchronous module implements:

- idle
- validating
- loading
- success
- empty
- unavailable
- timeout
- error
- retrying, only for retryable failures
- expired, where applicable
- disabled with reason

Each visible state must be backed by durable domain/provider state or explicitly labelled transient UI state.

## 8. Component architecture

Extract components before restyling monoliths:

```text
src/components/
  shell/AppShell.tsx
  shell/Sidebar.tsx
  shell/MobileNav.tsx
  shell/TopBar.tsx
  ui/Button.tsx
  ui/Card.tsx
  ui/Badge.tsx
  ui/Amount.tsx
  ui/EmptyState.tsx
  ui/ProviderStatus.tsx
  incidents/IncidentCard.tsx
  incidents/IncidentSummary.tsx
  incidents/DecisionPanel.tsx
  evidence/EvidenceRail.tsx
  evidence/SensoEvidence.tsx
  evidence/LinqApproval.tsx
  evidence/PravaPermission.tsx
  evidence/MerchantOutcome.tsx
  audit/AuditTimeline.tsx
  subscriptions/SubscriptionTable.tsx
  subscriptions/SubscriptionSummary.tsx
  subscriptions/RenewalPanel.tsx
  people/EmployeeSpendProfile.tsx
  people/OffboardingImpact.tsx
  categories/CategoryBreakdown.tsx
```

- Prefer server components for read-only data.
- Provider secrets and adapters stay server-side behind route handlers/server actions.
- Client components own interaction only, never provider credentials.
- Use semantic HTML before ARIA.
- Use an icon library consistently; no emoji as production icons.

## 9. Copy system

Tone: concise, calm, factual, and financially literate.

Preferred:

- “Approval required”
- “Blocked by merchant-category policy”
- “Senso evidence unavailable”
- “Waiting for the assigned approver”
- “Expected sandbox decline recorded”
- “No durable audit record yet”
- “No active owner assigned”
- “Renewal decision due in 12 days”
- “Usage evidence is unavailable”
- “Transfer ownership before offboarding”

Forbidden without evidence:

- “Bank-grade”
- “100% secure”
- “Guaranteed”
- “Sub-50ms”
- “AI verified”
- “Immutable”
- “Live” when the state is mocked, cached, unavailable, or locally simulated

## 10. Responsive and accessibility contract

- Breakpoints: 480, 768, 1024, 1280px.
- No horizontal viewport overflow at 320px.
- Tables transform into labelled cards below 768px.
- Evidence rail becomes a vertical accordion on mobile.
- Minimum target size 44×44px.
- WCAG AA contrast for all text and controls.
- Full keyboard path through incident resolution.
- Visible focus ring on every interactive element.
- Status announcements use an `aria-live` region without repeatedly announcing polling.
- Charts include textual summaries and are never the sole source of information.

## 11. Implementation phases

### Phase 0 — Truth and contract discovery

Read before editing:

- `docs/EVIDENCE/CONTRACT_MANIFEST.md`
- `plans/07-vapor-master-execution-system.md`
- `orchestration/state.json`
- current provider adapters and route handlers

Verify:

- List allowed provider calls and exact response fields used by UI.
- Identify every current simulated/hard-coded UI state.
- Record baseline screenshots and E2E behavior.

Guard:

- Do not invent provider endpoints or treat old evidence manifests as current runtime proof.

### Phase 1 — Foundations

Implement tokens, local fonts, primitives, AppShell, responsive navigation, focus, reduced motion, and semantic status mapping.

Verify:

- Token grep shows no new raw component hex values.
- Primitive unit tests pass.
- 320/768/1280/1440 screenshots have no overflow.

Guard:

- Do not add a heavy UI framework or animation library.

### Phase 2 — Overview and incident IA

Build Overview, Incident queue, and Incident workspace using existing domain data. Preserve old routes temporarily through redirects or compatibility links.

Verify:

- A first-time user can reach the next incident in one action.
- Empty/error/loading states are testable.
- No invented dashboard values.

### Phase 3 — Evidence rail and provider boundaries

Move provider execution behind server-only boundaries. Bind Senso, Linq, Prava, merchant, and audit components to truthful states.

Verify:

- Client bundle contains no provider secret names/values.
- Missing credentials produce `UNAVAILABLE`, never synthetic success.
- Senso displays returned relevance/content ID.
- Linq approval correlates correct approver/message/expiry.
- Prava displays only redacted provider references.

Guard:

- No fake provider IDs, timers that transition to success, or local buttons satisfying the golden path.

### Phase 4 — Spend, cards, and audit

Build subscriptions, employee spend profiles, category intelligence, renewal workflow, safe card/permission state, offboarding control room, and redacted audit search/export.

Verify:

- Destructive actions require review/confirmation.
- Subscription ownership has effective dates and preserves history.
- Employee offboarding distinguishes ownership transfer, access revocation, payment control, and cancellation.
- Category AI suggestions remain reviewable and expose their source/confidence.
- Audit persistence labels match actual storage.
- Exports pass secret/PAN/CVV scans.

### Phase 5 — Judge mode

Create a deterministic navigation layer around real provider states, seeded only with non-sensitive scenario input. Add a presenter-friendly progress rail and recovery guidance.

Verify:

- Golden path can be demonstrated without developer tools.
- Provider outage remains understandable and truthful.
- Demo-only controls cannot be confused with live evidence.

### Phase 6 — Release verification

Run lint, strict TypeScript, unit/integration tests, production build, browser E2E, accessibility scan, responsive screenshots, secret scan, and public deployment smoke tests.

Verify:

- Core flow at desktop and mobile.
- Keyboard-only flow.
- No console errors.
- No secrets/provider credentials in source, client bundle, logs, screenshots, or artifacts.
- Every marketing/provider claim maps to evidence.

## 12. Antigravity execution prompt

```text
Implement the authoritative VAPOR UI/UX redesign from plans/08-vapor-ui-ux-blueprint.md.

First read the complete blueprint, docs/EVIDENCE/CONTRACT_MANIFEST.md, plans/07-vapor-master-execution-system.md, orchestration/state.json, and the existing UI/provider files cited by the blueprint.

This is an original VAPOR design inspired only by Frentix's high-level hierarchy and dark-fintech confidence. Do not copy Frentix assets, exact colors, gradients, geometry, navigation, copy, charts, illustrations, sample data, or pixel layouts.

Execute Phases 0–6 in order. Use appropriate installed skills for frontend engineering, accessibility, provider-contract verification, security, Playwright, and deployment. Use bounded parallel subagents only for disjoint worksets. Keep provider contracts and secrets server-side. Preserve existing user changes and do not commit .env or .env.local.

Hard requirements:
- one coherent spend-incident journey
- responsive desktop and mobile UI
- truthful LIVE/SANDBOX/PENDING/UNAVAILABLE/ERROR/DEMO states
- no fake provider IDs, evidence, relevance, approvals, cards, checkout results, metrics, or audit durability
- no exposed PAN/CVV/OTP/passkey/secrets
- loading, empty, error, timeout, expired, success, focus, and disabled states
- WCAG AA and keyboard usability
- tests, build, public deployment, and screenshot evidence

Do not invoke /goal, generate a giant node graph, loop on audits, rewrite unrelated backend architecture, or claim completion from mocked tests.

At each phase: inspect documentation, implement only that phase, run its verification, fix failures, then continue. A blocked provider stops only its dependent live-evidence gate; complete all independent UI work and report the exact missing input.

Final output must include changed files, screenshots, test/build results, public URL, real provider evidence classifications, remaining human actions, and known limitations. Emit READY_FOR_HUMAN_SANDBOX_E2E only when the UI and independent release gates pass; never emit production-ready or 100% complete without external evidence.
```

## 13. Acceptance criteria

The redesign passes when:

1. A new judge explains VAPOR's value and next action after viewing Overview for ten seconds.
2. One incident moves through all seven visible stages without deceptive state changes.
3. Every partner contribution is obvious and materially useful.
4. Missing providers produce an honest, recoverable experience.
5. Desktop and mobile layouts preserve task priority.
6. Keyboard, contrast, focus, reduced motion, and semantic states pass.
7. No copyrighted Frentix expression has been copied.
8. The deployed app and demo video show the same behavior.
