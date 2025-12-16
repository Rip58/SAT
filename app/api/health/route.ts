import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { APP_VERSION } from '@/lib/constants'

// GET /api/health - Check database connection
export async function GET() {
    try {
        // Try to run a simple query
        await prisma.$queryRaw`SELECT 1`

        return NextResponse.json({
            status: 'ok',
            database: 'connected',
            version: APP_VERSION,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Health check failed:', error)
        return NextResponse.json(
            {
                status: 'error',
                database: 'disconnected',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 503 }
        )
    }
}
