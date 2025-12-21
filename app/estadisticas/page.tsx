'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthData {
    month: number
    monthKey: string
    label: string
    count: number
}

interface StatsData {
    year: number
    months: MonthData[]
    total: number
}

export default function EstadisticasPage() {
    const [data, setData] = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    useEffect(() => {
        fetchData(selectedYear)
    }, [selectedYear])

    const fetchData = (year: number) => {
        setLoading(true)
        fetch(`/api/stats/monthly?year=${year}`)
            .then(res => res.json())
            .then(data => {
                setData(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching stats:', err)
                setLoading(false)
            })
    }

    if (loading || !data) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const maxCount = Math.max(...data.months.map(d => d.count), 1)

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Estadísticas</h1>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    Reparaciones por mes
                </p>
            </div>

            {/* Bar Chart Section */}
            <div className="mb-12 rounded-lg border border-border bg-secondary p-8">
                {/* Year Selector - Chart */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Gráfico Mensual</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedYear(selectedYear - 1)}
                            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                            title="Año anterior"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm min-w-[80px] text-center">
                            {selectedYear}
                        </div>
                        <button
                            onClick={() => setSelectedYear(selectedYear + 1)}
                            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                            title="Siguiente año"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Chart */}
                <div className="flex items-end justify-between gap-1 h-64 mb-4">
                    {data.months.map((item) => {
                        const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                        return (
                            <div key={item.monthKey} className="flex-1 flex flex-col items-center justify-end gap-2">
                                {/* Bar */}
                                <div className="relative w-full flex items-end justify-center group">
                                    <div
                                        className="w-full bg-primary/80 hover:bg-primary rounded-t-lg transition-all flex items-end justify-center pb-1"
                                        style={{
                                            height: heightPercent > 0 ? `${heightPercent}%` : '0%',
                                            minHeight: item.count > 0 ? '24px' : '0px'
                                        }}
                                    >
                                        {item.count > 0 && (
                                            <span className="text-xs font-bold text-primary-foreground opacity-90">
                                                {item.count}
                                            </span>
                                        )}
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-background border border-border rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg z-10">
                                        {item.label}: {item.count}
                                    </div>
                                </div>
                                {/* Month Label */}
                                <div className="text-xs text-muted-foreground text-center w-full">
                                    {item.label.substring(0, 3)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Table Section */}
            <div className="rounded-lg border border-border bg-secondary overflow-hidden">
                {/* Year Selector - Table */}
                <div className="border-b border-border p-4 bg-accent flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Detalle por Mes</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedYear(selectedYear - 1)}
                            className="p-1.5 hover:bg-background/50 rounded-lg transition-colors"
                            title="Año anterior"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="px-3 py-1 bg-primary text-primary-foreground rounded-lg font-semibold text-sm min-w-[70px] text-center">
                            {selectedYear}
                        </div>
                        <button
                            onClick={() => setSelectedYear(selectedYear + 1)}
                            className="p-1.5 hover:bg-background/50 rounded-lg transition-colors"
                            title="Siguiente año"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full">
                    <thead className="border-b border-border bg-accent/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium">Mes</th>
                            <th className="px-6 py-3 text-right text-sm font-medium">Reparaciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.months.map((item) => (
                            <tr key={item.monthKey} className="hover:bg-accent/50 transition-colors">
                                <td className="px-6 py-3 text-sm font-medium">{item.label}</td>
                                <td className="px-6 py-3 text-sm text-right font-semibold">
                                    {item.count > 0 ? item.count : '-'}
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-primary/10 font-bold border-t-2 border-primary/20">
                            <td className="px-6 py-4 text-sm">Total {selectedYear}</td>
                            <td className="px-6 py-4 text-sm text-right text-primary">
                                {data.total}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
