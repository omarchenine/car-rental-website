import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.ADMIN_EMAIL_FROM || "noreply@dcmotors.vercel.app"

export async function sendVerificationEmail(email: string, verificationLink: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify Your Email - DCMotors Admin",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Welcome to DCMotors Admin Portal!</p>
          <p>Please click the link below to verify your email address:</p>
          <p style="margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </p>
          <p>Or copy this link: <code>${verificationLink}</code></p>
          <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this email, please ignore it.</p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error("[Email Service] Failed to send verification email:", error)
    return false
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset Your Password - DCMotors Admin",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <p style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy this link: <code>${resetLink}</code></p>
          <p style="color: #666; font-size: 12px;">This link expires in 1 hour.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this email, please ignore it and your password will remain unchanged.</p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error("[Email Service] Failed to send password reset email:", error)
    return false
  }
}

export async function sendWelcomeEmail(email: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to DCMotors Admin Portal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to DCMotors Admin</h2>
          <p>Your account has been successfully created and verified.</p>
          <p>You can now log in to the admin portal and manage your bookings and inventory.</p>
          <p style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://dcmotors.vercel.app"}/admin" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Go to Admin Portal
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">If you have any questions, please contact us.</p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error("[Email Service] Failed to send welcome email:", error)
    return false
  }
}
