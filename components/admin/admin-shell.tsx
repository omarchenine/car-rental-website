"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Car, LayoutDashboard, LogOut, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    toast.success("Signed out.")
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-secondary/50">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Car className="h-4 w-4" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-lg font-semibold">DCMotors</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Admin
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Admin">
            <AdminLink href="/admin" active={pathname === "/admin"}>
              <LayoutDashboard className="mr-1.5 h-4 w-4" />
              Listings
            </AdminLink>
            <AdminLink href="/admin/new" active={pathname === "/admin/new"}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add car
            </AdminLink>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/" target="_blank" rel="noopener">
                View site
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

function AdminLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {children}
    </Link>
  )
}
