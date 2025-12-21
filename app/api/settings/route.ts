import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/settings - Get settings
export async function GET() {
    try {
        const settings = await prisma.settings.findFirst()

        // Return default if no settings exist
        if (!settings) {
            return NextResponse.json({
                id: 'default',
                securityPin: '0000',
                serviceConditions: 'Condiciones de servicio por defecto'
            })
        }

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

        // Try to update existing settings, or create if none exist
        const existing = await prisma.settings.findFirst()

        let settings
        if (existing) {
            settings = await prisma.settings.update({
                where: { id: existing.id },
                data: {
                    serviceConditions: body.serviceConditions,
                    securityPin: body.securityPin
                }
            })
        } else {
            settings = await prisma.settings.create({
                data: {
                    serviceConditions: body.serviceConditions,
                    securityPin: body.securityPin || '0000'
                }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error updating settings:', error)
        return NextResponse.json(
            { error: 'Error al actualizar la configuración' },
            { status: 500 }
        )
    }
}
