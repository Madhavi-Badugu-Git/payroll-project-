import { PrismaClient } from '@/generated/prisma';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    let databaseStatus = 'connected';
    let databaseLatency = 0;

    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      databaseLatency = Date.now() - start;
    } catch (dbError) {
      databaseStatus = 'disconnected';
      console.error('Database health check failed:', dbError);
    }

    const healthData = {
      status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      },
      database: {
        status: databaseStatus,
        latency: databaseLatency,
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid,
      },
    };

    const statusCode = healthData.status === 'healthy' ? 200 : 503;
    return NextResponse.json(healthData, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
