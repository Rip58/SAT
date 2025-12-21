import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/stats/monthly?year=2025 - Get repairs by month for specific year
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        const repairs = await prisma.repair.findMany({
            select: {
                entryDate: true
            },
            where: {
                entryDate: {
                    gte: new Date(`${year}-01-01`),
                    lt: new Date(`${year + 1}-01-01`)
                }
            }
        })

        // Initialize all 12 months with 0
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]

        const monthlyStats = monthNames.map((name, index) => ({
            month: index + 1,
            monthKey: `${year}-${String(index + 1).padStart(2, '0')}`,
            label: name,
            count: 0
        }))

        // Count repairs for each month
        repairs.forEach(repair => {
            const date = new Date(repair.entryDate)
            const monthIndex = date.getMonth()
            monthlyStats[monthIndex].count++
        })

        return NextResponse.json({
            year,
            months: monthlyStats,
            total: repairs.length
        })
    } catch (error) {
        console.error('Error fetching monthly stats:', error)
        return NextResponse.json(
            { error: 'Error al obtener estadísticas mensuales' },
            { status: 500 }
        )
    }
}
