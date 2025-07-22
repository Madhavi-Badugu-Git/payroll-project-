import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'NextAuth diagnostic',
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'set' : 'not set',
    nodeEnv: process.env.NODE_ENV,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || 'none',
    timestamp: new Date().toISOString(),
  });
}
