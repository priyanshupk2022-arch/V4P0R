---
name: vapor-contracts
description: Exact documented API contracts, schemas, headers, and authentication parameters for Prava, Linq, and Senso integrations. Use when implementing or verifying partner API calls and webhook routers.
---

# VAPOR Partner Contracts & API Schemas

## 1. Prava API Contract (Public Documented Flow)

* **Sandbox Base URL:** `https://sandbox.api.prava.space`
* **Authentication Header:** `Authorization: Bearer sk_test_*`
* **Core Session Lifecycle:**
  1. `POST /v1/sessions` — Create Prava checkout session.
     ```json
     {
       "user_id": "string",
       "user_email": "string",
       "total_amount": "string",
       "currency": "USD",
       "purchase_context": [{
         "merchant_details": { "name": "string", "url": "string", "country_code_iso2": "US" },
         "product_details": [{ "description": "string", "unit_price": "string", "quantity": 1 }]
       }],
       "integration_type": "full_checkout",
       "callback_url": "string"
     }
     ```
  2. `GET /v1/sessions/{sessionId}/payment-result` — Poll payment result until final state.
  3. `POST /v1/sessions/{sessionId}/report-status` — Report outcome (`completed` | `failed`).

## 2. Linq API & Webhook Contract

* **Base URL:** `https://api.linqapp.com/api/partner/v3`
* **Authentication Header:** `Authorization: Bearer sk_linq_*`
* **Send Message:** `POST /v3/messages` with `message.idempotency_key`.
* **Webhook Verification:**
  - Mandatory headers: `webhook-id`, `webhook-timestamp`, `webhook-signature`.
  - Signature scheme: SHA-256 HMAC over `{webhook-id}.{webhook-timestamp}.{raw-body}`.
* **Native Tapback Reactions:**
  - Event type: `reaction.added`
  - Action mapping: `like` $\rightarrow$ `APPROVE`, `dislike` $\rightarrow$ `REJECT`.

## 3. Senso Knowledge-Base & Search Contract

* **Base URL:** `https://apiv2.senso.ai/api/v1`
* **Authentication Header:** `X-API-Key: senso_key_*`
* **Merchant Evidence Search:** `POST /org/search`
  ```json
  {
    "query": "OpenAI security and vendor compliance",
    "max_results": 3
  }
  ```
* **Response Schema:** Attributable `content_id`, `title`, `chunk_text`, and relevance `score`.
