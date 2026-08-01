import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: "ok",
    system: "VAPOR Backend Engine",
    version: "1.0.0"
  });
}
