import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/stats - Get dashboard statistics
// GET /api/stats - Get dashboard statistics
export async function GET() {
    try {
        // Run counts in parallel for robustness
        const [total, pending, inProgress, completed] = await Promise.all([
            prisma.repair.count(),
            prisma.repair.count({ where: { status: 'PENDING' } }),
            prisma.repair.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.repair.count({ where: { status: 'COMPLETED' } })
        ])

        return NextResponse.json({
            total,
            pending,
            inProgress,
            completed
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        return NextResponse.json(
            { error: 'Error al obtener las estadísticas' },
            { status: 500 }
        )
    }
}
