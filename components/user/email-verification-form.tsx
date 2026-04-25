'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export function UserEmailVerificationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleVerify = async () => {
    if (!token) {
      setError('No verification token provided')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/users/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Verification failed')
        return
      }

      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('[Verify Email]', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" aria-hidden="true" />
        <h3 className="mb-2 font-semibold text-green-900">Email Verified!</h3>
        <p className="mb-4 text-sm text-green-800">
          Your email has been verified successfully. You can now log in to your account.
        </p>
        <p className="text-xs text-green-700">Redirecting to login...</p>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-red-900 mb-2">Invalid Verification Link</p>
            <p className="text-sm text-red-800">The verification link is missing or invalid.</p>
          </div>
        </div>
        <Link href="/register" className="text-sm font-medium text-red-700 hover:text-red-800 underline">
          Try registering again
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900" role="alert">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-medium mb-1">Verification Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6 text-center space-y-4">
        <h3 className="font-semibold text-foreground">Verify Your Email</h3>
        <p className="text-sm text-muted-foreground">
          Click the button below to verify your email address and activate your account.
        </p>

        <Button 
          onClick={handleVerify} 
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Verifying…</span>
            </>
          ) : (
            <span>Verify Email</span>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          If you didn&apos;t receive an email, check your spam folder or{' '}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            register again
          </Link>
        </p>
      </div>
    </div>
  )
}
