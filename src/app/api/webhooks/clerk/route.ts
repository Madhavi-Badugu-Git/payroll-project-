import { NextRequest, NextResponse } from 'next/server';

// This webhook is no longer needed as we've migrated from Clerk to NextAuth
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { message: 'Clerk webhook deprecated - using NextAuth now' },
    { status: 410 }
  );
}
