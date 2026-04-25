# User Registration System - Quick Start Guide

## 5-Minute Overview

### What Was Built
A complete user registration system with:
- Registration page at `/register`
- Email verification required
- Password strength requirements
- Mobile-responsive design
- Secure backend processing

### Key Files
```
app/register/page.tsx                    → Registration page
app/register/verify-email/page.tsx       → Email verification page
components/user/register-form.tsx        → Registration form component
components/user/email-verification-form.tsx → Verification form
app/api/users/register/route.ts          → Registration API endpoint
app/api/users/verify-email/route.ts      → Email verification endpoint
lib/user-types.ts                        → User schema and validation
lib/mongodb.ts                           → MongoDB collection setup (updated)
```

---

## How It Works

### User Registration
```
1. User visits /register
2. Fills out: email, first name, last name, password
3. Form validates in real-time
4. User clicks "Create Account"
5. Server validates and hashes password
6. User created in MongoDB
7. Verification email sent
8. User sees success message
9. User clicks link in email
10. Email verified
11. User can now log in
```

### Data Flow
```
Browser (Form Input)
    ↓ POST /api/users/register
API Route (Validation & Hashing)
    ↓
MongoDB (Stores encrypted password)
    ↓
Resend (Sends verification email)
    ↓
User (Receives email with link)
    ↓ Clicks link
Browser (Verify page)
    ↓ POST /api/users/verify-email
API Route (Validates token)
    ↓
MongoDB (Marks as verified)
    ↓
Success Message
```

---

## Security Overview

### What's Protected
✅ Passwords: bcryptjs hashing (12 rounds)
✅ Tokens: Cryptographically random (32 bytes)
✅ Email: Verified before account activation
✅ CSRF: SameSite cookie protection
✅ Input: Validated on client AND server
✅ Transport: HTTPS enforced
✅ Privacy: No sensitive data in errors

### How Passwords Work
```
User Password: "MyPassword123"
    ↓ (bcryptjs.hash with salt)
Stored Hash: "$2b$12$iJ7bUdWLqMFMxPvhVbSPDe..."
    ↓ (hash stored in MongoDB, never plain password)
Database: Cannot decrypt - one-way hashing
```

### How Tokens Work
```
Registration → Generate token → Store with 24h expiry
Email → Send link with token → User clicks link
Verification → Check token exists and not expired
Success → Mark email verified, delete token → Cannot reuse
```

---

## API Endpoints

### Register
```
POST /api/users/register

Request:
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}

Success (201):
{ "ok": true, "message": "Check your email..." }

Error (400):
{ "errors": { "field": "error message" } }

Duplicate (409):
{ "error": "Email already registered" }
```

### Verify Email
```
POST /api/users/verify-email

Request:
{ "token": "abc123..." }

Success (200):
{ "ok": true, "message": "Email verified" }

Invalid (400):
{ "error": "Invalid or expired link" }
```

---

## Form Validation

### Requirements

**Email**
- Must be valid format (user@domain.com)
- Must not be already registered
- Case-insensitive (stored lowercase)

**First Name**
- 2-50 characters
- Letters, spaces, hyphens, apostrophes only
- Required

**Last Name**
- Same as first name
- Required

**Password**
- Minimum 8 characters
- Maximum 128 characters
- Must contain uppercase (A-Z)
- Must contain lowercase (a-z)
- Must contain number (0-9)
- Example valid: "SecurePass123"

**Confirm Password**
- Must match password field
- Visual indicator shows match status

### Strength Meter
- 1/4 requirements → Red (Weak)
- 2/4 requirements → Yellow (Fair)
- 3/4 requirements → Blue (Good)
- 4/4 requirements → Green (Strong)

---

## Database

### User Collection (MongoDB)
```
{
  _id: ObjectId
  email: "user@example.com"        // unique
  firstName: "John"
  lastName: "Doe"
  passwordHash: "$2b$12$..."       // bcryptjs
  isVerified: boolean              // email verified?
  verificationToken?: "abc123..."  // 32-byte hex
  verificationTokenExpires?: Date  // 24 hours
  createdAt: Date
  updatedAt: Date
}
```

### Indexes
- email (unique) - prevents duplicates
- verificationToken - fast token lookup
- createdAt - chronological sorting

---

## User Flows

### Happy Path (No Errors)
```
Register page loads
User enters all fields
All fields show green (valid)
User clicks "Create Account"
Page shows success message
Redirects to verify-email page
User receives email in inbox
User clicks link in email
Email is verified
User redirected to login
Done ✓
```

### Error Recovery
```
User enters invalid email
Email field shows error message
Submit button disabled
User fixes email
Error clears
Submit button enables
User submits
Registration succeeds
```

---

## Mobile & Responsive

### Mobile
- Single column layout
- Full-width form inputs
- Touch-friendly buttons (48px height)
- Large text (16px minimum)
- Benefits listed vertically

### Tablet
- Two-column layout
- Balanced spacing
- Form on right, benefits on left

### Desktop
- Two-column with spacing
- Information on left
- Form card on right (500px max-width)

All layouts are automatically responsive with Tailwind CSS.

---

## Accessibility

### Keyboard Navigation
- Tab through fields
- Shift+Tab to go back
- Enter to submit
- Space for show/hide button

### Screen Readers
- Form labels announced
- Error messages linked
- Password strength described
- Success messages announced

### Color & Contrast
- 4.5:1 contrast ratio
- Not relying on color alone
- Icon indicators with text labels

---

## Environment Setup

### Required
```
MONGODB_URI=mongodb+srv://...
RESEND_API_KEY=re_...
ADMIN_EMAIL_FROM=noreply@dcmotors.vercel.app
```

### Already Configured
- JWT_SECRET
- Database connection pooling
- Email service integration

### To Deploy
1. Go to Vercel project settings
2. Add environment variables
3. Redeploy
4. Test registration flow

---

## Testing Quick Checklist

### Form Testing
- [ ] Can enter email
- [ ] Validation shows errors
- [ ] Password strength works
- [ ] Can submit form
- [ ] Form disables while loading
- [ ] Success message appears

### API Testing
```bash
# Test registration endpoint
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'

# Test verification endpoint
curl -X POST http://localhost:3000/api/users/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "token-from-db"}'
```

### Email Testing
1. Complete registration
2. Check email inbox
3. Click verification link
4. Should verify successfully

---

## Common Issues

### "Email already registered"
- User tried to register with existing email
- Solution: Use different email or reset password

### "Invalid or expired verification link"
- Token expired (24 hours)
- Link already used
- Solution: Register again

### "Email not received"
- Check spam folder
- Wait a few seconds
- Check that RESEND_API_KEY is set

### "Password strength not showing"
- User entered weak password
- Needs uppercase, lowercase, and number
- Example: "Test123" is valid

---

## Feature Roadmap

### Current
✅ Email registration
✅ Password strength requirements
✅ Email verification
✅ Secure password hashing
✅ Mobile responsive
✅ Accessible design

### Coming Soon
- Login page (user email + password)
- Password reset via email
- Profile management
- Account settings

### Future
- Two-factor authentication
- Social login (Google, GitHub)
- Magic links
- Biometric authentication

---

## Support

### For Issues
1. Check the full guide: `USER_REGISTRATION_GUIDE.md`
2. Check MongoDB for user data
3. Check Resend dashboard for email status
4. Check browser console for errors

### For Security Questions
- Read: Security Implementation section in full guide
- All passwords hashed with bcryptjs
- All tokens are cryptographically random
- Email verification is required
- Input validation on client and server

---

**Version**: 1.0
**Status**: Production Ready
**Last Updated**: 2026-04-25

For comprehensive documentation, see `USER_REGISTRATION_GUIDE.md`
