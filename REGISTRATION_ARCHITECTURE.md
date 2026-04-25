# Admin Registration System - Architecture Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ADMIN REGISTRATION SYSTEM                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CLIENT (Browser)                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  /admin/register                                                  │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │  RegisterPage                                              │  │   │
│  │  │  ├─ Header (DCMotors Logo)                                 │  │   │
│  │  │  ├─ Left Column                                            │  │   │
│  │  │  │  ├─ Title: "Create Account"                             │  │   │
│  │  │  │  └─ Benefits List (Email, Security, Privacy)            │  │   │
│  │  │  └─ Right Column (Card)                                    │  │   │
│  │  │     └─ RegisterForm Component                              │  │   │
│  │  │        ├─ Email Input (with validation)                    │  │   │
│  │  │        ├─ Password Input (with show/hide)                  │  │   │
│  │  │        │  └─ Strength Indicator (meter + checklist)        │  │   │
│  │  │        ├─ Confirm Password Input                           │  │   │
│  │  │        ├─ Error Alert (if present)                         │  │   │
│  │  │        └─ Submit Button (Create Account)                   │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    │                                     │
│  VALIDATION (Frontend)              │                                     │
│  ┌──────────────────────────────────▼─────────────────────────────┐   │
│  │  Real-Time Validation                                           │   │
│  │  ├─ Email Format Check (regex)                                  │   │
│  │  ├─ Password Strength Check (4 requirements)                    │   │
│  │  │  ├─ Min 8 characters                                         │   │
│  │  │  ├─ Uppercase letter (A-Z)                                   │   │
│  │  │  ├─ Lowercase letter (a-z)                                   │   │
│  │  │  └─ Number (0-9)                                             │   │
│  │  ├─ Password Confirmation Match                                 │   │
│  │  └─ Button Enable/Disable Logic                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    │ POST /api/auth/register             │
│                                    │ (JSON payload)                      │
│                                    ▼                                     │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  SERVER (Next.js API Route)                                             │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  POST /api/auth/register/route.ts                                  │  │
│  │                                                                     │  │
│  │  1. Parse Request                                                  │  │
│  │     └─ Extract: email, password, confirmPassword                   │  │
│  │                                                                     │  │
│  │  2. Server-Side Validation                                         │  │
│  │     └─ validateRegister() function                                 │  │
│  │        ├─ Email validation                                         │  │
│  │        ├─ Password strength check                                  │  │
│  │        └─ Password confirmation match                              │  │
│  │                                                                     │  │
│  │  3. Check Duplicate Email                                          │  │
│  │     └─ Query MongoDB: db.adminUsers.findOne({ email })            │  │
│  │        ├─ If exists: return 409 Conflict ❌                        │  │
│  │        └─ If not found: continue ✓                                 │  │
│  │                                                                     │  │
│  │  4. Hash Password                                                  │  │
│  │     └─ hashPassword(password)                                      │  │
│  │        └─ bcryptjs.hash(password, 12)                              │  │
│  │           (Produces: $2b$12$... ~60 character hash)                │  │
│  │                                                                     │  │
│  │  5. Generate Verification Token                                    │  │
│  │     └─ generateSecureToken()                                       │  │
│  │        └─ randomBytes(32).toString('hex')                          │  │
│  │           (Produces: 64-character hex string)                      │  │
│  │                                                                     │  │
│  │  6. Create User Document                                           │  │
│  │     └─ db.adminUsers.insertOne({                                   │  │
│  │        email: email.toLowerCase(),                                 │  │
│  │        passwordHash: hashedPassword,                               │  │
│  │        isVerified: false,                                          │  │
│  │        verificationToken: token,                                   │  │
│  │        verificationTokenExpires: now + 24h,                        │  │
│  │        createdAt: now,                                             │  │
│  │        updatedAt: now                                              │  │
│  │     })                                                              │  │
│  │                                                                     │  │
│  │  7. Send Verification Email                                        │  │
│  │     └─ sendVerificationEmail(email, verificationLink)              │  │
│  │        └─ Resend API Call                                          │  │
│  │           ├─ From: ADMIN_EMAIL_FROM                                │  │
│  │           ├─ To: user email                                        │  │
│  │           ├─ Subject: "Verify Your Email - DCMotors Admin"         │  │
│  │           └─ Body: HTML email with verification link               │  │
│  │                    (includes token in URL)                         │  │
│  │                                                                     │  │
│  │  8. Return Response                                                │  │
│  │     └─ 201 Created                                                 │  │
│  │        ├─ ok: true                                                 │  │
│  │        └─ message: "Check your email for verification link"        │  │
│  │                                                                     │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                    │                                      │
│                                    ▼                                      │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  MongoDB                                                            │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  Collection: adminUsers                                      │  │  │
│  │  │  Document: {                                                 │  │  │
│  │  │    _id: ObjectId(...),                                       │  │  │
│  │  │    email: "admin@dcmotors.com",                              │  │  │
│  │  │    passwordHash: "$2b$12$...",                               │  │  │
│  │  │    isVerified: false,                                        │  │  │
│  │  │    verificationToken: "a1b2c3...",                           │  │  │
│  │  │    verificationTokenExpires: Date(2026-04-26T12:34:56Z),     │  │  │
│  │  │    createdAt: Date(2026-04-25T12:34:56Z),                    │  │  │
│  │  │    updatedAt: Date(2026-04-25T12:34:56Z)                     │  │  │
│  │  │  }                                                            │  │  │
│  │  │                                                               │  │  │
│  │  │  Indexes:                                                    │  │  │
│  │  │  - email (unique) - ensures no duplicate accounts            │  │  │
│  │  │  - verificationToken - fast token lookups                    │  │  │
│  │  │  - createdAt - chronological sorting                         │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  Email Service (Resend)                                            │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  Verification Email Template                                 │  │  │
│  │  │  ┌────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │ To: admin@dcmotors.com                                 │  │  │  │
│  │  │  │ From: noreply@dcmotors.vercel.app                      │  │  │  │
│  │  │  │ Subject: Verify Your Email - DCMotors Admin            │  │  │  │
│  │  │  │                                                         │  │  │  │
│  │  │  │ Body:                                                  │  │  │  │
│  │  │  │ "Verify Your Email                                     │  │  │  │
│  │  │  │  Welcome to DCMotors Admin Portal!                     │  │  │  │
│  │  │  │  Please click the link below to verify your email:     │  │  │  │
│  │  │  │  [BUTTON: Verify Email]                               │  │  │  │
│  │  │  │  https://dcmotors.vercel.app/admin/verify-email       │  │  │  │
│  │  │  │                              ?token=a1b2c3...         │  │  │  │
│  │  │  │  This link expires in 24 hours."                       │  │  │  │
│  │  │  └────────────────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  CLIENT - After Submission                                              │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  1. Success State                                                   │  │
│  │     ├─ Form disabled                                               │  │
│  │     ├─ Success message displayed                                   │  │
│  │     │  "Registration Successful! Check your email..."              │  │
│  │     ├─ Spinner animation                                           │  │
│  │     └─ After 2 seconds:                                            │  │
│  │        └─ Redirect to /admin/verify-email                          │  │
│  │                                                                     │  │
│  │  2. Error State                                                     │  │
│  │     ├─ Form remains enabled                                        │  │
│  │     ├─ Error alert displayed                                       │  │
│  │     │  (specific field errors or general message)                  │  │
│  │     └─ User can correct and resubmit                               │  │
│  │                                                                     │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Password Hashing Process

```
User's Plaintext Password: "MyPassword123"
            │
            ▼
┌────────────────────────────────┐
│  Client-Side Validation        │
│  ✓ Length >= 8                 │
│  ✓ Uppercase letter            │
│  ✓ Lowercase letter            │
│  ✓ Number                      │
└────────────────────────────────┘
            │
            ▼
    Sent over HTTPS
(Encrypted in transit)
            │
            ▼
┌────────────────────────────────┐
│  Server receives password      │
│  "MyPassword123"               │
└────────────────────────────────┘
            │
            ▼
┌────────────────────────────────┐
│  bcryptjs.hash()               │
│  - Generate random salt        │
│  - Hash password + salt        │
│  - 12 rounds (slow = secure)   │
│  - Computational cost: 150-200ms
└────────────────────────────────┘
            │
            ▼
 Result: Hashed password
"$2b$12$iJ7bUdWLqMFMxPvhVbSPDe..."
(60-character bcrypt hash)
            │
            ▼
┌────────────────────────────────┐
│  Stored in MongoDB             │
│  Plain password NEVER stored   │
│  ❌ Password: "MyPassword123"  │
│  ✓ Hash: "$2b$12$iJ7b..."     │
└────────────────────────────────┘

During Login:
┌────────────────────────────────┐
│  User enters: "MyPassword123"  │
└────────────────────────────────┘
            │
            ▼
┌────────────────────────────────┐
│  bcryptjs.compare()            │
│  - Compare plaintext to hash   │
│  - Constant-time check         │
│  - No information leakage      │
└────────────────────────────────┘
            │
            ▼
  ✓ Match  OR  ✗ No Match
            │         │
    Grant access   Deny access
```

---

## Token Generation and Verification

```
Registration Process:
┌──────────────────────────────────┐
│  1. Generate Verification Token  │
│  crypto.randomBytes(32)          │
│  .toString('hex')                │
│                                  │
│  Result: 64-char hex string      │
│  "a1b2c3d4e5f6..."               │
└──────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│  2. Store in MongoDB             │
│  verificationToken: "a1b2..."    │
│  verificationTokenExpires:       │
│  now + 24 hours                  │
└──────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│  3. Send in Email                │
│  https://dcmotors.vercel.app/    │
│  admin/verify-email?             │
│  token=a1b2c3d4e5f6...           │
└──────────────────────────────────┘

User Clicks Link:
┌──────────────────────────────────┐
│  1. Extract token from URL       │
│  token="a1b2c3d4e5f6..."         │
└──────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│  2. POST to verify-email API     │
│  { token: "a1b2c3d4e5f6..." }    │
└──────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│  3. Server Validation            │
│  ├─ Token not empty?             │
│  ├─ Token in database?           │
│  ├─ Token not expired?           │
│  └─ User found?                  │
└──────────────────────────────────┘
     │           │           │         │
    ✓            ✓           ✓        ✓
     │           │           │         │
     └───────────┴───────────┴─────────┘
            │
            ▼
┌──────────────────────────────────┐
│  4. Update User                  │
│  SET isVerified = true           │
│  CLEAR verificationToken         │
│  CLEAR verificationTokenExpires  │
│  UPDATE updatedAt                │
└──────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│  5. Return Success Response      │
│  Redirect to /admin/login        │
└──────────────────────────────────┘
```

---

## Validation Flow

```
Form Input
    │
    ├─ Email Input
    │  ├─ onChange: Real-time validation
    │  ├─ Check: Not empty?
    │  ├─ Check: Valid format? (regex)
    │  ├─ Check: Max 255 chars?
    │  └─ Display: Error or clear ✓
    │
    ├─ Password Input
    │  ├─ onChange: Real-time validation
    │  ├─ Calculate strength (0-4 points)
    │  │  ├─ Point 1: >= 8 characters
    │  │  ├─ Point 2: Has uppercase (A-Z)
    │  │  ├─ Point 3: Has lowercase (a-z)
    │  │  └─ Point 4: Has number (0-9)
    │  ├─ Display strength meter:
    │  │  ├─ 1 point: Red (Weak)
    │  │  ├─ 2 points: Yellow (Fair)
    │  │  ├─ 3 points: Blue (Good)
    │  │  └─ 4 points: Green (Strong)
    │  ├─ Show checklist with status
    │  └─ Clear field error
    │
    ├─ Confirm Password Input
    │  ├─ onChange: Real-time validation
    │  ├─ Check: Matches password?
    │  ├─ Display: Match or error
    │  └─ Clear field error
    │
    └─ Submit Button State
       ├─ Check ALL conditions:
       │  ├─ Email not empty
       │  ├─ Email valid
       │  ├─ Password strength = 4
       │  ├─ Passwords match
       │  └─ Not loading
       ├─ If all conditions met:
       │  └─ Button ENABLED (clickable)
       └─ Otherwise:
          └─ Button DISABLED (greyed out)

On Submit:
    │
    ├─ Prevent default form submission
    ├─ Set loading state (disable form)
    ├─ POST to /api/auth/register
    │  (JSON body)
    │
    ├─ Server processes...
    │
    └─ Response received:
       ├─ Success (201)
       │  ├─ Show success message
       │  ├─ Animate spinner
       │  ├─ Clear form
       │  └─ Redirect after 2 seconds
       │
       ├─ Validation error (400)
       │  ├─ Extract error object
       │  ├─ Display field errors
       │  ├─ Re-enable form
       │  └─ Focus first error field
       │
       ├─ Duplicate email (409)
       │  ├─ Display error: "Email already registered"
       │  ├─ Re-enable form
       │  └─ Focus email field
       │
       └─ Server error (500)
          ├─ Display generic error
          ├─ Log for debugging
          └─ Allow user to retry
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: HTTPS Transport Security                             │
│  ├─ All data encrypted in transit                              │
│  ├─ Prevents man-in-the-middle attacks                         │
│  └─ Automatic in production (Vercel enforces)                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: Client-Side Validation                               │
│  ├─ Real-time format checking                                  │
│  ├─ Prevents obvious errors                                    │
│  └─ UX feedback (not security)                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: Server-Side Validation                               │
│  ├─ Re-validate all inputs                                     │
│  ├─ Check database constraints                                 │
│  └─ Primary security layer                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4: Password Hashing                                     │
│  ├─ bcryptjs (12 rounds)                                       │
│  ├─ Salt included                                              │
│  ├─ Slow computation (security feature)                        │
│  └─ Passwords never stored plaintext                           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 5: Secure Token Generation                              │
│  ├─ crypto.randomBytes(32)                                     │
│  ├─ Cryptographically secure                                   │
│  ├─ Unique for each verification                               │
│  └─ Time-limited (24 hours)                                    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 6: Email Verification                                   │
│  ├─ One-time use token                                         │
│  ├─ Verifies email ownership                                   │
│  ├─ Required before login                                      │
│  └─ Token cleared after use                                    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 7: CSRF Protection                                      │
│  ├─ HTTP-only cookies                                          │
│  ├─ SameSite=Lax attribute                                     │
│  ├─ Prevents cross-site form submission                        │
│  └─ POST method required (not GET)                             │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 8: Session Management                                   │
│  ├─ JWT tokens                                                 │
│  ├─ 7-day expiration                                           │
│  ├─ Secure cookie storage                                      │
│  └─ Automatic refresh on login                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Operations Sequence

```
Registration API Call
        │
        ▼
1. Parse Request ─────────────────────────► JSON.parse(body)
        │
        ▼
2. Validate Input ────────────────────────► validateRegister()
        │ (email, password, confirmPassword)
        │
        ▼
3. Find Existing User ───────────────────► db.adminUsers.findOne({
        │                                  email: email.toLowerCase()
        │                                })
        │
        ├─ Found? ───────────────────────► Return 409 Conflict ❌
        │
        │ Not Found? ──────────────────────┐
        │                                   ▼
        ▼                          4. Hash Password ──► bcryptjs.hash()
     Continue
        │                                   ▼
        ├─────────────────────────► 5. Generate Token ─► crypto.randomBytes()
        │                                   │
        │                                   ▼
        ├────────────────────────► 6. Create User Doc
        │                             {
        │                               email: "admin@..."
        │                               passwordHash: "$2b$12$..."
        │                               isVerified: false
        │                               verificationToken: "a1b2..."
        │                               verificationTokenExpires: Date
        │                               createdAt: now
        │                               updatedAt: now
        │                             }
        │                                   │
        ▼                                   ▼
7. Insert into DB ────────────────► db.adminUsers.insertOne(doc)
        │
        ├─ Success ────────────────────────┐
        │                                   ▼
        ▼                          8. Send Email ──► Resend API
                                         │
                                         ▼
                                 9. Return 201 ────► { ok: true }
                                         │
                                         ▼
                                 Client receives success
                                         │
                                         ▼
                                 Shows success message
                                 Redirects to verify-email page
```

---

## Error Handling Tree

```
Registration Request
        │
        ├─ Parse Error
        │  └─ Return 400 Bad Request
        │     { error: "Invalid JSON" }
        │
        ├─ Validation Error
        │  ├─ Empty fields
        │  ├─ Invalid email format
        │  ├─ Weak password
        │  ├─ Passwords don't match
        │  └─ Return 400
        │     { errors: { field: "message" } }
        │
        ├─ Database Query Error
        │  ├─ Connection failed
        │  ├─ Permission denied
        │  └─ Return 500
        │     { error: "Internal server error" }
        │
        ├─ Duplicate Email
        │  └─ Return 409 Conflict
        │     { error: "Email already registered" }
        │
        ├─ Hash Error
        │  └─ Return 500
        │     { error: "Internal server error" }
        │
        ├─ Insert Error
        │  ├─ Database full
        │  ├─ Constraint violation
        │  └─ Return 500
        │     { error: "Internal server error" }
        │
        ├─ Email Service Error
        │  ├─ Resend API down
        │  ├─ Invalid API key
        │  ├─ Rate limit exceeded
        │  └─ Return 201 + flag
        │     {
        │       ok: true,
        │       message: "Account created, but email failed",
        │       needsResend: true
        │     }
        │
        └─ Success
           └─ Return 201 Created
              {
                ok: true,
                message: "Check your email for verification link"
              }
```

---

## Component Hierarchy

```
RegisterPage (async server component)
    │
    ├─ metadata (SEO)
    ├─ dynamic = "force-dynamic"
    ├─ getCurrentSession() (check auth)
    │  └─ If logged in: redirect to /admin
    │
    └─ JSX Structure
       │
       ├─ <main>
       │  ├─ Header
       │  │  └─ DCMotors Logo + Link to Home
       │  │
       │  └─ Main Content Container
       │     └─ Grid Layout (2-col on desktop)
       │        │
       │        ├─ Left Column
       │        │  ├─ <h1>Create Account</h1>
       │        │  ├─ <p>Subtitle</p>
       │        │  │
       │        │  └─ Benefits Section
       │        │     ├─ Email Verification
       │        │     ├─ Security Features
       │        │     └─ Privacy Protection
       │        │
       │        └─ Right Column (Card)
       │           └─ <RegisterForm /> (client component)
       │              │
       │              ├─ State Management (useState)
       │              │  ├─ formData
       │              │  ├─ fieldErrors
       │              │  ├─ error (general)
       │              │  ├─ success
       │              │  ├─ isLoading
       │              │  ├─ showPassword
       │              │  └─ showConfirmPassword
       │              │
       │              ├─ Validation Logic
       │              │  ├─ getPasswordStrength()
       │              │  ├─ passwordStrength (useMemo)
       │              │  └─ isFormValid calculation
       │              │
       │              ├─ Event Handlers
       │              │  ├─ handleChange()
       │              │  └─ handleSubmit()
       │              │
       │              └─ JSX Rendering
       │                 ├─ Error Alert (conditional)
       │                 ├─ Email Input
       │                 ├─ Password Input
       │                 │  └─ Strength Indicator
       │                 ├─ Confirm Password Input
       │                 ├─ Submit Button
       │                 └─ Sign In Link
```

---

## State Flow in RegisterForm

```
Initial State:
{
  email: '',
  password: '',
  confirmPassword: ''
}
fieldErrors: {}
isLoading: false
error: null
success: false
showPassword: false
showConfirmPassword: false

User Types Email:
  │
  └─ onChange event
     ├─ Update: formData.email = "admin@..."
     ├─ Clear: fieldErrors.email (if exists)
     └─ Re-render: Form shows live feedback

User Types Password:
  │
  └─ onChange event
     ├─ Update: formData.password = "Pass123"
     ├─ Calculate: passwordStrength (via useMemo)
     ├─ Show: Strength meter + checklist
     └─ Re-render: Indicators update

User Submits Form:
  │
  └─ onSubmit event
     ├─ Set: isLoading = true
     ├─ Disable: Form inputs and button
     ├─ POST: /api/auth/register
     │
     ├─ Response Success:
     │  ├─ Set: success = true
     │  ├─ Set: fieldErrors = {}
     │  ├─ Clear: formData
     │  ├─ Disable: Form (shows success state)
     │  └─ After 2s: router.push(/admin/verify-email)
     │
     └─ Response Error:
        ├─ Set: isLoading = false
        ├─ Set: fieldErrors = data.errors (if present)
        ├─ Set: error = data.error (if general)
        ├─ Enable: Form (user can retry)
        └─ User sees errors and can fix
```

---

## Mobile Responsiveness

```
Desktop (≥1024px):
┌────────────────────────────────────────────┐
│ Header                                     │
└────────────────────────────────────────────┘
┌───────────────────────┐  ┌────────────────┐
│  Information Panel    │  │  Form Card     │
│  (Sticky, Left)      │  │  (Right)       │
│                      │  │                │
│  - Create Account    │  │  Email input   │
│  - Benefits (3)      │  │  Password      │
│  - Sign In Link      │  │  Confirm Pass  │
│  - About Links       │  │  Submit button │
│                      │  │  Sign In link  │
└───────────────────────┘  └────────────────┘

Tablet (768px - 1023px):
┌────────────────────────────────────────────┐
│ Header                                     │
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│ Information Panel                          │
│ - Create Account                           │
│ - Benefits (3) displayed inline            │
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│ Form Card                                  │
│ - Email input                              │
│ - Password                                 │
│ - Confirm Password                         │
│ - Submit button                            │
│ - Sign In link                             │
└────────────────────────────────────────────┘

Mobile (< 768px):
┌──────────────────────┐
│ Header               │
└──────────────────────┘
┌──────────────────────┐
│ Information Panel    │
│ - Create Account     │
│ - Benefits stacked   │
│   (1 per line)       │
│ - Sign In Link       │
└──────────────────────┘
┌──────────────────────┐
│ Form Card            │
│ (Full width)         │
│ - Email (full width) │
│ - Password (full)    │
│ - Confirm (full)     │
│ - Submit (full)      │
│ - Sign In Link       │
└──────────────────────┘
```

---

**Diagrams Version:** 1.0
**Last Updated:** 2026-04-25
**Status:** Complete ✅

