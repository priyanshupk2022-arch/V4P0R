import { NextResponse } from 'next/server';

export type ProviderStatusType = 'LIVE' | 'SANDBOX' | 'PENDING' | 'UNAVAILABLE' | 'ERROR' | 'DEMO';

function evaluateProviderStatus(params: {
  apiKey?: string;
  secretKey?: string;
  hasVerifiedLiveEvidence?: boolean;
  hasVerifiedSandboxEvidence?: boolean;
  hasVerificationError?: boolean;
}): ProviderStatusType {
  const { apiKey, secretKey, hasVerifiedLiveEvidence, hasVerifiedSandboxEvidence, hasVerificationError } = params;
  
  const hasCredentials = Boolean(apiKey && (secretKey === undefined || Boolean(secretKey)));
  
  if (hasVerificationError) {
    return 'ERROR';
  }
  
  if (!hasCredentials) {
    return 'DEMO';
  }

  if (hasVerifiedLiveEvidence) {
    return 'LIVE';
  }
  
  if (hasVerifiedSandboxEvidence) {
    return 'SANDBOX';
  }

  return 'PENDING';
}

export async function GET() {
  const sensoApiKey = process.env.SENSO_API_KEY;
  const linqApiKey = process.env.LINQ_API_KEY;
  const linqSecret = process.env.LINQ_WEBHOOK_SECRET;
  const pravaApiKey = process.env.PRAVA_API_KEY;
  const pravaSecret = process.env.PRAVA_WEBHOOK_SECRET;

  const sensoStatus = evaluateProviderStatus({
    apiKey: sensoApiKey,
    hasVerifiedLiveEvidence: Boolean(process.env.SENSO_LIVE_EVIDENCE_TIMESTAMP),
    hasVerifiedSandboxEvidence: Boolean(process.env.SENSO_SANDBOX_EVIDENCE_TIMESTAMP)
  });

  const linqStatus = evaluateProviderStatus({
    apiKey: linqApiKey,
    secretKey: linqSecret,
    hasVerifiedLiveEvidence: Boolean(process.env.LINQ_LIVE_EVIDENCE_TIMESTAMP),
    hasVerifiedSandboxEvidence: Boolean(process.env.LINQ_SANDBOX_EVIDENCE_TIMESTAMP)
  });

  const pravaStatus = evaluateProviderStatus({
    apiKey: pravaApiKey,
    secretKey: pravaSecret,
    hasVerifiedLiveEvidence: Boolean(process.env.PRAVA_LIVE_EVIDENCE_TIMESTAMP),
    hasVerifiedSandboxEvidence: Boolean(process.env.PRAVA_SANDBOX_EVIDENCE_TIMESTAMP)
  });

  const dbConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

  return NextResponse.json({
    status: 'ok',
    system: 'VAPOR Backend Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    providers: {
      senso: sensoStatus,
      linq: linqStatus,
      prava: pravaStatus,
    },
    readiness: {
      senso: sensoStatus,
      linq: linqStatus,
      prava: pravaStatus,
      database: dbConfigured ? 'READY' : 'DEMO',
    },
    verificationTimestamps: {
      senso: process.env.SENSO_LIVE_EVIDENCE_TIMESTAMP || process.env.SENSO_SANDBOX_EVIDENCE_TIMESTAMP || null,
      linq: process.env.LINQ_LIVE_EVIDENCE_TIMESTAMP || process.env.LINQ_SANDBOX_EVIDENCE_TIMESTAMP || null,
      prava: process.env.PRAVA_LIVE_EVIDENCE_TIMESTAMP || process.env.PRAVA_SANDBOX_EVIDENCE_TIMESTAMP || null,
    }
  });
}
