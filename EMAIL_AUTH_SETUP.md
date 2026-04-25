# Email-Based Admin Authentication System

## Overview

This document describes the complete email-based authentication system for the DCMotors admin portal. Users register with email, verify their email address, and log in with email + password.

## Environment Variables Required

Add these to your Vercel project settings (Settings → Environment Variables):

```env
# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL_FROM=noreply@dcmotors.vercel.app
NEXT_PUBLIC_SITE_URL=https://dcmotors.vercel.app

# JWT Secret (already configured)
JWT_SECRET=your-existing-jwt-secret

# MongoDB Connection (already configured)
MONGODB_URI=mongodb+srv://...
```

### Getting Resend API Key

1. Go to [Resend.com](https://resend.com)
2. Sign up for free (no credit card required)
3. Create a new API key
4. Copy the API key and add it to environment variables
5. Update `ADMIN_EMAIL_FROM` to your email domain

## System Architecture

### Database Schema

```typescript
// AdminUser Collection (MongoDB)
{
  _id: ObjectId
  email: string (unique)
  passwordHash: string (bcrypt with 12 rounds)
  isVerified: boolean
  verificationToken?: string (32-byte hex)
  verificationTokenExpires?: Date (24 hours from creation)
  resetToken?: string (32-byte hex)
  resetTokenExpires?: Date (1 hour from creation)
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Authentication Flow

#### Registration
1. User enters email, password, confirm password
2. Input validation (password strength, email format, match)
3. Check if email already registered
4. Hash password with bcryptjs (12 rounds)
5. Generate 32-byte verification token
6. Create AdminUser record with `isVerified: false`
7. Send verification email with link containing token
8. User receives email and clicks link

#### Email Verification
1. User clicks verification link with token
2. Token is verified (must exist and not be expired)
3. User marked as `isVerified: true`
4. Verification token cleared from database
5. User can now log in

#### Login
1. User enters email and password
2. Input validation
3. Find user by email
4. Check if email is verified
5. Verify password hash
6. Create JWT session token
7. Set HTTP-only cookie with 7-day expiry
8. Redirect to admin dashboard

#### Password Reset
1. User goes to "Forgot Password" page
2. Enters email address
3. If email exists and verified, generate reset token
4. Send email with password reset link
5. User clicks link and enters new password
6. Password hashed and updated in database
7. Reset token cleared
8. User can log in with new password

## File Structure

### Core Libraries
- `lib/admin-types.ts` - AdminUser schema and validation functions
- `lib/crypto.ts` - Secure token generation
- `lib/email-service.ts` - Resend email integration
- `lib/mongodb.ts` - MongoDB AdminUser collection (updated)
- `lib/auth.ts` - Password hashing/verification (updated)

### API Routes
- `app/api/auth/register/route.ts` - User registration
- `app/api/auth/verify-email/route.ts` - Email verification
- `app/api/auth/login/route.ts` - Login with email + password (updated)
- `app/api/auth/request-reset/route.ts` - Request password reset
- `app/api/auth/reset-password/route.ts` - Reset password

### Pages
- `app/admin/register/page.tsx` - Registration page
- `app/admin/verify-email/page.tsx` - Email verification page
- `app/admin/forgot-password/page.tsx` - Request password reset
- `app/admin/reset-password/page.tsx` - Password reset form

### Components
- `components/admin/register-form.tsx` - Registration form
- `components/admin/email-verification-form.tsx` - Verification form
- `components/admin/forgot-password-form.tsx` - Password reset request
- `components/admin/password-reset-form.tsx` - Password reset form
- `components/admin/login-form.tsx` - Login form (updated)

## Security Features

### Password Security
- Passwords hashed with bcryptjs (12 rounds)
- Never stored or logged as plain text
- Constant-time comparison during verification
- Password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Token Security
- Verification tokens: 32-byte cryptographically secure random
- Reset tokens: 32-byte cryptographically secure random
- Tokens expire after 24 hours (verification) or 1 hour (reset)
- Tokens are one-time use (cleared after successful use)
- Tokens stored in database (hashed if needed in future)

### Session Security
- JWT tokens with HS256 algorithm
- Tokens stored in HTTP-only cookies (XSS protection)
- Secure flag set in production (HTTPS only)
- SameSite=Lax to prevent CSRF
- 7-day expiration
- Cookies cleared on logout

### Other Security Measures
- 300ms delay on failed login attempts (brute-force protection)
- Email existence check doesn't reveal if account exists
- HTTPS enforced in production
- Input validation and sanitization on all endpoints
- Error messages don't reveal sensitive information

## Setup Instructions

### 1. Install Dependencies (Already Done)
```bash
pnpm add bcryptjs resend
```

### 2. Configure Environment Variables
In Vercel project settings, add:
- `RESEND_API_KEY` - Your Resend API key
- `ADMIN_EMAIL_FROM` - Sender email address
- `NEXT_PUBLIC_SITE_URL` - Your site URL

### 3. Deploy
```bash
pnpm build
git push  # Deploys to Vercel
```

### 4. First Admin User
Create the first admin by:
1. Going to `/admin/register`
2. Entering email, password, confirm password
3. Checking email for verification link
4. Clicking link to verify
5. Logging in with email + password

### 5. Test the System
- Register a new admin account
- Verify email by clicking link
- Log in with email + password
- Test forgot password flow
- Check that JWT cookie is set

## API Endpoints

### POST /api/auth/register
**Register a new admin account**

Request:
```json
{
  "email": "admin@dcmotors.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

Response (201):
```json
{
  "ok": true,
  "message": "Account created! Check your email for verification link."
}
```

Errors:
- 400: Validation failed (returns `errors` object)
- 409: Email already registered
- 500: Server error

### POST /api/auth/verify-email
**Verify email with token**

Request:
```json
{
  "token": "hex-encoded-32-byte-token"
}
```

Response (200):
```json
{
  "ok": true,
  "message": "Email verified successfully! You can now log in."
}
```

Errors:
- 400: Invalid or expired token
- 500: Server error

### POST /api/auth/login
**Login with email + password**

Request:
```json
{
  "email": "admin@dcmotors.com",
  "password": "SecurePass123"
}
```

Response (200):
```json
{
  "ok": true
}
```

Side effect: Sets HTTP-only session cookie

Errors:
- 400: Validation failed (returns `errors` object)
- 401: Invalid email or password
- 403: Email not verified
- 500: Server error

### POST /api/auth/request-reset
**Request password reset link**

Request:
```json
{
  "email": "admin@dcmotors.com"
}
```

Response (200):
```json
{
  "ok": true,
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

Note: Always returns success (security best practice - doesn't reveal if email exists)

### POST /api/auth/reset-password
**Reset password with token**

Request:
```json
{
  "token": "hex-encoded-32-byte-token",
  "password": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

Response (200):
```json
{
  "ok": true,
  "message": "Password reset successful! You can now log in with your new password."
}
```

Errors:
- 400: Validation failed or invalid token
- 500: Server error

## User Flows

### New User Registration
1. User navigates to `/admin/register`
2. Enters email, password, confirm password
3. Clicks "Create Account"
4. App sends POST to `/api/auth/register`
5. Email is checked for uniqueness
6. Password is hashed
7. Verification token is generated
8. AdminUser record created with `isVerified: false`
9. Verification email sent to user's email address
10. User sees "Check your email" message
11. User receives email with link: `/admin/verify-email?token=...`
12. User clicks link
13. App automatically calls `/api/auth/verify-email` with token
14. Email marked as verified
15. Success message shown
16. User redirected to login page

### Existing User Login
1. User navigates to `/admin/login`
2. Enters email and password
3. Clicks "Sign in"
4. App sends POST to `/api/auth/login`
5. Email is looked up in database
6. Password hash is verified
7. Session JWT is created
8. Cookie is set (HTTP-only, 7-day expiry)
9. User is redirected to dashboard

### Forgotten Password Reset
1. User navigates to `/admin/login`
2. Clicks "Forgot password?" link
3. App navigates to `/admin/forgot-password`
4. User enters email and clicks "Send Reset Link"
5. App sends POST to `/api/auth/request-reset`
6. Reset token is generated if account exists
7. Password reset email sent
8. User sees success message
9. User receives email with link: `/admin/reset-password?token=...`
10. User clicks link
11. App navigates to reset password page
12. User enters new password and confirm password
13. Clicks "Reset Password"
14. App sends POST to `/api/auth/reset-password`
15. Password is hashed and updated
16. Reset token is cleared
17. Success message shown
18. User redirected to login

## Monitoring & Troubleshooting

### Common Issues

**Email not being sent:**
- Check `RESEND_API_KEY` is correct
- Check `ADMIN_EMAIL_FROM` is set
- Check API usage limits (free tier has limits)
- Check browser console for errors
- Check server logs for email service errors

**Verification link not working:**
- Check token hasn't expired (24 hours)
- Check token is correct in URL
- Check database record exists
- Try copying/pasting token directly

**Login failing after verification:**
- Check email is verified in database
- Check password is correct
- Verify user exists in MongoDB
- Check JWT_SECRET is set

**Cookie not being set:**
- Check `Secure` flag in production (HTTPS required)
- Check `SameSite=Lax` setting
- Check browser accepts cookies
- Try in incognito/private mode

### Testing in Development

```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","confirmPassword":"TestPass123"}'

# Test email verification (get token from email or DB)
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"..."}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### Database Inspection

```javascript
// MongoDB shell - view admin users
db.adminUsers.find()

// View specific user
db.adminUsers.findOne({ email: "admin@dcmotors.com" })

// Update verification status (testing only!)
db.adminUsers.updateOne(
  { email: "admin@dcmotors.com" },
  { $set: { isVerified: true }, $unset: { verificationToken: "", verificationTokenExpires: "" } }
)
```

## Migration from Old System

If you had the old ADMIN_PASSWORD system:

### Option 1: Keep Both (Temporary)
1. Old login still works via `/api/auth/login` fallback
2. Gradually move admin users to email-based system
3. Eventually remove ADMIN_PASSWORD

### Option 2: Complete Migration
1. Create new admin users with email system
2. Use password reset flow to migrate old users
3. Remove old ADMIN_PASSWORD code

## Future Enhancements

Possible improvements:
- Two-factor authentication (2FA)
- Passwordless login (magic links)
- OAuth integration (Google, GitHub)
- Admin user management dashboard
- Account activity logs
- Rate limiting per IP
- Account lockout after N failed attempts
- Email change verification
- Session management (view active sessions, logout from other devices)

## Support

For issues:
1. Check this documentation
2. Review API endpoint responses
3. Check MongoDB for record existence
4. Inspect browser DevTools (Network, Console, Cookies)
5. Check server logs for errors
6. Review Resend dashboard for email delivery status

---

**Created:** 2026-04-25
**Last Updated:** 2026-04-25
**System Version:** 1.0
