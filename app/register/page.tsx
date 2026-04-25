import { Metadata } from "next"
import Link from "next/link"
import { UserRegisterForm } from "@/components/user/register-form"
import { getCurrentSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Create Account | DCMotors",
  description: "Register for a DCMotors account to browse cars and manage bookings.",
}

export const dynamic = "force-dynamic"

export default async function RegisterPage() {
  // Check if user is already logged in
  const session = await getCurrentSession()
  if (session) {
    redirect("/")
  }

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
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Information */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Create Your Account
              </h1>
              <p className="text-lg text-muted-foreground">
                Join DCMotors to browse our premium car collection and manage your bookings.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Secure Account</p>
                  <p className="text-sm text-muted-foreground">Your email is verified and account is protected with encrypted passwords.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Manage Bookings</p>
                  <p className="text-sm text-muted-foreground">Easily view and manage all your car rentals in one place.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Privacy Protected</p>
                  <p className="text-sm text-muted-foreground">Your personal information is kept private and never shared without consent.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex flex-col justify-center">
            <div className="rounded-lg border border-border bg-card p-8">
              <UserRegisterForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
