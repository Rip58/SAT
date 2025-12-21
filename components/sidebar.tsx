'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, List, Settings, Wrench, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_VERSION } from '@/lib/constants'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Nueva Reparación', href: '/nueva-reparacion', icon: FileText },
    { name: 'Listado de Reparaciones', href: '/reparaciones', icon: List },
    { name: 'Ajustes', href: '/ajustes', icon: Settings },
]

interface SidebarProps {
    onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps = {}) {
    const pathname = usePathname()
    const router = useRouter()
    const [dbConnected, setDbConnected] = useState<boolean | null>(null)
    const [mounted, setMounted] = useState(false)
    const [userEmail, setUserEmail] = useState<string>('')

    useEffect(() => {
        setMounted(true)
        checkHealth()
        fetchUserEmail()
        // Poll every 30 seconds
        const interval = setInterval(checkHealth, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleLogout = async () => {
        try {
            const supabase = createClientComponentClient()
            await supabase.auth.signOut()
            router.push('/login')
            router.refresh()
        } catch (error) {
            console.error('Error logging out:', error)
        }
    }

    const fetchUserEmail = async () => {
        try {
            const supabase = createClientComponentClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email) {
                setUserEmail(user.email)
            }
        } catch (error) {
            console.error('Error fetching user:', error)
        }
    }

    const checkHealth = async () => {
        try {
            const res = await fetch('/api/health')
            if (res.ok) {
                const data = await res.json()
                setDbConnected(data.database === 'connected')
            } else {
                setDbConnected(false)
            }
        } catch (error) {
            setDbConnected(false)
        }
    }

    const statusColor = dbConnected === null ? 'bg-gray-400' :
        dbConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
            'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'

    const statusText = dbConnected === null ? 'Conectando...' :
        dbConnected ? 'Sistema Online' : 'Sin Conexión'

    return (
        <div className="flex h-screen w-64 flex-col bg-secondary border-r border-border">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
                <Wrench className="h-6 w-6 text-primary" />
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Gestor de SAT</span>
                    <span className="text-xs font-mono text-muted-foreground bg-accent px-2 py-0.5 rounded">
                        v{APP_VERSION}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => onNavigate?.()}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-border p-4">
                {userEmail && (
                    <div className="mb-3 pb-3 border-b border-border flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground truncate flex-1" title={userEmail}>
                            {userEmail}
                        </p>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                    <div className={cn("h-2 w-2 rounded-full transition-all", statusColor)} />
                    <span className="text-xs font-medium text-muted-foreground">
                        {statusText}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Gestión SAT
                </p>
            </div>
        </div>
    )
}
