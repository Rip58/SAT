/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        DATABASE_URL: "postgresql://postgres:vacfa4-ruhdok-peSbef@db.adhvtuqtfpdrinyfmoll.supabase.co:5432/postgres",
        NEXT_PUBLIC_SUPABASE_URL: "https://adhvtuqtfpdrinyfmoll.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkaHZ0dXF0ZnBkcmlueWZtb2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTc3NTcsImV4cCI6MjA4MTgzMzc1N30.dotYR5drO6huQed-iXjrwShjCunV0YQGISIVV9AKB0E"
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.public.blob.vercel-storage.com',
            },
        ],
    },
}

module.exports = nextConfig
