import prisma from '@/lib/prisma'

let setupAttempted = false
let setupSuccessful = false

/**
 * One-time database schema sync on app startup using raw SQL
 * This runs after deployment when the app starts for the first time
 */
export async function initializeDatabase() {
    if (setupAttempted) {
        return setupSuccessful
    }

    setupAttempted = true

    console.log('🔍 Checking database connection and initializing schema...')

    if (!process.env.DATABASE_URL) {
        console.warn('⚠️  DATABASE_URL not configured')
        return false
    }

    try {
        console.log('🔧 Synchronizing database schema using SQL...')

        // Technician Table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS Technician (
                id VARCHAR(191) PRIMARY KEY,
                name VARCHAR(191) NOT NULL,
                isActive BOOLEAN NOT NULL DEFAULT true,
                createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `)

        // Repair Table
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

        // Settings Table
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

        console.log('✅ Database schema synchronized successfully via SQL')
        setupSuccessful = true
        return true
    } catch (error) {
        console.error('❌ Database setup failed:', error)
        // Don't crash the app - let it start anyway
        return false
    }
}
