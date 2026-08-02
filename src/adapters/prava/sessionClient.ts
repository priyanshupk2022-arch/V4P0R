import { env } from '../../lib/config';

export interface PravaMerchantDetails {
  name: string;
  url: string;
  country_code_iso2: string;
  category_code?: string;
  category?: string;
}

export interface PravaProductDetail {
  description: string;
  unit_price: string; // e.g. "24.99"
  product_id?: string;
  quantity?: number;
}

export interface PravaPurchaseContext {
  merchant_details: PravaMerchantDetails;
  product_details: PravaProductDetail[];
  effective_until_minutes?: number;
}

export interface CreatePravaSessionRequest {
  user_id: string;
  user_email: string;
  total_amount: string; // e.g. "49.99"
  currency: string; // ISO e.g. "USD"
  purchase_context: PravaPurchaseContext[];
  integration_type?: 'full_checkout' | 'embedding';
  callback_url?: string;
}

export interface CreatePravaSessionResponse {
  session_id: string;
  session_token: string;
  iframe_url: string;
  order_id: string;
  expires_at: string;
  authorizeOnly?: boolean;
}

export interface PravaLineItemResult {
  txn_ref_id: string;
  merchant_name?: string | null;
  merchant_url?: string | null;
  total_amount: string;
  status: string;
  token?: string | null;
  dynamic_cvv?: string | null;
  expiry_month?: string | null;
  expiry_year?: string | null;
}

export interface PravaTransactionResult {
  txn_id: string;
  status: 'pending' | 'awaiting_result' | 'completed' | 'failed';
  line_items: PravaLineItemResult[];
  error?: { code: string; message: string };
}

export interface GetPaymentResultResponse {
  session_id: string;
  order_id: string | null;
  status: 'pending' | 'awaiting_result' | 'completed' | 'failed';
  transactions: PravaTransactionResult[];
}

export interface ReportStatusRequest {
  txn_ref_id: string;
  txn_status: 'APPROVED' | 'DECLINED';
  authorization_code?: string;
  response_code?: string;
  amount_paid?: string;
}

export interface ReportStatusResponse {
  status: 'confirmed';
  txn_ref_id: string;
  txn_status: 'APPROVED' | 'DECLINED';
  visa_confirmation: 'SUCCESS' | 'FAILURE';
}

function getSecretKey(): string {
  const key = process.env.PRAVA_SECRET_KEY || env.PRAVA_API_KEY;
  if (!key || key.startsWith('mock-')) {
    throw new Error('Prava credentials are not configured');
  }
  return key;
}

/**
 * Creates a short-lived Prava payment session (POST /v1/sessions)
 */
export async function createPravaSession(
  req: CreatePravaSessionRequest
): Promise<CreatePravaSessionResponse> {
  const endpoint = `${env.PRAVA_BASE_URL}/v1/sessions`;
  const secretKey = getSecretKey();

  const payload = {
    user_id: req.user_id,
    user_email: req.user_email,
    total_amount: req.total_amount,
    currency: req.currency || 'USD',
    purchase_context: req.purchase_context,
    integration_type: req.integration_type || 'full_checkout',
    ...(req.callback_url ? { callback_url: req.callback_url } : {}),
  };

  const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`Prava session creation failed with HTTP ${res.status}`);
  }

  const data = await res.json();
  if (
      typeof data.session_id !== 'string' ||
      typeof data.session_token !== 'string' ||
      typeof data.iframe_url !== 'string' ||
      typeof data.order_id !== 'string' ||
      typeof data.expires_at !== 'string'
  ) {
    throw new Error('Prava session response did not match the selected contract');
  }

  return {
    session_id: data.session_id,
    session_token: data.session_token,
    iframe_url: data.iframe_url,
    order_id: data.order_id,
    expires_at: data.expires_at,
    authorizeOnly: data.authorizeOnly === true,
  };
}

/**
 * Polls payment result for a Prava session (GET /v1/sessions/{sessionId}/payment-result)
 */
export async function getPravaPaymentResult(sessionId: string): Promise<GetPaymentResultResponse> {
  const endpoint = `${env.PRAVA_BASE_URL}/v1/sessions/${sessionId}/payment-result`;
  const secretKey = getSecretKey();

  const res = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
      signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`Prava payment-result request failed with HTTP ${res.status}`);
  }
  return await res.json();
}

/**
 * Reports payment execution outcome to Prava (POST /v1/sessions/{sessionId}/report-status)
 */
export async function reportPravaStatus(
  sessionId: string,
  req: ReportStatusRequest
): Promise<ReportStatusResponse> {
  const endpoint = `${env.PRAVA_BASE_URL}/v1/sessions/${sessionId}/report-status`;
  const secretKey = getSecretKey();

  const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`Prava report-status request failed with HTTP ${res.status}`);
  }
  return await res.json();
}
