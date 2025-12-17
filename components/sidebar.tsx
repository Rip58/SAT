'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, List, Settings, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_VERSION } from '@/lib/constants'
import { useEffect, useState } from 'react'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Nueva Reparación', href: '/nueva-reparacion', icon: FileText },
    { name: 'Listado de Reparaciones', href: '/reparaciones', icon: List },
    { name: 'Ajustes', href: '/ajustes', icon: Settings },
]

export default function Sidebar() {
    const pathname = usePathname()
    // Add state for DB health
    const [dbConnected, setDbConnected] = useState<boolean | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        checkHealth()
        // Poll every 30 seconds
        const interval = setInterval(checkHealth, 30000)
        return () => clearInterval(interval)
    }, [])

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

    // Determine status color/shadow
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
            <div className="mt-auto border-t border-gray-200 p-4 space-y-2">
                {/* DB Status Indicator - Only show after mount */}
                {mounted && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className={cn("w-2 h-2 rounded-full transition-all", statusColor)} />
                        <span>{statusText}</span>
                    </div>
                )}

                {/* Version - Static, no hydration issue */}
                <div className="text-xs text-gray-500">
                    Versión {APP_VERSION}
                </div>
            </div>
        </div>
    )
}
