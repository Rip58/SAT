import { NextRequest, NextResponse } from 'next/server'
import { localDb } from '@/lib/local-db'
import { repairSchema } from '@/lib/validations'

// GET /api/repairs/[id] - Get a single repair
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const repair = await localDb.getRepairById(params.id)

        if (!repair) {
            return NextResponse.json(
                { error: 'Reparación no encontrada' },
                { status: 404 }
            )
        }

        // Populate technician
        const technicians = await localDb.getTechnicians()
        const repairWithTech = {
            ...repair,
            assignedTechnician: technicians.find(t => t.id === repair.assignedTechnicianId) || null
        }

        return NextResponse.json(repairWithTech)
    } catch (error) {
        console.error('Error fetching repair:', error)
        return NextResponse.json(
            { error: 'Error al obtener la reparación' },
            { status: 500 }
        )
    }
}

// PUT /api/repairs/[id] - Update a repair
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = repairSchema.parse(body)

        // Update repair
        const repair = await localDb.updateRepair(params.id, {
            customerPhone: validatedData.customerPhone,
            customerEmail: validatedData.customerEmail,
            customerName: validatedData.customerName || null,
            customerSurname: validatedData.customerSurname || null,
            hasWhatsApp: validatedData.hasWhatsApp,
            brand: validatedData.brand || null,
            model: validatedData.model || null,
            serialNumber: validatedData.serialNumber || null,
            assignedTechnicianId: validatedData.assignedTechnicianId || null,
            invoiceNumber: validatedData.invoiceNumber || null,
            issueDescription: validatedData.issueDescription || null,
            technicalDiagnosis: validatedData.technicalDiagnosis || null,
            repairResult: validatedData.repairResult || null,
            status: validatedData.status,
            entryDate: validatedData.entryDate ? new Date(validatedData.entryDate) : undefined,
            exitDate: validatedData.exitDate ? new Date(validatedData.exitDate) : null,
            imageUrls: validatedData.imageUrls,
        })

        // Populate technician for consistency
        const technicians = await localDb.getTechnicians()
        const repairWithTech = {
            ...repair,
            assignedTechnician: technicians.find(t => t.id === repair.assignedTechnicianId) || null
        }

        return NextResponse.json(repairWithTech)
    } catch (error: any) {
        console.error('Error updating repair:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            )
        }

        if (error.message === 'Repair not found') {
            return NextResponse.json(
                { error: 'Reparación no encontrada' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: 'Error al actualizar la reparación' },
            { status: 500 }
        )
    }
}

// DELETE /api/repairs/[id] - Delete a repair
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await localDb.deleteRepair(params.id)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting repair:', error)

        if (error.message === 'Repair not found') {
            return NextResponse.json(
                { error: 'Reparación no encontrada' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: 'Error al eliminar la reparación' },
            { status: 500 }
        )
    }
}
