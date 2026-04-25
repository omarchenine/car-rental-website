import { NextResponse } from "next/server"
import { getAdminUsersCollection } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"
import { generateSecureToken } from "@/lib/crypto"
import { sendVerificationEmail } from "@/lib/email-service"
import { validateRegister } from "@/lib/admin-types"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, confirmPassword } = body

    // Validate input
    const validation = validateRegister({ email, password, confirmPassword })
    if (!validation.ok) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 })
    }

    // Get admin users collection
    const adminUsers = await getAdminUsersCollection()

    // Check if email already registered
    const existingUser = await adminUsers.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate verification token
    const verificationToken = generateSecureToken()
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create admin user
    const result = await adminUsers.insertOne({
      email: email.toLowerCase(),
      passwordHash,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    if (!result.insertedId) {
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }

    // Send verification email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dcmotors.vercel.app"
    const verificationLink = `${siteUrl}/admin/verify-email?token=${verificationToken}`
    const emailSent = await sendVerificationEmail(email, verificationLink)

    if (!emailSent) {
      // User created but email failed - they can request resend
      return NextResponse.json(
        {
          ok: true,
          message: "Account created, but verification email failed to send. Please try resending.",
          needsResend: true,
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Account created! Check your email for verification link.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Register] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
