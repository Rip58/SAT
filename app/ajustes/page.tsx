'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Save, Lock } from 'lucide-react'

interface Technician {
    id: string
    name: string
    isActive: boolean
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)
    const [technicians, setTechnicians] = useState<Technician[]>([])
    const [newTechName, setNewTechName] = useState('')
    const [serviceConditions, setServiceConditions] = useState('')
    const [savingConditions, setSavingConditions] = useState(false)
    const [securityPin, setSecurityPin] = useState('')
    const [savingPin, setSavingPin] = useState(false)

    // Theme state
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')

    useEffect(() => {
        // Initialize theme from localStorage or system preference
        const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
        if (storedTheme) {
            setTheme(storedTheme)
            document.documentElement.classList.toggle('dark', storedTheme === 'dark')
        } else {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            setTheme(systemTheme)
            document.documentElement.classList.toggle('dark', systemTheme === 'dark')
        }

        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // Fetch technicians
            const techRes = await fetch('/api/technicians')
            if (techRes.ok) {
                const data = await techRes.json()
                setTechnicians(data)
            }

            // Fetch settings
            const settingsRes = await fetch('/api/settings')
            if (settingsRes.ok) {
                const data = await settingsRes.json()
                if (data.serviceConditions) {
                    setServiceConditions(data.serviceConditions)
                }
                if (data.securityPin) {
                    setSecurityPin(data.securityPin)
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }

    const handleAddTechnician = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTechName.trim()) return

        try {
            const res = await fetch('/api/technicians', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTechName })
            })

            if (res.ok) {
                setNewTechName('')
                fetchData() // Refresh list
            } else {
                alert('Error al añadir técnico')
            }
        } catch (error) {
            console.error('Error adding technician:', error)
        }
    }

    const handleDeleteTechnician = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este técnico?')) return

        try {
            const res = await fetch(`/api/technicians?id=${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                fetchData() // Refresh list
            } else {
                alert('Error al eliminar técnico')
            }
        } catch (error) {
            console.error('Error deleting technician:', error)
        }
    }

    const handleSavePin = async () => {
        setSavingPin(true)
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ securityPin })
            })

            if (res.ok) {
                alert('PIN actualizado correctamente')
            } else {
                alert('Error al actualizar el PIN')
            }
        } catch (error) {
            console.error('Error saving PIN:', error)
            alert('Error al actualizar el PIN')
        } finally {
            setSavingPin(false)
        }
    }

    const handleSaveConditions = async () => {
        setSavingConditions(true)
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceConditions })
            })

            if (res.ok) {
                alert('Condiciones guardadas correctamente')
            } else {
                alert('Error al guardar condiciones')
            }
        } catch (error) {
            console.error('Error saving conditions:', error)
            alert('Error al guardar condiciones')
        } finally {
            setSavingConditions(false)
        }
    }

    return (
        <div className="p-8 pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Configuración</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Gestiona los técnicos y configura el sistema
                </p>
            </div>

            {/* Theme Settings */}
            <div className="max-w-2xl rounded-lg border border-border bg-secondary p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">Apariencia</h2>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-accent">
                    <div>
                        <p className="font-medium">Modo Oscuro</p>
                        <p className="text-sm text-muted-foreground">
                            {theme === 'dark' ? 'Activado' : 'Desactivado'}
                        </p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${theme === 'dark' ? 'bg-primary' : 'bg-input'
                            }`}
                    >
                        <span
                            className={`${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 max-w-5xl">
                {/* Security Settings */}
                <div className="rounded-lg border border-border bg-secondary p-6">
                    <h2 className="text-xl font-semibold mb-2">Seguridad</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        PIN maestro para acciones sensibles
                    </p>

                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">PIN Maestro</label>
                            <input
                                type="text"
                                value={securityPin}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                                    setSecurityPin(val)
                                }}
                                placeholder="0000"
                                className="input w-full font-mono tracking-widest text-center text-lg"
                            />
                        </div>
                        <button
                            onClick={handleSavePin}
                            disabled={savingPin || securityPin.length < 4}
                            className="button-primary mb-[2px]"
                        >
                            <Lock className="h-4 w-4 mr-2" />
                            Actualizar
                        </button>
                    </div>
                </div>

                {/* Technicians Management */}
                <div className="rounded-lg border border-border bg-secondary p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-semibold">Técnicos</h2>
                        <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full">{technicians.length}</span>
                    </div>

                    <form onSubmit={handleAddTechnician} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTechName}
                            onChange={(e) => setNewTechName(e.target.value)}
                            placeholder="Nuevo técnico..."
                            className="input flex-1"
                        />
                        <button type="submit" className="button-primary px-3">
                            <Plus className="h-4 w-4" />
                        </button>
                    </form>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {technicians.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No hay técnicos
                            </p>
                        )}
                        {technicians.map((tech) => (
                            <div key={tech.id} className="flex items-center justify-between p-2 rounded-lg border border-border bg-accent text-sm">
                                <span className="font-medium">{tech.name}</span>
                                <button
                                    onClick={() => handleDeleteTechnician(tech.id)}
                                    className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Service Conditions */}
            <div className="max-w-4xl rounded-lg border border-border bg-secondary p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Condiciones del Servicio</h2>
                        <p className="text-sm text-muted-foreground">
                            Texto legal que aparecerá en los comprobantes PDF
                        </p>
                    </div>
                    <button
                        onClick={handleSaveConditions}
                        disabled={savingConditions}
                        className="button-primary"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {savingConditions ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

                <textarea
                    value={serviceConditions}
                    onChange={(e) => setServiceConditions(e.target.value)}
                    className="textarea font-mono text-sm"
                    rows={15}
                    placeholder="Escribe las condiciones del servicio..."
                />
            </div>
        </div>
    )
}
