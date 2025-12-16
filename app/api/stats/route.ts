import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/stats - Get dashboard statistics
export async function GET() {
    try {
        // Group by status and count
        const groupByStatus = await prisma.repair.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        })

        // Initialize counters
        let pending = 0
        let inProgress = 0
        let completed = 0
        let total = 0

        // Aggregate results
        groupByStatus.forEach((group: { status: string, _count: { status: number } }) => {
            const count = group._count.status
            total += count
            if (group.status === 'PENDING') pending = count
            else if (group.status === 'IN_PROGRESS') inProgress = count
            else if (group.status === 'COMPLETED') completed = count
        })

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
