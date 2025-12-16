import { NextRequest, NextResponse } from 'next/server'
import { localDb } from '@/lib/local-db'

export async function POST(request: NextRequest) {
    try {
        const { pin } = await request.json()

        if (!pin) {
            return NextResponse.json(
                { error: 'PIN requerido' },
                { status: 400 }
            )
        }

        const settings = await localDb.getSettings()
        const currentPin = settings?.securityPin || '0000' // Fail-safe default

        if (pin === currentPin) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json(
                { error: 'PIN incorrecto' },
                { status: 401 }
            )
        }
    } catch (error) {
        console.error('Error verifying PIN:', error)
        return NextResponse.json(
            { error: 'Error al verificar PIN' },
            { status: 500 }
        )
    }
}
