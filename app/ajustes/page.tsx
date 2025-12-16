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

            {/* Main Grid: Technicians (Left) vs Appearance & Security (Right) */}
            <div className="grid gap-6 lg:grid-cols-2 max-w-5xl mb-6">

                {/* Left Column: Technicians */}
                <div className="rounded-lg border border-border bg-secondary p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
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

                    <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[200px]">
                        {technicians.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                <p className="text-sm">No hay técnicos</p>
                            </div>
                        )}
                        {technicians.map((tech) => (
                            <div key={tech.id} className="group flex items-center justify-between p-3 rounded-lg border border-border bg-accent text-sm hover:border-primary/50 transition-colors">
                                <span className="font-medium">{tech.name}</span>
                                <button
                                    onClick={() => handleDeleteTechnician(tech.id)}
                                    className="text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/10 p-1.5 rounded-md transition-all"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Stacked Appearance & Security */}
                <div className="space-y-6">
                    {/* Theme Settings */}
                    <div className="rounded-lg border border-border bg-secondary p-6">
                        <h2 className="text-xl font-semibold mb-2">Apariencia</h2>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                            <div>
                                <p className="font-medium">Modo Oscuro</p>
                                <p className="text-xs text-muted-foreground">
                                    {theme === 'dark' ? 'Activado' : 'Desactivado'}
                                </p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${theme === 'dark' ? 'bg-primary' : 'bg-input'}`}
                            >
                                <span
                                    className={`${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="rounded-lg border border-border bg-secondary p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Seguridad</h2>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">
                            PIN maestro para acciones sensibles.
                        </p>

                        <div className="flex items-center gap-4">
                            <input
                                type="text"
                                value={securityPin}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                                    setSecurityPin(val)
                                }}
                                placeholder="0000"
                                className="input flex-1 font-mono tracking-[0.5em] text-center text-lg h-12"
                            />
                            <button
                                onClick={handleSavePin}
                                disabled={savingPin || securityPin.length < 4}
                                className="button-primary h-12 px-6"
                            >
                                {savingPin ? <Save className="h-4 w-4 animate-bounce" /> : <Save className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Conditions */}
            <div className="max-w-5xl rounded-lg border border-border bg-secondary p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Condiciones del Servicio</h2>
                        <p className="text-sm text-muted-foreground">
                            Texto legal para los comprobantes PDF.
                        </p>
                    </div>
                    <button
                        onClick={handleSaveConditions}
                        disabled={savingConditions}
                        className="button-ghost text-primary hover:bg-primary/10"
                    >
                        {savingConditions ? 'Guardando...' : 'Guardar'}
                        <Save className="h-4 w-4 ml-2" />
                    </button>
                </div>

                <textarea
                    value={serviceConditions}
                    onChange={(e) => setServiceConditions(e.target.value)}
                    className="textarea font-mono text-sm bg-accent/30 focus:bg-accent transition-colors"
                    rows={10}
                    placeholder="Escribe las condiciones del servicio..."
                />
            </div>
        </div>
    )
}
