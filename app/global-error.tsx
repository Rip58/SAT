'use client'

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)

        // Check if it's a chunk load error
        if (error.message.includes('Loading chunk') || error.message.includes('Minified React error')) {
            window.location.reload()
        }
    }, [error])

    return (
        <html>
            <body>
                <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
                    <h2 className="text-xl font-semibold">Algo salió mal</h2>
                    <p className="text-muted-foreground">Estamos recargando la aplicación...</p>
                    <button
                        className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                        onClick={() => window.location.reload()}
                    >
                        Recargar página
                    </button>
                </div>
            </body>
        </html>
    )
}
