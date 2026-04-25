import { NextResponse } from "next/server"
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth"
import { getAdminUsersCollection } from "@/lib/mongodb"
import { validateLogin } from "@/lib/admin-types"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    // Validate input
    const validation = validateLogin({ email, password })
    if (!validation.ok) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 })
    }

    // Add delay to slow brute-force attacks
    await new Promise((r) => setTimeout(r, 300))

    const adminUsers = await getAdminUsersCollection()

    // Find user by email
    const user = await adminUsers.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: "Email not verified. Check your email for verification link." }, { status: 403 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login
    await adminUsers.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    )

    // Create session
    const token = await createSessionToken()
    await setSessionCookie(token)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[Login] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

