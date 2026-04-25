import { NextResponse } from "next/server"
import { getAdminUsersCollection } from "@/lib/mongodb"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token } = body

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    const adminUsers = await getAdminUsersCollection()

    // Find user with verification token
    const user = await adminUsers.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 })
    }

    // Mark email as verified and clear token
    const updateResult = await adminUsers.updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          updatedAt: new Date(),
        },
        $unset: {
          verificationToken: "",
          verificationTokenExpires: "",
        },
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: "Email verified successfully! You can now log in.",
    })
  } catch (error) {
    console.error("[Verify Email] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
