import { NextResponse } from 'next/server';

export async function GET() {
  const sensoConfigured = Boolean(process.env.SENSO_API_KEY);
  const linqConfigured = Boolean(process.env.LINQ_API_KEY && process.env.LINQ_WEBHOOK_SECRET);
  const pravaConfigured = Boolean(process.env.PRAVA_API_KEY && process.env.PRAVA_WEBHOOK_SECRET);
  const dbConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

  return NextResponse.json({
    status: 'ok',
    system: 'VAPOR Backend Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    readiness: {
      senso: sensoConfigured ? 'READY' : 'UNCONFIGURED',
      linq: linqConfigured ? 'READY' : 'UNCONFIGURED',
      prava: pravaConfigured ? 'READY' : 'UNCONFIGURED',
      database: dbConfigured ? 'READY' : 'UNCONFIGURED',
    },
  });
}
