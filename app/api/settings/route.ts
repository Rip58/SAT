import { NextRequest, NextResponse } from 'next/server'
import { localDb } from '@/lib/local-db'

// GET /api/settings - Get settings
export async function GET() {
    try {
        const settings = await localDb.getSettings()
        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json(
            { error: 'Error al obtener la configuración' },
            { status: 500 }
        )
    }
}

// POST /api/settings - Update settings
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const settings = await localDb.updateSettings({
            serviceConditions: body.serviceConditions,
            securityPin: body.securityPin
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error updating settings:', error)
        return NextResponse.json(
            { error: 'Error al actualizar la configuración' },
            { status: 500 }
        )
    }
}
