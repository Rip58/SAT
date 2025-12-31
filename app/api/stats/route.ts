import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/stats - Get dashboard statistics
export async function GET() {
    try {
        console.log('📊 Stats API called')
        // Run counts in parallel for robustness
        const [total, pending, inProgress, completed, cancelled] = await Promise.all([
            prisma.repair.count(),
            prisma.repair.count({ where: { status: 'PENDING' } }),
            prisma.repair.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.repair.count({ where: { status: 'COMPLETED' } }),
            prisma.repair.count({ where: { status: 'CANCELLED' } })
        ])

        console.log('📊 Stats result:', { total, pending, inProgress, completed, cancelled })

        return NextResponse.json({
            total,
            pending,
            inProgress,
            completed,
            cancelled
        })
    } catch (error) {
        console.error('❌ Error fetching stats:', error)
        return NextResponse.json(
            { error: 'Error al obtener las estadísticas' },
            { status: 500 }
        )
    }
}
