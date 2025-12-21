import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const isLoginPage = req.nextUrl.pathname === '/login'

    let session = null
    try {
        const supabase = createMiddlewareClient({ req, res })
        const { data } = await supabase.auth.getSession()
        session = data.session

        console.log('[Middleware]', {
            path: req.nextUrl.pathname,
            hasSession: !!session,
            userEmail: session?.user?.email
        })
    } catch (e) {
        console.error('[Middleware] Auth check failed:', e)
    }

    // If no session and trying to access protected route, redirect to login
    if (!session && !isLoginPage) {
        console.log('[Middleware] No session, redirecting to /login')
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // If has session and trying to access login, redirect to dashboard
    if (session && isLoginPage) {
        console.log('[Middleware] Has session, redirecting to /')
        return NextResponse.redirect(new URL('/', req.url))
    }

    return res
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - /api/* (all API routes)
         * - /_next/static (static files)
         * - /_next/image (image optimization)
         * - /favicon.ico
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
