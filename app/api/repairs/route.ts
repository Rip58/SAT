import { NextRequest, NextResponse } from 'next/server'
import { localDb } from '@/lib/local-db'
import { repairSchema } from '@/lib/validations'
import { generateOperationNumber } from '@/lib/utils'

// GET /api/repairs - List all repairs with optional status filter
export async function GET(request: NextRequest) {
    try {
        console.log('🔧 Repairs API called')
        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get('status')
        const search = searchParams.get('search')

        console.log('🔧 Filters:', { status, search })

        let repairs = await localDb.getRepairs()
        const technicians = await localDb.getTechnicians()

        // Populate technicians
        let populatedRepairs = repairs.map(repair => ({
            ...repair,
            assignedTechnician: technicians.find(t => t.id === repair.assignedTechnicianId) || null
        }))

        // Apply filters
        if (status && status !== 'all') {
            populatedRepairs = populatedRepairs.filter(r => r.status === status)
        }

        if (search) {
            const lowerSearch = search.toLowerCase()
            populatedRepairs = populatedRepairs.filter(r =>
                (r.customerName?.toLowerCase().includes(lowerSearch)) ||
                (r.customerSurname?.toLowerCase().includes(lowerSearch)) ||
                (r.customerPhone?.includes(search)) ||
                (r.customerEmail?.toLowerCase().includes(lowerSearch)) ||
                (r.operationNumber?.toLowerCase().includes(lowerSearch))
            )
        }

        // Sort by created date desc (already sorted by localDb but good to ensure)
        populatedRepairs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        console.log('🔧 Found repairs:', populatedRepairs.length)

        return NextResponse.json(populatedRepairs)
    } catch (error) {
        console.error('❌ Error fetching repairs:', error)
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
        // Find last repair by operation number to increment/generate
        // We get all repairs to find the max operation number
        const allRepairs = await localDb.getRepairs()
        // Sort by op number desc just to be sure we find the "last" one logic
        // Though generateOperationNumber might handle independent logic, usually it needs the "last string"

        // Let's find the repair with the "highest" operation number. 
        // Assuming format is predictable or just taking the most recent one might be enough if strictly sequential.
        // But localDb.getRepairs returns list.

        // Simple strategy: Sort by operationNumber string (if comparable) or just pass top one if sorted.
        // localDb returns unshift() so index 0 is newest.
        const lastRepair = allRepairs.length > 0 ? allRepairs[0] : null

        // Wait, if we use unshift, index 0 is newest created. But operation number could be manually set?
        // Let's assume index 0 has the latest OP number if we strictly follow creation order. 
        // Better: find max op number just in case.
        // But for now, sticking to logic similar to Prisma 'orderBy opNumber desc'

        const sortedByOp = [...allRepairs].sort((a, b) =>
            (b.operationNumber || '').localeCompare(a.operationNumber || '')
        )
        const highestOpRepair = sortedByOp.length > 0 ? sortedByOp[0] : null

        const operationNumber = generateOperationNumber(highestOpRepair?.operationNumber)

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
            status: validatedData.status as any,
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
