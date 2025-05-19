import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'

// This middleware updates the Supabase session and enforces RBAC with logging for compliance.
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient({ req, res })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Basic data access logging (could be extended to a table/log service)
  if (user) {
    // Example: log route and user email for compliance
    // In production, store this in a Supabase table via API route/server action
    console.info(`[COMPLIANCE LOG] User: ${user.email}, Path: ${req.nextUrl.pathname}, Time: ${new Date().toISOString()}`)
  }

  // RBAC: Only allow admins to access certain /admin routes
  if (req.nextUrl.pathname.startsWith('/(admin)')) {
    if (!user || !(user.user_metadata?.is_admin || user?.role === 'admin')) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  // Enforce RLS: All sensitive tables in Supabase must have RLS enabled and policies set (see migrations)

  return res
}

export const config = {
  matcher: [
    '/(admin)/:path*', // Protect all /admin routes
    // Optionally add more routes as needed
  ],
}
