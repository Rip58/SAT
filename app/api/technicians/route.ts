import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Basic schema for validation
const technicianSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres')
})

// GET /api/technicians - List all technicians
export async function GET() {
    try {
        const technicians = await prisma.technician.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json(technicians)
    } catch (error) {
        console.error('Error fetching technicians:', error)
        return NextResponse.json(
            { error: 'Error al obtener los técnicos' },
            { status: 500 }
        )
    }
}

// POST /api/technicians - Create a new technician
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validated = technicianSchema.parse(body)

        const newTechnician = await prisma.technician.create({
            data: {
                name: validated.name
            }
        })

        return NextResponse.json(newTechnician, { status: 201 })
    } catch (error: any) {
        console.error('Error creating technician:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Error al crear el técnico' },
            { status: 500 }
        )
    }
}

// DELETE /api/technicians - Delete a technician
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'ID de técnico requerido' },
                { status: 400 }
            )
        }

        await prisma.technician.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting technician:', error)
        return NextResponse.json(
            { error: 'Error al eliminar el técnico' },
            { status: 500 }
        )
    }
}
