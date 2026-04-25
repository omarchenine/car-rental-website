import { NextResponse } from "next/server"
import { getAdminUsersCollection } from "@/lib/mongodb"
import { generateSecureToken } from "@/lib/crypto"
import { sendPasswordResetEmail } from "@/lib/email-service"
import { validateEmail } from "@/lib/admin-types"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.ok) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    const adminUsers = await getAdminUsersCollection()

    // Find user by email
    const user = await adminUsers.findOne({ email: email.toLowerCase() })

    if (!user) {
      // Don't reveal whether email exists (security best practice)
      return NextResponse.json(
        {
          ok: true,
          message: "If an account exists with this email, a password reset link has been sent.",
        },
        { status: 200 }
      )
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Account not verified. Please verify your email first." },
        { status: 400 }
      )
    }

    // Generate reset token
    const resetToken = generateSecureToken()
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Update user with reset token
    await adminUsers.updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpires,
          updatedAt: new Date(),
        },
      }
    )

    // Send reset email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dcmotors.vercel.app"
    const resetLink = `${siteUrl}/admin/reset-password?token=${resetToken}`
    await sendPasswordResetEmail(email, resetLink)

    return NextResponse.json({
      ok: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("[Request Reset] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
