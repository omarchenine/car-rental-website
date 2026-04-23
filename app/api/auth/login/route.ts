import { NextResponse } from "next/server"
import { createSessionToken, setSessionCookie } from "@/lib/auth"

export const runtime = "nodejs"

// Simple constant-time string compare.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json({ error: "Admin password not configured on the server." }, { status: 500 })
  }

  let password = ""
  try {
    const body = (await req.json()) as { password?: string }
    password = String(body.password ?? "")
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 })
  }

  if (!safeEqual(password, expected)) {
    // Small delay to slow brute-force attempts.
    await new Promise((r) => setTimeout(r, 400))
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 })
  }

  const token = await createSessionToken()
  await setSessionCookie(token)
  return NextResponse.json({ ok: true })
}
