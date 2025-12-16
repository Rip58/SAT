'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import ImageUpload from '@/components/image-upload'
import { generateOperationNumber } from '@/lib/utils'

interface Technician {
    id: string
    name: string
}

export default function NewRepairPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [technicians, setTechnicians] = useState<Technician[]>([])
    const [operationNumber, setOperationNumber] = useState('')

    const [hasInvoice, setHasInvoice] = useState(true)

    const [formData, setFormData] = useState({
        customerName: '',
        customerSurname: '',
        customerPhone: '',
        customerEmail: '',
        hasWhatsApp: false,
        brand: '',
        model: '',
        serialNumber: '',
        assignedTechnicianId: '',
        invoiceNumber: '',
        issueDescription: '',
        technicalDiagnosis: '',
        repairResult: '',
        status: 'PENDING',
        entryDate: new Date().toISOString().split('T')[0],
        exitDate: '',
        imageUrls: [] as string[],
    })

    useEffect(() => {
        // Fetch technicians
        fetch('/api/technicians')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch')
                return res.json()
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setTechnicians(data)
                } else {
                    console.error('Technicians data is not an array:', data)
                    setTechnicians([])
                }
            })
            .catch(err => {
                console.error('Error fetching technicians:', err)
                setTechnicians([])
            })

        // Generate operation number preview
        setOperationNumber(generateOperationNumber())
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.customerPhone || !formData.customerEmail) {
            alert('El teléfono y el email son obligatorios')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/repairs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    exitDate: formData.exitDate || null,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Error al crear la reparación')
            }

            const repair = await response.json()

            // Open PDF in new window
            window.open(`/api/repairs/${repair.id}/pdf`, '_blank')

            // Redirect to repairs list
            router.push('/reparaciones')
        } catch (error: any) {
            console.error('Error creating repair:', error)
            alert(error.message || 'Error al crear la reparación')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Nueva Reparación</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Introduce los datos para registrar una nueva reparación.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
                {/* Operation Info */}
                <div className="rounded-lg border border-border bg-secondary p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Nueva Reparación</h2>
                        <button type="button" className="button-ghost text-xs">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Actualizar datos
                        </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium mb-2">Número de operativa</label>
                            <input
                                type="text"
                                value={operationNumber}
                                disabled
                                className="input bg-accent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Fecha de ingreso</label>
                            <input
                                type="date"
                                value={formData.entryDate}
                                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Estado</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="select"
                            >
                                <option value="PENDING">Pendiente</option>
                                <option value="IN_PROGRESS">En Progreso</option>
                                <option value="COMPLETED">Completada</option>
                                <option value="CANCELLED">Cancelada</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium mb-2">Fecha de salida</label>
                        <input
                            type="date"
                            value={formData.exitDate}
                            onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                            className="input"
                            placeholder="Selecciona una fecha"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            Dejar clara si la reparación no ha finalizado.
                        </p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="rounded-lg border border-border bg-secondary p-6">
                    <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre</label>
                            <input
                                type="text"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Apellido</label>
                            <input
                                type="text"
                                value={formData.customerSurname}
                                onChange={(e) => setFormData({ ...formData, customerSurname: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Teléfono <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.customerEmail}
                                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                className="input"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="whatsapp"
                            checked={formData.hasWhatsApp}
                            onChange={(e) => setFormData({ ...formData, hasWhatsApp: e.target.checked })}
                            className="h-4 w-4 rounded border-input bg-secondary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        />
                        <label htmlFor="whatsapp" className="text-sm font-medium cursor-pointer">
                            Tiene WhatsApp 📱
                        </label>
                    </div>
                </div>

                {/* Device Info */}
                <div className="rounded-lg border border-border bg-secondary p-6">
                    <h2 className="text-lg font-semibold mb-4">Información del Equipo</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-2">Marca</label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Modelo</label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Número de serie</label>
                            <input
                                type="text"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Técnico asignado</label>
                            <select
                                value={formData.assignedTechnicianId}
                                onChange={(e) => setFormData({ ...formData, assignedTechnicianId: e.target.value })}
                                className="select"
                            >
                                <option value="">Selecciona un técnico</option>
                                {technicians?.map((tech) => (
                                    <option key={tech.id} value={tech.id}>
                                        {tech.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Repair Details */}
                <div className="rounded-lg border border-border bg-secondary p-6">
                    <h2 className="text-lg font-semibold mb-4">Detalles de la Reparación</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Número de factura</label>
                            <div className="flex items-center gap-4">
                                {hasInvoice ? (
                                    <input
                                        type="text"
                                        value={formData.invoiceNumber}
                                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                        className="input max-w-[200px]"
                                    />
                                ) : (
                                    <div className="input bg-accent text-muted-foreground opacity-50 cursor-not-allowed max-w-[200px]">
                                        No aplica
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="noInvoice"
                                        checked={!hasInvoice}
                                        onChange={(e) => {
                                            setHasInvoice(!e.target.checked)
                                            if (e.target.checked) {
                                                setFormData(prev => ({ ...prev, invoiceNumber: 'no' }))
                                            } else {
                                                setFormData(prev => ({ ...prev, invoiceNumber: '' }))
                                            }
                                        }}
                                        className="h-4 w-4 rounded border-input bg-secondary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    />
                                    <label htmlFor="noInvoice" className="text-sm font-medium cursor-pointer">
                                        Sin factura
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Motivo de la intervención</label>
                            <textarea
                                value={formData.issueDescription}
                                onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                                className="textarea"
                                rows={3}
                                placeholder="Describe el problema reportado por el cliente"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Descripción del problema según el cliente.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Valoración técnica</label>
                            <textarea
                                value={formData.technicalDiagnosis}
                                onChange={(e) => setFormData({ ...formData, technicalDiagnosis: e.target.value })}
                                className="textarea"
                                rows={3}
                                placeholder="Valoración técnica del problema"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Diagnóstico técnico del problema (opcional).
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Resultado de la incidencia</label>
                            <textarea
                                value={formData.repairResult}
                                onChange={(e) => setFormData({ ...formData, repairResult: e.target.value })}
                                className="textarea"
                                rows={3}
                                placeholder="Describe el resultado de la reparación"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Resultado final de la reparación (opcional).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="rounded-lg border border-border bg-secondary p-6">
                    <h2 className="text-lg font-semibold mb-4">Imágenes</h2>
                    <ImageUpload
                        onUpload={(urls) => setFormData({ ...formData, imageUrls: urls })}
                        existingUrls={formData.imageUrls}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="button-secondary"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="button-primary"
                        disabled={loading}
                    >
                        {loading ? 'Creando...' : 'Crear reparación'}
                    </button>
                </div>
            </form>
        </div>
    )
}
