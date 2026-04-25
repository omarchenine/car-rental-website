import { NextResponse } from "next/server"
import { getUsersCollection } from "@/lib/mongodb"
import { validateEmail } from "@/lib/user-types"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }

    // Get users collection
    const users = await getUsersCollection()

    // Find user with matching token and check expiration
    const user = await users.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      )
    }

    // Update user - mark as verified and clear token
    const result = await users.updateOne(
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

    if (!result.modifiedCount) {
      return NextResponse.json(
        { error: "Failed to verify email" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Email verified successfully",
        email: user.email,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Verify Email] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
