'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Clock, Loader2, CheckCircle2, Package, Trash2 } from 'lucide-react'
import StatCard from '@/components/stat-card'
import StatusBadge from '@/components/status-badge'
import PinModal from '@/components/pin-modal'
import { formatDate } from '@/lib/utils'

import { APP_VERSION } from '@/lib/constants'

interface Stats {
    total: number
    pending: number
    inProgress: number
    completed: number
}

interface Repair {
    id: string
    operationNumber: string
    customerName?: string
    customerSurname?: string
    status: string
    entryDate: string
    brand?: string
    model?: string
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, completed: 0 })
    const [repairs, setRepairs] = useState<Repair[]>([])
    const [filteredRepairs, setFilteredRepairs] = useState<Repair[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string | 'all'>('all')

    // Modal state
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [showPinModal, setShowPinModal] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (filter === 'all') {
            setFilteredRepairs(repairs)
        } else {
            setFilteredRepairs(repairs.filter(r => r.status === filter))
        }
    }, [filter, repairs])

    async function fetchData() {
        try {
            const [statsRes, repairsRes] = await Promise.all([
                fetch('/api/stats'),
                fetch('/api/repairs'), // Fetch all repairs for filtering
            ])

            const statsData = await statsRes.json()
            const repairsData = await repairsRes.json()

            setStats(statsData)
            setRepairs(repairsData)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteClick = (id: string) => {
        setDeleteId(id)
        setShowPinModal(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deleteId) return

        try {
            const res = await fetch(`/api/repairs?id=${deleteId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                // Refresh data
                fetchData()
                setShowPinModal(false)
                setDeleteId(null)
            } else {
                alert('Error al eliminar la reparación')
            }
        } catch (error) {
            console.error('Error deleting repair:', error)
            alert('Error al eliminar la reparación')
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 pb-20">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <span className="text-xs font-mono text-muted-foreground bg-accent px-2 py-0.5 rounded-full border border-border">
                            v{APP_VERSION}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Última actualización: hace un momento
                    </p>
                </div>
                <Link href="/nueva-reparacion" className="button-primary flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Nueva Reparación
                </Link>
            </div>

            {/* Stats Grid - Clickable Filters */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <div onClick={() => setFilter('all')} className={`cursor-pointer transition-transform hover:scale-105 h-full ${filter === 'all' ? 'ring-2 ring-primary rounded-xl' : ''}`}>
                    <StatCard
                        title="Total Reparaciones"
                        value={stats?.total || 0}
                        subtitle="Reparaciones registradas"
                        icon={Package}
                    />
                </div>
                <div onClick={() => setFilter('PENDING')} className={`cursor-pointer transition-transform hover:scale-105 h-full ${filter === 'PENDING' ? 'ring-2 ring-primary rounded-xl' : ''}`}>
                    <StatCard
                        title="Pendientes"
                        value={stats?.pending || 0}
                        subtitle="Reparaciones pendientes"
                        icon={Clock}
                        iconColor="text-gray-400"
                    />
                </div>
                <div onClick={() => setFilter('IN_PROGRESS')} className={`cursor-pointer transition-transform hover:scale-105 h-full ${filter === 'IN_PROGRESS' ? 'ring-2 ring-primary rounded-xl' : ''}`}>
                    <StatCard
                        title="En Progreso"
                        value={stats?.inProgress || 0}
                        subtitle="Reparaciones en curso"
                        icon={Loader2}
                        iconColor="text-yellow-400"
                    />
                </div>
                <div onClick={() => setFilter('COMPLETED')} className={`cursor-pointer transition-transform hover:scale-105 h-full ${filter === 'COMPLETED' ? 'ring-2 ring-primary rounded-xl' : ''}`}>
                    <StatCard
                        title="Completadas"
                        value={stats?.completed || 0}
                        subtitle="Reparaciones finalizadas"
                        icon={CheckCircle2}
                        iconColor="text-blue-400"
                    />
                </div>
            </div>

            {/* Repairs List */}
            <div className="rounded-lg border border-border bg-secondary">
                <div className="border-b border-border p-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        {filter === 'all' ? 'Todas las Reparaciones' :
                            filter === 'PENDING' ? 'Reparaciones Pendientes' :
                                filter === 'IN_PROGRESS' ? 'Reparaciones en Progreso' :
                                    'Reparaciones Completadas'}
                    </h2>
                    <span className="text-sm text-muted-foreground">{filteredRepairs.length} resultados</span>
                </div>

                {filteredRepairs.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-muted-foreground">No hay reparaciones en esta categoría.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filteredRepairs.map((repair) => (
                            <div key={repair.id} className="p-4 hover:bg-accent/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">{repair.operationNumber}</span>
                                            <StatusBadge status={repair.status} />
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {repair.customerName || repair.customerSurname
                                                ? `${repair.customerName || ''} ${repair.customerSurname || ''}`.trim()
                                                : 'Cliente sin nombre'}
                                            {' • '}
                                            {repair.brand && repair.model ? `${repair.brand} ${repair.model}` : 'Equipo sin especificar'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm text-muted-foreground mr-4">
                                            {formatDate(repair.entryDate)}
                                        </p>
                                        <Link
                                            href={`/reparaciones/${repair.id}`}
                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                            title="Editar"
                                        >
                                            <FileText className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteClick(repair.id)}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <PinModal
                isOpen={showPinModal}
                onClose={() => {
                    setShowPinModal(false)
                    setDeleteId(null)
                }}
                onSuccess={handleDeleteConfirm}
                title="Confirmar Eliminación"
                description="Introduce el PIN maestro para eliminar esta reparación permanentemente."
            />
        </div>
    )
}
