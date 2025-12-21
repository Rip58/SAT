import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/stats/monthly - Get repairs grouped by month
export async function GET() {
    try {
        const repairs = await prisma.repair.findMany({
            select: {
                entryDate: true
            }
        })

        // Group repairs by month
        const monthlyStats: Record<string, number> = {}

        repairs.forEach(repair => {
            const date = new Date(repair.entryDate)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1
        })

        // Convert to array and sort by date
        const result = Object.entries(monthlyStats)
            .map(([month, count]) => ({
                month,
                count,
                label: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
            }))
            .sort((a, b) => a.month.localeCompare(b.month))

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error fetching monthly stats:', error)
        return NextResponse.json(
            { error: 'Error al obtener estadísticas mensuales' },
            { status: 500 }
        )
    }
}
