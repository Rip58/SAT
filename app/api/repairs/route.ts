import { NextRequest, NextResponse } from 'next/server'
import { localDb } from '@/lib/local-db'
import { repairSchema } from '@/lib/validations'
import { generateOperationNumber } from '@/lib/utils'

// GET /api/repairs - List all repairs with optional status filter
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')
        const search = searchParams.get('search')

        let repairs = await localDb.getRepairs()

        // Filter by status
        if (status && status !== 'all') {
            repairs = repairs.filter(r => r.status === status)
        }

        // Filter by search term
        if (search) {
            const lowerSearch = search.toLowerCase()
            repairs = repairs.filter(r =>
                (r.customerName?.toLowerCase().includes(lowerSearch) || false) ||
                (r.customerSurname?.toLowerCase().includes(lowerSearch) || false) ||
                r.customerPhone.includes(search) ||
                r.customerEmail.toLowerCase().includes(lowerSearch) ||
                r.operationNumber.toLowerCase().includes(lowerSearch)
            )
        }

        // Sort by createdAt desc
        repairs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        // Get technicians to populate assignedTechnician (simulate include)
        const technicians = await localDb.getTechnicians()
        const repairsWithTech = repairs.map(r => ({
            ...r,
            assignedTechnician: technicians.find(t => t.id === r.assignedTechnicianId) || null
        }))

        return NextResponse.json(repairsWithTech)
    } catch (error) {
        console.error('Error fetching repairs:', error)
        return NextResponse.json(
            { error: 'Error al obtener las reparaciones' },
            { status: 500 }
        )
    }
}

// POST /api/repairs - Create a new repair
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = repairSchema.parse(body)

        // Generate operation number
        const repairs = await localDb.getRepairs()
        // Sort by operation number desc to find last
        const sortedRepairs = [...repairs].sort((a, b) =>
            b.operationNumber.localeCompare(a.operationNumber)
        )
        const lastRepair = sortedRepairs[0]

        const operationNumber = generateOperationNumber(lastRepair?.operationNumber)

        // Create repair
        const newRepair = await localDb.createRepair({
            operationNumber,
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
            entryDate: validatedData.entryDate ? new Date(validatedData.entryDate) : new Date(),
            exitDate: validatedData.exitDate ? new Date(validatedData.exitDate) : null,
            imageUrls: validatedData.imageUrls,
        })

        return NextResponse.json(newRepair, { status: 201 })
    } catch (error: any) {
        console.error('Error creating repair:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Error al crear la reparación: ' + (error.message || 'Error desconocido') },
            { status: 500 }
        )
    }
}
