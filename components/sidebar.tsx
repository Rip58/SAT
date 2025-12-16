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
        <div className="border-t border-border p-4">
            <div className="flex items-center gap-2 mb-2">
                <div className={`h-2 w-2 rounded-full ${dbConnected === null ? 'bg-gray-400' :
                    dbConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                        'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                    }`} />
                <span className="text-xs font-medium text-muted-foreground">
                    {dbConnected === null ? 'Conectando...' :
                        dbConnected ? 'Sistema Online' : 'Sin Conexión'}
                </span>
            </div>
            <p className="text-xs text-muted-foreground">
                Actualizado: {new Date().toLocaleDateString('es-ES')}
            </p>
        </div>
    </div>
)
    }
