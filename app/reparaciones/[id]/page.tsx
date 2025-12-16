'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, ArrowLeft } from 'lucide-react'
import ImageUpload from '@/components/image-upload'
import { generateOperationNumber } from '@/lib/utils'

interface Technician {
    id: string
    name: string
}

export default function EditRepairPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
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
        entryDate: '',
        exitDate: '',
        imageUrls: [] as string[],
    })

    useEffect(() => {
        // Fetch technicians and repair data
        Promise.all([
            fetch('/api/technicians').then(res => res.json()),
            fetch(`/api/repairs/${params.id}`).then(res => res.json())
        ]).then(([techData, repairData]) => {
            if (Array.isArray(techData)) {
                setTechnicians(techData)
            }

            if (repairData) {
                setOperationNumber(repairData.operationNumber)
                setFormData({
                    customerName: repairData.customerName || '',
                    customerSurname: repairData.customerSurname || '',
                    customerPhone: repairData.customerPhone || '',
                    customerEmail: repairData.customerEmail || '',
                    hasWhatsApp: repairData.hasWhatsApp || false,
                    brand: repairData.brand || '',
                    model: repairData.model || '',
                    serialNumber: repairData.serialNumber || '',
                    assignedTechnicianId: repairData.assignedTechnicianId || '',
                    invoiceNumber: repairData.invoiceNumber === 'no' ? '' : (repairData.invoiceNumber || ''),
                    issueDescription: repairData.issueDescription || '',
                    technicalDiagnosis: repairData.technicalDiagnosis || '',
                    repairResult: repairData.repairResult || '',
                    status: repairData.status || 'PENDING',
                    entryDate: repairData.entryDate ? new Date(repairData.entryDate).toISOString().split('T')[0] : '',
                    exitDate: repairData.exitDate ? new Date(repairData.exitDate).toISOString().split('T')[0] : '',
                    imageUrls: repairData.imageUrls || [],
                })

                if (repairData.invoiceNumber === 'no') {
                    setHasInvoice(false)
                }
            }
        }).catch(err => {
            console.error('Error fetching data:', err)
            alert('Error al cargar la reparación')
            router.push('/reparaciones')
        }).finally(() => {
            setInitialLoading(false)
        })
    }, [params.id, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.customerPhone || !formData.customerEmail) {
            alert('El teléfono y el email son obligatorios')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`/api/repairs/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    invoiceNumber: !hasInvoice ? 'no' : formData.invoiceNumber,
                    exitDate: formData.exitDate || null,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Error al actualizar la reparación')
            }

            // Redirect to repairs list or dashboard
            router.push('/')
        } catch (error: any) {
            console.error('Error updating repair:', error)
            alert(error.message || 'Error al actualizar la reparación')
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return <div className="p-8 text-center">Cargando datos...</div>
    }

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Editar Reparación</h1>
                    <p className="mt-1 text-sm text-muted-foreground text-mono">
                        {operationNumber}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
                {/* LEFT COLUMN: Metadata & Entities */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Operation Info Card */}
                    <div className="rounded-lg border border-border bg-secondary p-5">
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

                    {/* Customer Info Card */}
                    <div className="rounded-lg border border-border bg-secondary p-5">
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

                    {/* Device Info Card */}
                    <div className="rounded-lg border border-border bg-secondary p-5">
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

                {/* RIGHT COLUMN: Content & Details */}
                <div className="space-y-6 lg:col-span-2">
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

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => window.open(`/api/repairs/${params.id}/pdf`, '_blank')}
                            className="button-ghost flex items-center gap-2"
                        >
                            Generar PDF
                        </button>
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
                            className="button-primary px-8"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
