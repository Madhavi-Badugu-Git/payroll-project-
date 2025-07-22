import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  // Test the actual NextAuth providers endpoint
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const providersUrl = `${baseUrl}/api/auth/providers`;

    const response = await fetch(providersUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = response.ok ? await response.json() : await response.text();

    return NextResponse.json({
      test: 'NextAuth connectivity test',
      providersUrl,
      responseStatus: response.status,
      responseOk: response.ok,
      contentType: response.headers.get('content-type'),
      data: data,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
        basePath: process.env.NEXT_PUBLIC_BASE_PATH,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        test: 'NextAuth connectivity test',
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: {
          nodeEnv: process.env.NODE_ENV,
          nextAuthUrl: process.env.NEXTAUTH_URL,
          nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
          basePath: process.env.NEXT_PUBLIC_BASE_PATH,
        },
      },
      { status: 500 }
    );
  }
}
