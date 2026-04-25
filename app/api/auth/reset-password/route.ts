import { NextResponse } from "next/server"
import { getAdminUsersCollection } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"
import { validatePassword } from "@/lib/admin-types"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password, confirmPassword } = body

    if (!token) {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 })
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.ok) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    const adminUsers = await getAdminUsersCollection()

    // Find user with reset token
    const user = await adminUsers.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link" },
        { status: 400 }
      )
    }

    // Hash new password
    const newPasswordHash = await hashPassword(password)

    // Update password and clear reset token
    const updateResult = await adminUsers.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        },
        $unset: {
          resetToken: "",
          resetTokenExpires: "",
        },
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: "Password reset successful! You can now log in with your new password.",
    })
  } catch (error) {
    console.error("[Reset Password] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
