'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Loader2 } from 'lucide-react'

interface MonthlyData {
    month: string
    count: number
    label: string
}

export default function EstadisticasPage() {
    const [data, setData] = useState<MonthlyData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/stats/monthly')
            .then(res => res.json())
            .then(data => {
                setData(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching stats:', err)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const maxCount = Math.max(...data.map(d => d.count), 1)

    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Estadísticas</h1>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    Reparaciones por mes
                </p>
            </div>

            {data.length === 0 ? (
                <div className="rounded-lg border border-border bg-secondary p-12 text-center">
                    <p className="text-muted-foreground">No hay datos suficientes para mostrar estadísticas</p>
                </div>
            ) : (
                <>
                    {/* Bar Chart */}
                    <div className="mb-12 rounded-lg border border-border bg-secondary p-8">
                        <h2 className="mb-6 text-lg font-semibold">Gráfico de Barras</h2>
                        <div className="flex items-end justify-between gap-2 h-64">
                            {data.map((item) => {
                                const heightPercent = (item.count / maxCount) * 100
                                return (
                                    <div key={item.month} className="flex-1 flex flex-col items-center justify-end gap-2">
                                        {/* Bar */}
                                        <div className="relative w-full flex items-end justify-center">
                                            <div
                                                className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80 flex items-end justify-center pb-2"
                                                style={{ height: `${heightPercent}%`, minHeight: '30px' }}
                                            >
                                                <span className="text-xs font-bold text-primary-foreground">
                                                    {item.count}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Month Label */}
                                        <div className="text-xs text-muted-foreground text-center w-full truncate px-1">
                                            {item.label.split(' ')[0]}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border border-border bg-secondary overflow-hidden">
                        <div className="border-b border-border p-4 bg-accent">
                            <h2 className="text-lg font-semibold">Detalle por Mes</h2>
                        </div>
                        <table className="w-full">
                            <thead className="border-b border-border bg-accent/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Mes</th>
                                    <th className="px-6 py-3 text-right text-sm font-medium">Reparaciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {data.map((item) => (
                                    <tr key={item.month} className="hover:bg-accent/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium capitalize">{item.label}</td>
                                        <td className="px-6 py-4 text-sm text-right font-semibold">{item.count}</td>
                                    </tr>
                                ))}
                                <tr className="bg-accent font-bold">
                                    <td className="px-6 py-4 text-sm">Total</td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        {data.reduce((sum, item) => sum + item.count, 0)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}
