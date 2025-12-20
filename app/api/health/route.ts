import { NextResponse } from 'next/server'
import { APP_VERSION } from '@/lib/constants'
// import { localDb } from '@/lib/local-db' // Not strictly needed if we just assume FS is ok, but good to try reading

// GET /api/health - Check system status
export async function GET() {
    try {
        // Simple health check
        return NextResponse.json({
            status: 'ok',
            database: 'local-json',
            version: APP_VERSION,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Health check failed:', error)
        return NextResponse.json(
            {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 503 }
        )
    }
}
