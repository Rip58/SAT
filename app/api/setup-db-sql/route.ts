import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/setup-db-sql - Create database schema using raw SQL
export async function GET() {
    try {
        console.log('🔄 Starting SQL-based database setup...')

        // Create tables using raw SQL
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS Technician (
                id VARCHAR(191) PRIMARY KEY,
                name VARCHAR(191) NOT NULL,
                isActive BOOLEAN NOT NULL DEFAULT true,
                createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `)

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS Repair (
                id VARCHAR(191) PRIMARY KEY,
                operationNumber VARCHAR(191) UNIQUE NOT NULL,
                entryDate DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                exitDate DATETIME(3),
                status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
                customerName VARCHAR(191),
                customerSurname VARCHAR(191),
                customerPhone VARCHAR(191) NOT NULL,
                customerEmail VARCHAR(191) NOT NULL,
                hasWhatsApp BOOLEAN NOT NULL DEFAULT false,
                brand VARCHAR(191),
                model VARCHAR(191),
                serialNumber VARCHAR(191),
                assignedTechnicianId VARCHAR(191),
                invoiceNumber VARCHAR(191),
                issueDescription TEXT,
                technicalDiagnosis TEXT,
                repairResult TEXT,
                imageUrls JSON NOT NULL DEFAULT ('[]'),
                createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                INDEX idx_status (status),
                INDEX idx_operationNumber (operationNumber),
                INDEX idx_customerPhone (customerPhone),
                INDEX idx_customerEmail (customerEmail),
                FOREIGN KEY (assignedTechnicianId) REFERENCES Technician(id) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `)

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS Settings (
                id VARCHAR(191) PRIMARY KEY DEFAULT 'settings',
                passwordHash VARCHAR(191),
                companyName VARCHAR(191) NOT NULL DEFAULT 'Gestor de SAT',
                companyAddress VARCHAR(191),
                companyPhone VARCHAR(191),
                companyEmail VARCHAR(191),
                serviceConditions TEXT,
                securityPin VARCHAR(191),
                createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `)

        console.log('✅ Database schema created successfully')

        return NextResponse.json({
            status: 'success',
            message: 'Database initialized successfully using SQL',
            tables: ['Technician', 'Repair', 'Settings']
        })
    } catch (error: any) {
        console.error('❌ Database setup failed:', error)
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to initialize database',
                error: error.message,
                code: error.code
            },
            { status: 500 }
        )
    }
}
