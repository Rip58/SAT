import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// GET /api/setup-db - Run prisma db push
export async function GET() {
    try {
        console.log('🔄 Starting database setup...')

        // Use local prisma binary instead of npx
        // We use --accept-data-loss since it's a new/empty DB usually
        const { stdout, stderr } = await execAsync('./node_modules/.bin/prisma db push --accept-data-loss --skip-generate')

        console.log('✅ Database setup completed')
        console.log('stdout:', stdout)
        if (stderr) console.error('stderr:', stderr)

        return NextResponse.json({
            status: 'success',
            message: 'Database initialized successfully',
            details: {
                stdout,
                stderr
            }
        })
    } catch (error: any) {
        console.error('❌ Database setup failed:', error)
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to initialize database',
                error: error.message,
                details: error.stderr || error.stdout
            },
            { status: 500 }
        )
    }
}
