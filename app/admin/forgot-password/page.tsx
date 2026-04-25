import { Metadata } from "next"
import Link from "next/link"
import { Car } from "lucide-react"
import { ForgotPasswordForm } from "@/components/admin/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password | DCMotors Admin",
  description: "Request a password reset link",
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Car className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-semibold">DCMotors</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Admin
              </span>
            </div>
          </Link>
        </div>

        <div className="px-6 py-8">
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-semibold">Forgot Password?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email address and we&apos;ll send you a password reset link
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  )
}
