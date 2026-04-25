import { Metadata } from "next"
import Link from "next/link"
import { UserEmailVerificationForm } from "@/components/user/email-verification-form"
import { Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Verify Email | DCMotors",
  description: "Verify your email address to complete registration.",
}

export const dynamic = "force-dynamic"

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-primary text-primary-foreground font-bold">
              DC
            </div>
            <span className="font-semibold text-lg">DCMotors</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
              <Mail className="h-8 w-8" aria-hidden="true" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Verify Your Email
            </h1>
            <p className="text-muted-foreground">
              We&apos;ve sent a verification link to your email address. Click the button below to confirm your email and activate your account.
            </p>
          </div>

          {/* Form */}
          <UserEmailVerificationForm />

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Having trouble?
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Create a new account
                </Link>
              </p>
              <p>
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Return to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
