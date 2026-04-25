import { Metadata } from "next"
import Link from "next/link"
import { Car } from "lucide-react"
import { PasswordResetForm } from "@/components/admin/password-reset-form"

export const metadata: Metadata = {
  title: "Reset Password | DCMotors Admin",
  description: "Reset your admin account password",
}

export default function ResetPasswordPage() {
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
            <h1 className="font-serif text-2xl font-semibold">Reset Password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          <PasswordResetForm />
        </div>
      </div>
    </main>
  )
}
