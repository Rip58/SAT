'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSignUp, setIsSignUp] = useState(false)

    // Initializing client using env vars baked in next.config.js
    const supabase = createClientComponentClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error } = isSignUp
                ? await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                })
                : await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

            if (error) throw error

            if (isSignUp && data.user) {
                if (!data.session) {
                    setError('Revisa tu email para confirmar tu cuenta (si Supabase lo requiere)')
                    setLoading(false)
                    return
                }
            }

            // Redirect on success
            console.log('Login successful, redirecting...')
            router.push('/')
            router.refresh()
        } catch (error: any) {
            setError(error.message || 'Error de autenticación')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Lock className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Gestor SAT</CardTitle>
                    <CardDescription>
                        {isSignUp ? 'Crea tu cuenta de administrador' : 'Inicia sesión para acceder'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="email"
                                    placeholder="admin@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                isSignUp ? 'Crear Cuenta' : 'Entrar'
                            )}
                        </Button>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                {isSignUp
                                    ? '¿Ya tienes cuenta? Inicia sesión'
                                    : '¿No tienes cuenta? Regístrate'}
                            </button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="text-center text-xs text-gray-500 justify-center flex-col gap-1">
                    <p>Acceso restringido a personal autorizado</p>
                    <p className="opacity-70">Supabase Auth Secure</p>
                </CardFooter>
            </Card>
        </div>
    )
}
