import { NextRequest, NextResponse } from 'next/server'
import { localDb } from '@/lib/local-db'

// GET /api/stats - Get dashboard statistics
export async function GET() {
    try {
        const stats = await localDb.getStats()
        return NextResponse.json(stats)
    } catch (error) {
        console.error('Error fetching stats:', error)
        return NextResponse.json(
            { error: 'Error al obtener las estadísticas' },
            { status: 500 }
        )
    }
}
