# VAPOR Provider Contract Manifest

Date: 2026-08-02
Author: Antigravity Parent Orchestrator

## 1. Authority Precedence
1. Provider live documentation (https://docs.prava.space, https://docs.linqapp.com, https://docs.senso.ai)
2. Live endpoint verification & probe responses
3. Internal VAPOR repository code (candidates only, re-verified against official docs)

---

## 2. Prava Payments Contract

- **Documentation**: https://docs.prava.space (Fetched 2026-08-02 via /llms.txt and OpenAPI spec)
- **Selected Flow**: **Session Path** (`POST /v1/sessions` -> `GET /v1/sessions/{id}/payment-result` -> merchant checkout -> `POST /v1/sessions/{id}/report-status`)
- **Base URL**:
  - Sandbox: `https://sandbox.api.prava.space`
  - Production: `https://api.prava.space`
- **Authentication**: `Authorization: Bearer <sk_test_...>` (Secret Key)

### Endpoint 1: Create Session
- **Method & Path**: `POST /v1/sessions`
- **Request Fields**:
  - `user_id`: string (required)
  - `user_email`: string (required)
  - `total_amount`: string e.g. `"49.99"` (required)
  - `currency`: ISO 4217 code e.g. `"USD"` (required)
  - `purchase_context`: array of 1 object with `merchant_details` (`name`, `url`, `country_code_iso2`) and `product_details` array (`description`, `unit_price`, `quantity`)
  - `integration_type`: `"full_checkout"` | `"embedding"`
  - `callback_url`: string (optional, https)
- **Response Fields (201 Created)**:
  - `session_id`: string
  - `session_token`: string
  - `iframe_url`: string
  - `order_id`: string
  - `expires_at`: ISO datetime string

### Endpoint 2: Get Payment Result
- **Method & Path**: `GET /v1/sessions/{sessionId}/payment-result`
- **Response Fields (200 OK)**:
  - `session_id`: string
  - `order_id`: string | null
  - `status`: `"pending"` | `"awaiting_result"` | `"completed"` | `"failed"`
  - `transactions`: array of transaction objects containing `line_items` array (`txn_ref_id`, `token`, `dynamic_cvv`, `expiry_month`, `expiry_year`, `status`)

### Endpoint 3: Report Status
- **Method & Path**: `POST /v1/sessions/{sessionId}/report-status`
- **Request Fields**:
  - `txn_ref_id`: string (from line_items)
  - `txn_status`: `"APPROVED"` | `"DECLINED"`
  - `authorization_code`: string (optional)
  - `response_code`: string (optional, e.g. `"00"`)
- **Response Fields (200 OK)**:
  - `status`: `"confirmed"`
  - `txn_ref_id`: string
  - `txn_status`: `"APPROVED"` | `"DECLINED"`
  - `visa_confirmation`: `"SUCCESS"` | `"FAILURE"`

### Security & Redaction Invariants
- Never log, commit, screenshot, or store unredacted token / PAN / CVV / secret key data.
- Transient single-use card credentials are read only for automated checkout and immediately discarded.

---

## 3. Linq Contract

- **Documentation**: https://docs.linqapp.com
- **Base URL**: `https://api.linqapp.com/api/partner/v3`
- **Authentication**: `Authorization: Bearer <LINQ_API_KEY>`
- **Messaging Endpoint**: `POST /v3/messages` with `message.to`, `message.body`, and `message.idempotency_key`.
- **Webhook Security**: Standard Webhooks headers `webhook-id`, `webhook-timestamp`, `webhook-signature`. Verified using webhook secret.
- **Approval Mapping**: `like` -> `APPROVE`, `dislike` -> `REJECT`.

---

## 4. Senso Contract

- **Documentation**: https://docs.senso.ai
- **Base URL**: `https://apiv2.senso.ai/api/v1`
- **Authentication**: `X-API-Key: <SENSO_API_KEY>`
- **Search Endpoint**: `POST /org/search` with `{ "query": string, "max_results": number }`.
- **Live Response Format**: `{ "query": string, "answer": string, "results": [...], "total_results": number }`.
