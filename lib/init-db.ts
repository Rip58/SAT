import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

let setupAttempted = false
let setupSuccessful = false

/**
 * One-time database schema sync on app startup
 * This runs after deployment when the app starts for the first time
 */
export async function initializeDatabase() {
    if (setupAttempted) {
        return setupSuccessful
    }

    setupAttempted = true

    console.log('🔍 Checking database connection...')

    if (!process.env.DATABASE_URL) {
        console.warn('⚠️  DATABASE_URL not configured')
        return false
    }

    try {
        console.log('🔧 Synchronizing database schema...')
        await execAsync('npx prisma db push --skip-generate --accept-data-loss')
        console.log('✅ Database schema synchronized successfully')
        setupSuccessful = true
        return true
    } catch (error) {
        console.error('❌ Database setup failed:', error)
        // Don't crash the app - let it start anyway
        return false
    }
}
