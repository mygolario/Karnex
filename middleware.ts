import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authConfig } from './auth.config'
import NextAuth from 'next-auth'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // Simple debug logging
  console.log('Middleware Request:', req.nextUrl.pathname)
  // return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
