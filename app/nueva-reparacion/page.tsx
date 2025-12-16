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
                    Registro de entrada de equipo
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* --- Top Row: Entities (3 Columns) --- */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

                    {/* 1. Operation Info Card */}
                    <div className="rounded-lg border border-border bg-secondary p-5 h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 text-primary" />
                                Operativa
                            </h2>
                            <span className="text-xs font-mono bg-background px-2 py-1 rounded border">
                                {operationNumber}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Estado</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="select w-full"
                                >
                                    <option value="PENDING">Pendiente</option>
                                    <option value="IN_PROGRESS">En Progreso</option>
                                    <option value="COMPLETED">Completada</option>
                                    <option value="CANCELLED">Cancelada</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Entrada</label>
                                    <input
                                        type="date"
                                        value={formData.entryDate}
                                        onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                                        className="input w-full text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Salida</label>
                                    <input
                                        type="date"
                                        value={formData.exitDate}
                                        onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                                        className="input w-full text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Customer Info Card */}
                    <div className="rounded-lg border border-border bg-secondary p-5 h-full">
                        <h2 className="font-semibold mb-4">Cliente</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    placeholder="Nombre"
                                    className="input w-full"
                                />
                                <input
                                    type="text"
                                    value={formData.customerSurname}
                                    onChange={(e) => setFormData({ ...formData, customerSurname: e.target.value })}
                                    placeholder="Apellido"
                                    className="input w-full"
                                />
                            </div>
                            <input
                                type="tel"
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                placeholder="Teléfono *"
                                className="input w-full"
                                required
                            />
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="whatsapp"
                                    checked={formData.hasWhatsApp}
                                    onChange={(e) => setFormData({ ...formData, hasWhatsApp: e.target.checked })}
                                    className="h-3.5 w-3.5 rounded border-input"
                                />
                                <label htmlFor="whatsapp" className="text-xs text-muted-foreground cursor-pointer">
                                    Tiene WhatsApp
                                </label>
                            </div>
                            <input
                                type="email"
                                value={formData.customerEmail}
                                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                placeholder="Email *"
                                className="input w-full"
                                required
                            />
                        </div>
                    </div>

                    {/* 3. Device Info Card */}
                    <div className="rounded-lg border border-border bg-secondary p-5 h-full">
                        <h2 className="font-semibold mb-4">Equipo</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    placeholder="Marca"
                                    className="input w-full"
                                />
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="Modelo"
                                    className="input w-full"
                                />
                            </div>
                            <input
                                type="text"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                placeholder="Número de Serie"
                                className="input w-full"
                            />
                            <select
                                value={formData.assignedTechnicianId}
                                onChange={(e) => setFormData({ ...formData, assignedTechnicianId: e.target.value })}
                                className="select w-full"
                            >
                                <option value="">Asignar Técnico...</option>
                                {technicians?.map((tech) => (
                                    <option key={tech.id} value={tech.id}>
                                        {tech.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- Bottom Section: Details & Images --- */}
                <div className="space-y-6">
                    {/* Diagnosis & Details Card */}
                    <div className="rounded-lg border border-border bg-secondary p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-semibold">Detalles de la Reparación</h2>
                            {/* Invoice Inline */}
                            <div className="flex items-center gap-3 bg-background p-2 rounded-lg border border-border">
                                <label className="text-xs font-medium text-muted-foreground">Factura:</label>
                                {hasInvoice ? (
                                    <input
                                        type="text"
                                        value={formData.invoiceNumber}
                                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                        className="input h-8 w-32 text-sm"
                                        placeholder="Nº Factura"
                                    />
                                ) : (
                                    <span className="text-xs text-muted-foreground opacity-50 px-2">No aplica</span>
                                )}
                                <input
                                    type="checkbox"
                                    checked={!hasInvoice}
                                    onChange={(e) => {
                                        setHasInvoice(!e.target.checked)
                                        if (e.target.checked) setFormData(prev => ({ ...prev, invoiceNumber: 'no' }))
                                        else setFormData(prev => ({ ...prev, invoiceNumber: '' }))
                                    }}
                                    className="h-4 w-4 rounded border-input"
                                    title="Sin Factura"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Motivo</label>
                                <textarea
                                    value={formData.issueDescription}
                                    onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                                    className="textarea w-full bg-background"
                                    rows={3}
                                    placeholder="¿Qué le pasa al equipo?"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Diagnóstico Técnico</label>
                                    <textarea
                                        value={formData.technicalDiagnosis}
                                        onChange={(e) => setFormData({ ...formData, technicalDiagnosis: e.target.value })}
                                        className="textarea w-full bg-background"
                                        rows={4}
                                        placeholder="Evaluación del técnico..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Resultado / Resolución</label>
                                    <textarea
                                        value={formData.repairResult}
                                        onChange={(e) => setFormData({ ...formData, repairResult: e.target.value })}
                                        className="textarea w-full bg-background"
                                        rows={4}
                                        placeholder="¿Cómo se solucionó?"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Images Card */}
                    <div className="rounded-lg border border-border bg-secondary p-6">
                        <h2 className="font-semibold mb-4">Evidencias Visuales</h2>
                        <ImageUpload
                            onUpload={(urls) => setFormData({ ...formData, imageUrls: urls })}
                            existingUrls={formData.imageUrls}
                        />
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="button-ghost"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="button-primary px-8"
                            disabled={loading}
                        >
                            {loading ? 'Creando...' : 'Crear Expediente'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
