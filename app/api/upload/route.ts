import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Initialize S3 Client for Supabase
const s3Client = process.env.SUPABASE_ACCESS_KEY_ID && process.env.SUPABASE_ENDPOINT
    ? new S3Client({
        forcePathStyle: true,
        region: process.env.SUPABASE_REGION || 'eu-west-1',
        endpoint: process.env.SUPABASE_ENDPOINT,
        credentials: {
            accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID!,
            secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY!,
        },
    })
    : null

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

        // 1. Try Supabase Storage (S3)
        if (s3Client && process.env.SUPABASE_BUCKET_NAME) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
            const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, '-')}`

            // Remove quotes if present in bucket name env var (common issue)
            const bucketName = (process.env.SUPABASE_BUCKET_NAME || 'SAT').replace(/['"]/g, '')

            try {
                await s3Client.send(new PutObjectCommand({
                    Bucket: bucketName,
                    Key: filename,
                    Body: buffer,
                    ContentType: file.type,
                    ACL: 'public-read',
                }))

                // Construct Public URL
                // Format: https://<project_id>.storage.supabase.co/storage/v1/object/public/<bucket>/<key>
                // We can derive project ID from endpoint or just use hardcoded base if generic

                // Parse endpoint to get base
                const endpointUrl = new URL(process.env.SUPABASE_ENDPOINT!)
                // The passed endpoint is usually .../storage/v1/s3
                // Public URL is typically .../storage/v1/object/public/...

                // Let's try to construct it robustly
                const projectBase = endpointUrl.origin // https://adhvtuqtfpdrinyfmoll.storage.supabase.co
                const publicUrl = `${projectBase}/storage/v1/object/public/${bucketName}/${filename}`

                return NextResponse.json({ url: publicUrl })
            } catch (s3Error) {
                console.error('Supabase S3 upload failed:', s3Error)
                // Continue to fallbacks if S3 fails
            }
        }

        // 2. Fallback to Vercel Blob
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            const blob = await put(file.name, file, {
                access: 'public',
            })
            return NextResponse.json({ url: blob.url })
        }

        // 3. Fallback to Local Storage
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const filename = file.name.replace(/\.[^/.]+$/, "") + '-' + uniqueSuffix + '.' + file.name.split('.').pop()
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        return NextResponse.json({ url: `/uploads/${filename}` })

    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
            { error: 'Error al subir el archivo' },
            { status: 500 }
        )
    }
}
