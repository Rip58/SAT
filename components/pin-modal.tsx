'use client'

import { useState } from 'react'
import { X, Lock, Loader2 } from 'lucide-react'

interface PinModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    title?: string
    description?: string
}

export default function PinModal({
    isOpen,
    onClose,
    onSuccess,
    title = 'Autenticación Requerida',
    description = 'Introduce el PIN de seguridad para continuar'
}: PinModalProps) {
    const [pin, setPin] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (pin.length < 4) return

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/verify-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setPin('')
                onSuccess()
            } else {
                setError(data.error || 'PIN incorrecto')
                setPin('')
            }
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-primary">
                        <Lock className="h-5 w-5" />
                        <h2 className="text-lg font-semibold">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                    {description}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-center">
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => {
                                // Only allow numbers
                                const val = e.target.value.replace(/\D/g, '')
                                setPin(val)
                                setError('')
                            }}
                            maxLength={8}
                            placeholder="••••"
                            className="text-center text-3xl tracking-widest w-40 h-14 rounded-lg border border-border bg-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive text-center animate-pulse">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="button-ghost"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="button-primary min-w-[100px]"
                            disabled={loading || pin.length < 4}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Confirmar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
