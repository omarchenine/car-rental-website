import Link from "next/link"
import { redirect } from "next/navigation"
import { Car } from "lucide-react"
import { getCurrentSession } from "@/lib/auth"
import { LoginForm } from "@/components/admin/login-form"

export const metadata = { title: "Admin login" }
export const dynamic = "force-dynamic"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const sp = await searchParams
  const session = await getCurrentSession()
  if (session) redirect(sp.next ?? "/admin")

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Car className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-serif text-xl font-semibold">DCMotors</span>
        </Link>
        <h1 className="mt-8 font-serif text-2xl font-semibold">Staff login</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your admin password to manage the inventory.
        </p>
        <LoginForm nextPath={sp.next ?? "/admin"} />
      </div>
    </main>
  )
}
