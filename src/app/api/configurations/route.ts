import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch all configurations
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configurations = await prisma.configuration.findMany({
      orderBy: {
        configKey: 'asc',
      },
    });

    return NextResponse.json({ configurations });
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return NextResponse.json({ error: 'Failed to fetch configurations' }, { status: 500 });
  }
}

// POST - Create a new configuration
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { configKey, configValue, description } = body;

    // Validate required fields
    if (!configKey || !configValue) {
      return NextResponse.json(
        { error: 'Configuration key and value are required' },
        { status: 400 }
      );
    }

    // Check if configuration key already exists
    const existingConfig = await prisma.configuration.findUnique({
      where: { configKey },
    });

    if (existingConfig) {
      return NextResponse.json({ error: 'Configuration key already exists' }, { status: 409 });
    }

    const configuration = await prisma.configuration.create({
      data: {
        configKey: configKey.trim().toUpperCase(),
        configValue: configValue.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ configuration }, { status: 201 });
  } catch (error) {
    console.error('Error creating configuration:', error);
    return NextResponse.json({ error: 'Failed to create configuration' }, { status: 500 });
  }
}
