'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, FileText, Trash2, Edit } from 'lucide-react'
import StatusBadge from '@/components/status-badge'
import { formatDate } from '@/lib/utils'

interface Repair {
    id: string
    operationNumber: string
    customerName?: string
    customerSurname?: string
    customerPhone: string
    brand?: string
    model?: string
    status: string
    entryDate: string
    assignedTechnician?: {
        name: string
    }
}

export default function RepairsListPage() {
    const [repairs, setRepairs] = useState<Repair[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchRepairs()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter])

    const fetchRepairs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (statusFilter !== 'all') {
                params.append('status', statusFilter)
            }

            const response = await fetch(`/api/repairs?${params}`)
            if (!response.ok) throw new Error('Failed to fetch repairs')

            const data = await response.json()

            if (Array.isArray(data)) {
                setRepairs(data)
            } else {
                console.error('Repairs data is not an array:', data)
                setRepairs([])
            }
        } catch (error) {
            console.error('Error fetching repairs:', error)
            setRepairs([])
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta reparación?')) {
            return
        }

        try {
            const response = await fetch(`/api/repairs/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setRepairs(repairs.filter(r => r.id !== id))
            } else {
                alert('Error al eliminar la reparación')
            }
        } catch (error) {
            console.error('Error deleting repair:', error)
            alert('Error al eliminar la reparación')
        }
    }

    const filteredRepairs = repairs?.filter(repair => {
        if (!searchQuery) return true

        const search = searchQuery.toLowerCase()
        const fullName = `${repair.customerName || ''} ${repair.customerSurname || ''}`.toLowerCase()

        return (
            fullName.includes(search) ||
            repair.customerPhone.includes(search) ||
            repair.operationNumber.toLowerCase().includes(search)
        )
    })

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Listado de Reparaciones</h1>
                <Link href="/nueva-reparacion" className="button-primary flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Nueva Reparación
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-lg border border-border bg-secondary p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">Columnas</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="select w-48"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="PENDING">Pendiente</option>
                            <option value="IN_PROGRESS">En Progreso</option>
                            <option value="COMPLETED">Completada</option>
                            <option value="CANCELLED">Cancelada</option>
                        </select>
                    </div>

                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre de cliente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border bg-secondary overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-border bg-accent">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">N° Operativa</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Cliente</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Técnico</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Equipo</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Fecha de Ingreso</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                        Cargando...
                                    </td>
                                </tr>
                            ) : filteredRepairs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                        No se encontraron reparaciones
                                    </td>
                                </tr>
                            ) : (
                                filteredRepairs.map((repair) => (
                                    <tr key={repair.id} className="hover:bg-accent/50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium">
                                            {repair.operationNumber}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {repair.customerName || repair.customerSurname
                                                ? `${repair.customerName || ''} ${repair.customerSurname || ''}`.trim()
                                                : 'Sin nombre'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {repair.assignedTechnician?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {repair.brand && repair.model
                                                ? `${repair.brand} ${repair.model}`
                                                : repair.brand || repair.model || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {formatDate(repair.entryDate)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={repair.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => window.open(`/api/repairs/${repair.id}/pdf`, '_blank')}
                                                    className="button-ghost p-2"
                                                    title="Ver PDF"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    href={`/reparaciones/${repair.id}`}
                                                    className="button-ghost p-2 inline-flex items-center"
                                                    title="Editar"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(repair.id)}
                                                    className="button-ghost p-2 text-destructive hover:bg-destructive/10"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
