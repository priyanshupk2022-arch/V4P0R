# VAPOR Hackathon Scope & Frozen Scenarios

Date: 2026-08-02  
Target: Controlled Sandbox Product Submission  

## 1. Frozen Product Definition
**VAPOR** is a message-native agentic procurement and spend-governance product for startups and small finance teams. iMessage (via Linq) is the primary purchase request and approval experience; the web application serves as the immutable audit, policy evidence, and transaction status surface.

## 2. Primary Demo Scenario (Golden Path)
* **User / Requester:** Alex (DevOps Lead at Acme Corp)
* **Purchase Intent:** OpenAI API Credits
* **Amount / Currency:** `$500.00` (50,000 Integer Cents / USD)
* **Merchant & MCC:** OpenAI Inc (`MCC 5734` - Computer Software Stores)
* **Flow:**
  1. Alex texts purchase intent via Linq iMessage number.
  2. VAPOR evaluates budget ($50,000 limit) and policy (MCC 5734 allowed).
  3. Senso RAG supplies merchant trust evidence (SOC2 certified, verified vendor).
  4. Amount exceeds $100 auto-threshold $\rightarrow$ Escalates to CFO via Linq iMessage with native 👍 Tapback request.
  5. CFO reacts with **👍 (Thumbs Up)**.
  6. VAPOR executes Prava Sandbox Checkout (`POST /v1/sessions` $\rightarrow$ payment result polling $\rightarrow$ report status).
  7. Outcome displayed in iMessage & persisted in redacted audit trail on web dashboard.

## 3. Backup Demo Scenario
* **User / Requester:** Sarah (Frontend Engineer)
* **Purchase Intent:** AWS Cloud Compute Subscription
* **Amount / Currency:** `$150.00` (15,000 Integer Cents / USD)
* **Merchant & MCC:** Amazon Web Services (`MCC 5734`)
* **Flow:** Direct low-risk policy auto-approval under $200 threshold $\rightarrow$ instant Prava Checkout session completion.
