import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

// GET /api/setup-db - Run prisma db push
export async function GET() {
    try {
        console.log('🔄 Starting database setup...')
        console.log('📁 Working directory:', process.cwd())

        // Build absolute path to prisma binary
        const prismaBinary = path.join(process.cwd(), 'node_modules', '.bin', 'prisma')
        console.log('🔍 Prisma binary path:', prismaBinary)

        // Try with absolute path first
        const command = `"${prismaBinary}" db push --accept-data-loss --skip-generate`

        console.log('⚡ Executing command:', command)

        const { stdout, stderr } = await execAsync(command, {
            cwd: process.cwd(),
            env: { ...process.env }
        })

        console.log('✅ Database setup completed')
        console.log('stdout:', stdout)
        if (stderr) console.error('stderr:', stderr)

        return NextResponse.json({
            status: 'success',
            message: 'Database initialized successfully',
            details: {
                stdout,
                stderr,
                workingDir: process.cwd(),
                binaryPath: prismaBinary
            }
        })
    } catch (error: any) {
        console.error('❌ Database setup failed:', error)
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to initialize database',
                error: error.message,
                details: error.stderr || error.stdout,
                workingDir: process.cwd()
            },
            { status: 500 }
        )
    }
}
