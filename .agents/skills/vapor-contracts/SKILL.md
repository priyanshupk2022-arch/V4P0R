---
name: vapor-contracts
description: Resolve and enforce the exact account-enabled Prava, Linq, and Senso contracts for VAPOR. Use before implementing or reviewing partner SDK/API calls, webhooks, browser checkout, credentials, or provider evidence.
---

# VAPOR Partner Contracts

## Contract precedence

Use this order of authority:

1. Written hackathon-team/account-specific guidance supplied by the user.
2. Current provider documentation and installed SDK types/version.
3. A provider response captured from the configured account.
4. Repository code only as an implementation candidate, never as contract truth.

When sources conflict, stop that integration, record the conflict, and select one account-enabled contract. Never combine fields, endpoints, headers, or states from two Prava flows.

## Prava success contract

The hackathon sandbox proof is:

`product decision -> exact purchase approval/mandate -> one-time card -> end-merchant checkout attempt -> expected sandbox decline`

Session or intent creation alone is not complete. Production-access evidence requires the full sequence.

### Current SDK intent path

Use when the configured Prava SDK/account exposes it:

1. Select/enroll a card through documented SDK UI.
2. Call `registerIntent()` for the exact merchant, amount, currency, item count, use limit, and expiry.
3. Complete the Passkey approval.
4. Call `invokeIntent()` with the returned intent ID and matching merchant/amount.
5. Pass the returned one-time PAN/expiry/CVV directly to the isolated checkout automation process.
6. Attempt checkout and persist only the redacted outcome and safe provider identifiers.

Authoritative starting points:

- https://docs.prava.space/
- https://docs.prava.space/sdk/intents/invoke
- https://docs.prava.space/sdk/cards/list-cards
- https://docs.prava.space/authentication

### Session path

Use only if the account-specific docs/credentials expose `POST /v1/sessions`, payment-result polling, and report-status. Capture the exact live request/response schema before implementation. Do not assume old `id`, `client_secret`, `checkout_url`, bearer-header, callback, or webhook shapes.

### Prava security

- Never write, log, persist, commit, screenshot, trace, or return one-time PAN/CVV, session tokens, Passkey data, API keys, or scoped payment credentials.
- Keep credentials in memory for the narrow checkout operation and then discard them.
- Do not retry a single-use credential blindly. Follow documented use-limit and intent/session behavior.
- The sandbox merchant decline is expected evidence, not an application error to convert into success.

## Linq contract

- Base: `https://api.linqapp.com/api/partner/v3`.
- Send through `POST /v3/messages` with `message.idempotency_key`; store returned chat/message IDs.
- Verify the raw request using official Standard Webhooks headers: `webhook-id`, `webhook-timestamp`, `webhook-signature`.
- Reject stale and duplicate events durably.
- For `reaction.added`, map only `like -> APPROVE` and `dislike -> REJECT`.
- Require matching pending message ID, assigned approver phone, non-expired request, and first-valid-decision semantics.
- Use the subscription signing secret, never the API key, for webhook verification.

References:

- https://docs.linqapp.com/api/resources/messages/methods/create/
- https://docs.linqapp.com/guides/webhooks/
- https://docs.linqapp.com/guides/webhooks/events/

## Senso contract

- Base: `https://apiv2.senso.ai/api/v1`.
- Authenticate using `X-API-Key`.
- Query with `POST /org/search` and `max_results`.
- Persist safe evidence fields: query, `content_id`, title, supporting `chunk_text`, relevance score, policy version, and resulting deterministic decision.
- Treat relevance score as retrieval relevance, not fraud probability.
- Missing/unavailable evidence must escalate or report unavailable; never fabricate verification.

References:

- https://docs.senso.ai/docs/authentication
- https://docs.senso.ai/docs/knowledge-base
- https://docs.senso.ai/docs/help-center-crawler

## Contract evidence gate

Before implementation, write a redacted contract manifest containing provider, docs URL/version/date, SDK/package version, selected flow, observed safe request/response fields, terminal states, retry/idempotency rules, and unknowns. A reviewer must reject any API call that lacks this source mapping.
