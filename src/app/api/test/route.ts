import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API routes are working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || 'none',
  });
}
