"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [, startTransition] = useTransition()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    
    setErrors({})
    setLoading(true)
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          toast.error(data?.error ?? "Login failed.")
        }
        return
      }
      
      toast.success("Welcome back.")
      startTransition(() => {
        router.push(nextPath)
        router.refresh()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@dcmotors.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={loading}
          className={`mt-1.5 ${errors.email ? "border-red-500" : ""}`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          disabled={loading}
          className={`mt-1.5 ${errors.password ? "border-red-500" : ""}`}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <Button type="submit" disabled={loading || !email || !password}>
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <div className="space-y-2 border-t pt-4">
        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/admin/register" className="font-medium hover:underline">
            Create one
          </Link>
        </p>
        <p className="text-center text-sm">
          <Link href="/admin/forgot-password" className="font-medium hover:underline">
            Forgot password?
          </Link>
        </p>
      </div>
    </form>
  )
}
