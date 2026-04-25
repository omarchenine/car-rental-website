import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Car, Shield, Mail, Lock } from "lucide-react"
import { RegisterForm } from "@/components/admin/register-form"
import { getCurrentSession } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Create Account | DCMotors Admin",
  description: "Register for a new admin account with email verification",
}

export const dynamic = "force-dynamic"

export default async function RegisterPage() {
  const session = await getCurrentSession()
  if (session) redirect("/admin")

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Car className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-serif text-lg font-semibold">DCMotors</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left Column - Information */}
            <div className="space-y-8">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground">
                  Create Account
                </h1>
                <p className="mt-3 text-base text-muted-foreground">
                  Join the DCMotors admin team and manage your inventory with secure access.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Email Verification</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Secure your account with email verification
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Strong Security</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Industry-standard password hashing and encryption
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Your Privacy Protected</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Your data is encrypted and never shared
                    </p>
                  </div>
                </div>
              </div>

              {/* Already have account */}
              <div className="hidden md:block pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/admin/login" className="font-medium text-foreground hover:underline">
                    Sign in instead
                  </Link>
                </p>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full rounded-lg border border-border bg-card p-6 sm:p-8 shadow-sm h-fit">
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
