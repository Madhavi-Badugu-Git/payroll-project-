import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch a specific configuration
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const configuration = await prisma.configuration.findUnique({
      where: { id },
    });

    if (!configuration) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    return NextResponse.json({ configuration });
  } catch (error) {
    console.error('Error fetching configuration:', error);
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 });
  }
}

// PUT - Update a configuration
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { configKey, configValue, description } = body;
    const { id } = await params;

    // Validate required fields
    if (!configKey || !configValue) {
      return NextResponse.json(
        { error: 'Configuration key and value are required' },
        { status: 400 }
      );
    }

    // Check if configuration exists
    const existingConfig = await prisma.configuration.findUnique({
      where: { id },
    });

    if (!existingConfig) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    // Check if updating configKey conflicts with another record
    if (configKey !== existingConfig.configKey) {
      const conflictingConfig = await prisma.configuration.findUnique({
        where: { configKey },
      });

      if (conflictingConfig) {
        return NextResponse.json({ error: 'Configuration key already exists' }, { status: 409 });
      }
    }

    const configuration = await prisma.configuration.update({
      where: { id },
      data: {
        configKey: configKey.trim().toUpperCase(),
        configValue: configValue.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ configuration });
  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
  }
}

// DELETE - Delete a configuration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if configuration exists
    const existingConfig = await prisma.configuration.findUnique({
      where: { id },
    });

    if (!existingConfig) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    await prisma.configuration.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return NextResponse.json({ error: 'Failed to delete configuration' }, { status: 500 });
  }
}
