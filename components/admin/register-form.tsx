'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Check, X } from 'lucide-react'

// Password strength checker
function getPasswordStrength(password: string) {
  let strength = 0
  const checks = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }

  if (checks.hasMinLength) strength++
  if (checks.hasUppercase) strength++
  if (checks.hasLowercase) strength++
  if (checks.hasNumber) strength++

  return { strength, checks }
}

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const { [name]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          setFieldErrors(data.errors)
        } else {
          setError(data.error || 'Registration failed')
        }
        return
      }

      setSuccess(true)
      setFormData({ email: '', password: '', confirmPassword: '' })
      
      // Redirect to check email page after 2 seconds
      setTimeout(() => {
        router.push(`/admin/verify-email?email=${encodeURIComponent(formData.email)}`)
      }, 2000)
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('[Register Form]', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" aria-hidden="true" />
        <h3 className="mb-2 font-semibold text-green-900">Registration Successful!</h3>
        <p className="mb-4 text-sm text-green-800">
          Check your email for a verification link. You'll be redirected shortly.
        </p>
      </div>
    )
  }

  const isPasswordValid = passwordStrength.strength === 4 && formData.password === formData.confirmPassword
  const isFormValid = formData.email && isPasswordValid && !isLoading

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900" role="alert">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@dcmotors.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          className={`${fieldErrors.email ? 'border-red-500 focus:ring-red-200' : ''}`}
          autoComplete="email"
        />
        {fieldErrors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            required
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? 'password-error' : 'password-help'}
            className={`pr-10 ${fieldErrors.password ? 'border-red-500 focus:ring-red-200' : ''}`}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {fieldErrors.password && (
          <p id="password-error" className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
        )}

        {formData.password && (
          <div id="password-help" className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    passwordStrength.strength === 1 ? 'w-1/4 bg-red-500' :
                    passwordStrength.strength === 2 ? 'w-2/4 bg-yellow-500' :
                    passwordStrength.strength === 3 ? 'w-3/4 bg-blue-500' :
                    'w-full bg-green-500'
                  }`}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                {passwordStrength.strength === 1 ? 'Weak' :
                 passwordStrength.strength === 2 ? 'Fair' :
                 passwordStrength.strength === 3 ? 'Good' :
                 'Strong'}
              </span>
            </div>

            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                {passwordStrength.checks.hasMinLength ? (
                  <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                ) : (
                  <X className="h-4 w-4 text-red-400" aria-hidden="true" />
                )}
                <span className={passwordStrength.checks.hasMinLength ? 'text-green-700' : 'text-muted-foreground'}>
                  At least 8 characters
                </span>
              </li>
              <li className="flex items-center gap-2">
                {passwordStrength.checks.hasUppercase ? (
                  <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                ) : (
                  <X className="h-4 w-4 text-red-400" aria-hidden="true" />
                )}
                <span className={passwordStrength.checks.hasUppercase ? 'text-green-700' : 'text-muted-foreground'}>
                  One uppercase letter (A–Z)
                </span>
              </li>
              <li className="flex items-center gap-2">
                {passwordStrength.checks.hasLowercase ? (
                  <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                ) : (
                  <X className="h-4 w-4 text-red-400" aria-hidden="true" />
                )}
                <span className={passwordStrength.checks.hasLowercase ? 'text-green-700' : 'text-muted-foreground'}>
                  One lowercase letter (a–z)
                </span>
              </li>
              <li className="flex items-center gap-2">
                {passwordStrength.checks.hasNumber ? (
                  <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                ) : (
                  <X className="h-4 w-4 text-red-400" aria-hidden="true" />
                )}
                <span className={passwordStrength.checks.hasNumber ? 'text-green-700' : 'text-muted-foreground'}>
                  One number (0–9)
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            required
            aria-invalid={!!fieldErrors.confirmPassword}
            aria-describedby={fieldErrors.confirmPassword ? 'confirm-error' : undefined}
            className={`pr-10 ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-200' : ''}`}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p id="confirm-error" className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
        )}
        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="mt-1 text-sm text-yellow-600">Passwords don&apos;t match</p>
        )}
        {formData.confirmPassword && formData.password === formData.confirmPassword && isPasswordValid && (
          <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
            <Check className="h-4 w-4" aria-hidden="true" /> Passwords match
          </p>
        )}
      </div>

      <Button type="submit" disabled={!isFormValid} className="w-full" size="lg">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Creating Account…</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/admin/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
