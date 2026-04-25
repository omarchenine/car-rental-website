'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, AlertCircle, CheckCircle, Mail } from 'lucide-react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to request password reset')
        return
      }

      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('[Forgot Password]', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <Mail className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h3 className="mb-2 font-semibold text-green-900">Check Your Email</h3>
        <p className="mb-4 text-sm text-green-800">
          We've sent a password reset link to your email address. Click the link to reset your password.
        </p>
        <p className="text-xs text-green-700">The link expires in 1 hour.</p>
        <Button asChild className="mt-4 w-full">
          <Link href="/admin/login">Back to Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-900">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@dcmotors.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading || !email} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Link...
          </>
        ) : (
          'Send Reset Link'
        )}
      </Button>

      <p className="text-center text-sm">
        Remember your password?{' '}
        <Link href="/admin/login" className="font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
