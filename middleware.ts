import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    // Hardcoded keys for stability
    const supabaseUrl = 'https://adhvtuqtfpdrinyfmoll.supabase.co'
    const supabaseAnonKey = 'sb_publishable_e6tCGLg_GR6RmZzn6Z5nUg_l1m8OODq'

    const res = NextResponse.next()

    try {
        const supabase = createMiddlewareClient({ req, res }, {
            supabaseUrl,
            supabaseKey: supabaseAnonKey
        })
        const { data: { session } } = await supabase.auth.getSession()

        // Protected routes logic
        if (!session && req.nextUrl.pathname !== '/login') {
            return NextResponse.redirect(new URL('/login', req.url))
        }

        if (session && req.nextUrl.pathname === '/login') {
            return NextResponse.redirect(new URL('/', req.url))
        }
    } catch (e) {
        // If middleware fails, allow temporary access or redirect to login
        console.error('Middleware auth check failed', e)
        if (req.nextUrl.pathname !== '/login') {
            return NextResponse.redirect(new URL('/login', req.url))
        }
    }

    return res
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/health (health check)
         * - api/setup (setup routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/health|api/setup|_next/static|_next/image|favicon.ico).*)',
    ],
}
