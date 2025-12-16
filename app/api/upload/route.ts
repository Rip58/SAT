import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No se proporcionó ningún archivo' },
                { status: 400 }
            )
        }

        // Check if Vercel Blob token is present
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            // Upload to Vercel Blob
            const blob = await put(file.name, file, {
                access: 'public',
            })
            return NextResponse.json({ url: blob.url })
        } else {
            // Fallback: Save locally to public/uploads
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Ensure directory exists
            const uploadDir = join(process.cwd(), 'public', 'uploads')
            await mkdir(uploadDir, { recursive: true })

            // Create unique filename to avoid collisions
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
            const filename = file.name.replace(/\.[^/.]+$/, "") + '-' + uniqueSuffix + '.' + file.name.split('.').pop()
            const filepath = join(uploadDir, filename)

            await writeFile(filepath, buffer)

            // Return local URL
            return NextResponse.json({ url: `/uploads/${filename}` })
        }
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
            { error: 'Error al subir el archivo' },
            { status: 500 }
        )
    }
}
