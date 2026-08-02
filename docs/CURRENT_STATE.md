# VAPOR Current State Classification

> Historical N0 snapshot at commit `af31250`, not current execution truth. G00 in the generated master graph must reclassify the present working tree before implementation credit is assigned.

Date: 2026-08-02  
Commit: `af31250`  

## Feature Classification Table

| Feature / Component | Status | Description / Reality |
| :--- | :---: | :--- |
| **Cents Math Utility (`centsMath.ts`)** | **REAL** | Integer minor units BigInt parser & formatter with exact decimal splitting. Fully unit tested. |
| **Transaction State Machine (`stateMachine.ts`)** | **REAL** | Deterministic transition function for INITIATED, AUTHORIZED, SETTLED, DECLINED, REVERSED, EXPIRED. |
| **Policy Evaluator (`evaluator.ts`)** | **REAL** | Rule engine matching single-tx limits, monthly budgets, allowed MCCs, and merchant strings with NFKD normalization. |
| **HMAC & Replay Validator (`hmacValidator.ts`)** | **REAL** | Constant-time SHA-256 HMAC signature verification and 300s timestamp windowing. |
| **Prava Create Session Adapter (`createSession.ts`)** | **PARTIAL** | Valid request payload generation for `POST /v1/sessions` against Prava Sandbox, with local sandbox fallback. |
| **Prava Card / Lock Adapters** | **MOCK/STATIC** | Card creation and lock endpoints operate with static mock data when offline sandbox is unreached. |
| **Linq Webhook Route (`/api/webhook/linq`)** | **PARTIAL** | Verifies signature & timestamp tolerance; returns state transition, but lacks native Tapback mapping. |
| **Double-Entry Ledger Persistence (`supabaseClient.ts`)** | **PARTIAL** | In-memory balance check and Supabase table insert fallback with 1500ms timeout. |
| **Database Migrations (`001_initial_schema.sql`, `002_sandbox_pilot_schema.sql`)** | **PARTIAL** | Full DDL schema with RLS and multi-tenant `organization_id` defined; requires live DB deployment verification. |
| **Auth & RBAC Domain (`rbac.ts`, `authMiddleware.ts`)** | **PARTIAL** | Header-extracted tenant context and role checker (`OWNER`, `FINANCE_ADMIN`, `APPROVER`, `EMPLOYEE`, `AUDITOR`). |
| **Senso RAG Merchant Evidence Integration** | **ABSENT** | Senso RAG merchant trust search API endpoint integration is not yet connected to decision flow. |
| **Linq Native iMessage Tapbacks** | **ABSENT** | Native 👍/👎 iMessage Tapback reaction mapping to approval state machine is not yet connected. |
| **Browser E2E Flow & Judge Dashboard UI** | **ABSENT** | End-to-end judge-facing message & checkout simulator UI pages are not yet built. |
| **Production PCI-DSS & Bank Compliance** | **UNSUPPORTED** | Real-money card issuing, PCI-DSS v4.0.1 certification, and live banking rails are out of hackathon scope. |
