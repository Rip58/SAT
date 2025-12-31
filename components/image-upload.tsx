'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
    onUpload: (urls: string[]) => void
    existingUrls?: string[]
}

export default function ImageUpload({ onUpload, existingUrls = [] }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [imageUrls, setImageUrls] = useState<string[]>(existingUrls)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                // 1. Get Presigned URL
                const presignResponse = await fetch('/api/upload/presigned', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: file.name,
                        contentType: file.type
                    })
                })

                if (!presignResponse.ok) throw new Error('Failed to get upload URL')
                const { uploadUrl, publicUrl } = await presignResponse.json()

                // 2. Upload directly to S3
                const uploadResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type,
                        'x-amz-acl': 'public-read' // Just in case, though handled in presign
                    }
                })

                if (!uploadResponse.ok) throw new Error('Failed to upload to storage')

                return publicUrl
            })

            const urls = await Promise.all(uploadPromises)
            const newUrls = [...imageUrls, ...urls]
            setImageUrls(newUrls)
            onUpload(newUrls)
        } catch (error) {
            console.error('Error uploading images:', error)
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            alert(`Error al subir las imágenes: ${errorMessage}`)
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const removeImage = (index: number) => {
        const newUrls = imageUrls.filter((_, i) => i !== index)
        setImageUrls(newUrls)
        onUpload(newUrls)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="button-secondary flex items-center gap-2"
                >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Subiendo...' : 'Subir Imágenes'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                            <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
                                <Image
                                    src={url}
                                    alt={`Upload ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4 text-destructive-foreground" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
