import { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  passwordHash: string
  isVerified: boolean
  verificationToken?: string
  verificationTokenExpires?: Date
  resetToken?: string
  resetTokenExpires?: Date
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface RegisterInput {
  email: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface VerifyEmailInput {
  token: string
}

export interface ResetPasswordInput {
  token: string
  password: string
  confirmPassword: string
}

export interface RequestResetInput {
  email: string
}

// Validation functions
export function validateEmail(email: string): { ok: boolean; error?: string } {
  const trimmed = String(email).trim().toLowerCase()
  if (!trimmed) return { ok: false, error: "Email is required" }
  if (trimmed.length > 255) return { ok: false, error: "Email is too long" }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) return { ok: false, error: "Invalid email format" }

  return { ok: true }
}

export function validateName(name: string, fieldName: string = "Name"): { ok: boolean; error?: string } {
  const trimmed = String(name).trim()
  if (!trimmed) return { ok: false, error: `${fieldName} is required` }
  if (trimmed.length < 2) return { ok: false, error: `${fieldName} must be at least 2 characters` }
  if (trimmed.length > 50) return { ok: false, error: `${fieldName} is too long` }

  // Allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { ok: false, error: `${fieldName} contains invalid characters` }
  }

  return { ok: true }
}

export function validatePassword(password: string): { ok: boolean; error?: string } {
  if (!password) return { ok: false, error: "Password is required" }
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters" }
  if (password.length > 128) return { ok: false, error: "Password is too long" }

  // Password should contain at least one uppercase, one lowercase, one number
  if (!/[A-Z]/.test(password)) return { ok: false, error: "Password must contain uppercase letter" }
  if (!/[a-z]/.test(password)) return { ok: false, error: "Password must contain lowercase letter" }
  if (!/[0-9]/.test(password)) return { ok: false, error: "Password must contain number" }

  return { ok: true }
}

export function validateRegister(input: RegisterInput): { ok: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  const emailValidation = validateEmail(input.email)
  if (!emailValidation.ok) errors.email = emailValidation.error!

  const firstNameValidation = validateName(input.firstName, "First name")
  if (!firstNameValidation.ok) errors.firstName = firstNameValidation.error!

  const lastNameValidation = validateName(input.lastName, "Last name")
  if (!lastNameValidation.ok) errors.lastName = lastNameValidation.error!

  const passwordValidation = validatePassword(input.password)
  if (!passwordValidation.ok) errors.password = passwordValidation.error!

  if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateLogin(input: LoginInput): { ok: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  const emailValidation = validateEmail(input.email)
  if (!emailValidation.ok) errors.email = emailValidation.error!

  if (!input.password) errors.password = "Password is required"

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  }
}
