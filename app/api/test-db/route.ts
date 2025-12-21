import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        console.log('🔍 Testing Database Connection...')

        // 1. Simple query to test connection
        const result = await prisma.$queryRaw`SELECT version();`

        // 2. Check if tables exist
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `

        // 3. Check for technicians count
        const techCount = await prisma.technician.count()

        return NextResponse.json({
            status: 'success',
            connection: 'Connected to PostgreSQL',
            version: result,
            tables: tables,
            technicianCount: techCount,
            environment: process.env.NODE_ENV,
            db_url_configured: !!process.env.DATABASE_URL
        })
    } catch (error: any) {
        console.error('❌ Database Test Failed:', error)
        return NextResponse.json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message,
            code: error.code,
            stack: error.stack
        }, { status: 500 })
    }
}
