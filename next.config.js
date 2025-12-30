/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.public.blob.vercel-storage.com',
            },
            {
                protocol: 'https',
                hostname: 'adhvtuqtfpdrinyfmoll.storage.supabase.co',
            },
        ],
    },
}

module.exports = nextConfig
