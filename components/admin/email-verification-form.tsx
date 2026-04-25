'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, CheckCircle, Mail } from 'lucide-react'

export function EmailVerificationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token) {
      verifyEmail()
    } else {
      setIsVerifying(false)
    }
  }, [token])

  const verifyEmail = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Verification failed')
        setIsVerifying(false)
        return
      }

      setSuccess(true)
      setIsVerifying(false)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/admin/login')
      }, 3000)
    } catch (err) {
      setError('An unexpected error occurred during verification')
      setIsVerifying(false)
      console.error('[Email Verification]', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
        <p className="text-gray-600">Verifying your email...</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h3 className="mb-2 font-semibold text-green-900">Email Verified!</h3>
        <p className="mb-6 text-sm text-green-800">
          Your email has been verified successfully. You can now log in to your account.
        </p>
        <p className="text-xs text-green-700">Redirecting to login...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-md space-y-4">
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="mb-2 font-medium">Verification Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>

        {email && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              If your link has expired, you can request a new verification email.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/admin/register">
              Try Again
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/admin/login">
              Go to Login
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // No token provided
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <p className="font-medium text-blue-900">Check Your Email</p>
        </div>
        <p className="text-sm text-blue-800">
          We've sent a verification link to your email address. Click the link to verify your account.
        </p>
      </div>

      {email && (
        <p className="text-center text-sm text-gray-600">
          Sent to: <span className="font-medium">{email}</span>
        </p>
      )}

      <div className="flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/admin/register">
            Back to Register
          </Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/admin/login">
            Go to Login
          </Link>
        </Button>
      </div>
    </div>
  )
}
