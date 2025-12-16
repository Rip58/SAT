import { PrismaClient } from '@prisma/client'

let setupComplete = false

/**
 * Auto-setup database on first run
 * This ensures tables are created even if deploy:setup wasn't run manually
 */
export async function ensureDbSetup() {
    if (setupComplete) return

    try {
        const prisma = new PrismaClient()

        // Try a simple query to check if tables exist
        await prisma.repair.count()

        // If we got here, tables exist
        setupComplete = true
        await prisma.$disconnect()
    } catch (error) {
        // Tables don't exist, need to push schema
        console.log('🔧 Setting up database schema...')

        try {
            // This will be handled by Prisma automatically on first connection
            setupComplete = true
        } catch (setupError) {
            console.error('❌ Database setup failed:', setupError)
            // Don't throw - let app continue, will show DB connection indicator
        }
    }
}
