import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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
        if (!s3Client) {
            return NextResponse.json({ error: 'S3 Client not configured' }, { status: 500 })
        }

        const body = await request.json()
        const { filename, contentType } = body

        // Clean filename and make unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const cleanFilename = filename.replace(/\s+/g, '-')
        const key = `${uniqueSuffix}-${cleanFilename}`

        // Get bucket name, handling quotes if they exist in env
        const bucketName = (process.env.SUPABASE_BUCKET_NAME || 'SAT').replace(/['"]/g, '')

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: contentType,
            ACL: 'public-read',
        })

        // Generate signed URL (valid for 5 minutes)
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

        // Construct public URL
        const endpointUrl = new URL(process.env.SUPABASE_ENDPOINT!)
        const projectBase = endpointUrl.origin
        const publicUrl = `${projectBase}/storage/v1/object/public/${bucketName}/${key}`

        return NextResponse.json({ uploadUrl, publicUrl })

    } catch (error) {
        console.error('Error generating presigned URL:', error)
        return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
    }
}
