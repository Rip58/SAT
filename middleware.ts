import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()

    let session = null
    try {
        const supabase = createMiddlewareClient({ req, res })
        const { data } = await supabase.auth.getSession()
        session = data.session
    } catch (e) {
        console.error('Middleware auth check failed', e)
    }

    // Protected routes logic
    if (!session && req.nextUrl.pathname !== '/login') {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (session && req.nextUrl.pathname === '/login') {
        const url = req.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return res
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/health (health check)
         * - api/setup-db-pg (setup route)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/health|api/setup-db-pg|_next/static|_next/image|favicon.ico).*)',
    ],
}
