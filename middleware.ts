import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SESSION_COOKIE = "dealer_session"

async function isAuthenticated(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const secret = process.env.JWT_SECRET
  if (!secret) return false
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    return payload.sub === "admin"
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get(SESSION_COOKIE)?.value
    const authed = await isAuthenticated(token)
    if (!authed) {
      const url = req.nextUrl.clone()
      url.pathname = "/admin/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  // Protect mutating API routes
  if (pathname.startsWith("/api/cars") && req.method !== "GET") {
    const token = req.cookies.get(SESSION_COOKIE)?.value
    if (!(await isAuthenticated(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }
  if (pathname.startsWith("/api/upload")) {
    const token = req.cookies.get(SESSION_COOKIE)?.value
    if (!(await isAuthenticated(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/cars/:path*", "/api/upload/:path*"],
}
