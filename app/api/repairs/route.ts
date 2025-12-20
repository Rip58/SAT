import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
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

        // Build where clause
        const where: any = {}

        if (status && status !== 'all') {
            where.status = status
        }

        if (search) {
            const lowerSearch = search.toLowerCase()
            where.OR = [
                { customerName: { contains: lowerSearch } },
                { customerSurname: { contains: lowerSearch } },
                { customerPhone: { contains: search } },
                { customerEmail: { contains: lowerSearch } },
                { operationNumber: { contains: lowerSearch } },
            ]
        }

        console.log('🔧 Where clause:', JSON.stringify(where))

        const repairs = await prisma.repair.findMany({
            where,
            include: {
                assignedTechnician: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        console.log('🔧 Found repairs:', repairs.length)

        return NextResponse.json(repairs)
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
        // Find last repair by operation number to increment
        const lastRepair = await prisma.repair.findFirst({
            orderBy: {
                operationNumber: 'desc'
            }
        })

        const operationNumber = generateOperationNumber(lastRepair?.operationNumber)

        // Create repair
        const newRepair = await prisma.repair.create({
            data: {
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
                status: validatedData.status as any, // Cast to enum
                entryDate: validatedData.entryDate ? new Date(validatedData.entryDate) : new Date(),
                exitDate: validatedData.exitDate ? new Date(validatedData.exitDate) : null,
                imageUrls: validatedData.imageUrls,
            }
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
