import { authOptions } from '@/lib/auth/config';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

// TODO: Refactor this route to work with NextAuth instead of Clerk
export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(
    { error: 'Leave functionality temporarily unavailable during authentication migration' },
    { status: 503 }
  );
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(
    { error: 'Leave functionality temporarily unavailable during authentication migration' },
    { status: 503 }
  );
}
