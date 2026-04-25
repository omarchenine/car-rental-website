# User Registration Backend - Architecture & Security

## High-Level Backend Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     DCMOTORS REGISTRATION SYSTEM                │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Frontend Layer  │────▶│   API Routes     │────▶│   Services       │
│                  │     │                  │     │                  │
│ - Form          │     │ - Validation     │     │ - Email Service  │
│ - Validation    │     │ - Hash Password  │     │ - Auth Utils     │
│ - Error Display │     │ - Create User    │     │ - Crypto Utils   │
│                  │     │ - Verify Email   │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   MongoDB Database   │
                    │                      │
                    │ - Users Collection   │
                    │ - Indexes            │
                    │ - Encrypted Storage  │
                    └──────────────────────┘
```

---

## Registration Flow (Detailed)

### Step 1: Form Submission
```
Browser: POST /api/users/register
└─ Headers: Content-Type: application/json
└─ Body: {
     email: string,
     firstName: string,
     lastName: string,
     password: string,
     confirmPassword: string
   }
```

### Step 2: Input Validation (Route Handler)
```typescript
// File: app/api/users/register/route.ts

1. Parse JSON body
2. Extract fields: email, firstName, lastName, password, confirmPassword
3. Run validateRegister() function
   └─ Validates all fields (same as client-side)
   └─ Returns errors or ok: true
4. If errors, return 400 with field-specific messages
```

### Step 3: Duplicate Email Check
```typescript
1. Get users collection from MongoDB
2. Query: db.users.findOne({ email: email.toLowerCase() })
3. If found:
   └─ Return 409 Conflict
   └─ Error: "Email already registered"
4. If not found:
   └─ Continue to password hashing
```

### Step 4: Password Hashing
```typescript
// Using bcryptjs library
const passwordHash = await bcryptjs.hash(password, 12)

Process:
1. Generate random salt (included in hash)
2. Run 12 rounds of bcryptjs algorithm
3. Result: 60-character hash starting with "$2b$12$"
4. Time: 150-200ms per hash (intentionally slow)
5. Unique: Same password produces different hash each time
6. Secure: Cannot reverse to get original password

Example:
Input:  "MyPassword123"
Output: "$2b$12$iJ7bUdWLqMFMxPvhVbSPDeBM3YkQQQqQqQqQqQqQqQqQqQqQqQqQq"
```

### Step 5: Token Generation
```typescript
// Using Node.js crypto module
const token = crypto.randomBytes(32).toString('hex')

Process:
1. Generate 32 random bytes
2. Convert to hexadecimal string
3. Result: 64-character hex string
4. Entropy: 256 bits (impossible to guess)
5. Uniqueness: Every call produces different token

Example:
Output: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6"
```

### Step 6: User Document Creation
```typescript
const result = await users.insertOne({
  email: email.toLowerCase(),           // Normalize
  firstName: firstName.trim(),          // Clean
  lastName: lastName.trim(),            // Clean
  passwordHash,                         // NEVER plain password
  isVerified: false,                    // Required before login
  verificationToken: token,             // 64-char hex string
  verificationTokenExpires: Date(now + 24h), // 24-hour window
  createdAt: new Date(),
  updatedAt: new Date(),
})

Result: { insertedId: ObjectId(...) }
```

### Step 7: Email Sending
```typescript
const emailSent = await sendVerificationEmail(
  email,
  verificationLink,
  `Welcome, ${firstName}!`
)

// Email Service (Resend):
// From: noreply@dcmotors.vercel.app
// To: user@example.com
// Subject: Verify Your Email - DCMotors
// Body: HTML email with verification link
//       https://dcmotors.vercel.app/register/verify-email?token=abc123...

Result: true or false (email sent or failed)
```

### Step 8: Response to Client
```typescript
// Success (201):
{
  ok: true,
  message: "Account created! Check your email for verification link."
}

// Or if email failed (201 with flag):
{
  ok: true,
  message: "Account created, but email failed. Try resending.",
  needsResend: true
}

// Validation error (400):
{
  errors: {
    email: "Invalid email format",
    password: "Password must contain uppercase letter",
    ...
  }
}

// Duplicate email (409):
{
  error: "Email already registered"
}

// Server error (500):
{
  error: "Internal server error"
}
```

---

## Email Verification Flow

### Step 1: User Clicks Email Link
```
Email Link:
https://dcmotors.vercel.app/register/verify-email?token=abc123...

Client-side (Next.js):
- Route handler extracts token from query parameter
- Displays: "Verify Your Email" with button
- User clicks button
```

### Step 2: Verification Request
```
Browser: POST /api/users/verify-email
└─ Body: { token: "abc123..." }
```

### Step 3: Token Validation
```typescript
// File: app/api/users/verify-email/route.ts

1. Extract token from request body
2. Query database:
   db.users.findOne({
     verificationToken: token,
     verificationTokenExpires: { $gt: new Date() }  // Not expired
   })

3. If NOT found:
   └─ Return 400: "Invalid or expired verification link"
4. If found:
   └─ Continue to mark as verified
```

### Step 4: Update User Document
```typescript
const result = await users.updateOne(
  { _id: user._id },
  {
    $set: {
      isVerified: true,       // Can now login
      updatedAt: new Date(),
    },
    $unset: {
      verificationToken: "",  // Delete token (one-time use)
      verificationTokenExpires: "",
    },
  }
)

Result: { modifiedCount: 1 }  // One document updated
```

### Step 5: Response to Client
```typescript
{
  ok: true,
  message: "Email verified successfully",
  email: "user@example.com"
}

Status: 200 OK
```

### Step 6: Auto-Redirect
```
Client redirects to /login
User can now log in with email + password
```

---

## Database Schema Details

### Users Collection

```typescript
interface User {
  // MongoDB Fields
  _id: ObjectId
  
  // Identity Fields
  email: string                      // Unique, lowercase
  firstName: string                  // Required
  lastName: string                   // Required
  phoneNumber?: string               // Optional
  
  // Security Fields
  passwordHash: string               // bcryptjs hash, 60 chars
  
  // Verification Fields
  isVerified: boolean                // Account activated?
  verificationToken?: string         // 64-char hex, 32-byte entropy
  verificationTokenExpires?: Date    // Expires 24 hours after creation
  
  // Password Reset Fields
  resetToken?: string                // Same format as verification token
  resetTokenExpires?: Date           // Expires 1 hour after creation
  
  // Tracking Fields
  lastLogin?: Date                   // When user last logged in
  createdAt: Date                    // Account creation time
  updatedAt: Date                    // Last modification time
}
```

### Database Indexes

```
Index 1: email (UNIQUE)
├─ Purpose: Prevent duplicate emails, fast lookups
├─ Query: db.users.findOne({ email: "user@example.com" })
├─ Performance: O(1) - constant time
└─ Unique: true - enforces no duplicates at DB level

Index 2: verificationToken
├─ Purpose: Fast token validation during email verification
├─ Query: db.users.findOne({ verificationToken: token })
├─ Performance: O(1) - constant time
└─ Used: POST /api/users/verify-email

Index 3: resetToken
├─ Purpose: Fast token validation during password reset
├─ Query: db.users.findOne({ resetToken: token })
├─ Performance: O(1) - constant time
└─ Used: POST /api/auth/reset-password (future)

Index 4: createdAt (DESCENDING)
├─ Purpose: Chronological sorting, reporting
├─ Query: db.users.find({}).sort({ createdAt: -1 })
├─ Performance: O(log n) with index
└─ Used: Admin dashboard, analytics
```

---

## Security Implementation

### Password Security Strategy

#### Why Bcryptjs?
```
GOOD CHOICES:
✅ bcryptjs       - Designed for passwords, slow = secure
✅ argon2         - Modern, memory-hard, very secure
✅ scrypt         - Good alternative, well-tested

BAD CHOICES:
❌ MD5            - Cryptographically broken
❌ SHA1           - Weak, prone to collisions
❌ SHA256         - Fast hashing, bad for passwords
❌ Base64         - Not encryption, just encoding
```

#### Bcryptjs Algorithm
```
Input: "MyPassword123"
  ↓
1. Generate random 16-byte salt
2. Hash password + salt with Blowfish cipher
3. Repeat step 2 twelve times (2^12 = 4096 iterations)
4. Time: ~150-200ms (intentionally slow)
  ↓
Output: "$2b$12$salt+hash" (60 characters)
  ├─ $2b$ = version 2b
  ├─ $12$ = 12 rounds (cost factor)
  ├─ salt (22 characters)
  └─ hash (31 characters)

Cannot reverse this. The only way to verify is:
bcryptjs.compare("MyPassword123", hash) → true/false
```

### Token Security Strategy

#### Cryptographically Secure Random
```
Method: crypto.randomBytes(32).toString('hex')

Why 32 bytes?
├─ 32 bytes = 256 bits
├─ Bits needed for security = 128 minimum (2^128 attempts to guess)
├─ We use 256 bits = 2^256 (astronomically large)
└─ Practically impossible to guess or brute force

Entropy: ~3.4 × 10^77 possible tokens
Guess rate: 1 billion guesses per second
Time to guess: 10^59 years (age of universe: 10^10 years)
```

#### Token Lifecycle
```
1. Generation (Registration)
   └─ crypto.randomBytes(32).toString('hex')
   └─ Time: instant
   └─ Result: "a1b2c3d4..."

2. Storage (in MongoDB)
   └─ verificationToken: "a1b2c3d4..."
   └─ verificationTokenExpires: Date.now() + 24h
   └─ Indexed for fast lookups

3. Transmission (in Email)
   └─ Email link: https://...?token=a1b2c3d4...
   └─ Link is public but token is still secure
   └─ Only the user receives this email

4. Usage (User clicks link)
   └─ Token extracted from URL
   └─ Sent back to server: POST /verify-email
   └─ Server validates: exists AND not expired

5. Validation (Server checks)
   └─ Does token exist in database? Yes/No
   └─ Is token expired? Compare with verificationTokenExpires
   └─ Both must be true to proceed

6. Invalidation (After verification)
   └─ MongoDB $unset: removes verificationToken
   └─ Token is gone from database
   └─ Old links become invalid
   └─ Cannot verify twice with same token
```

### Input Sanitization

#### Email Sanitization
```
Raw Input: "  USER@EXAMPLE.COM  "
  ↓ trim()
"USER@EXAMPLE.COM"
  ↓ toLowerCase()
"user@example.com"
  ↓ validateEmail()
Validate: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  ✓ Valid format
  ↓ Stored in MongoDB
"user@example.com" (normalized, lowercase)

Why normalize?
├─ Prevents duplicate accounts (User@Example.com vs user@example.com)
├─ Case-insensitive email lookups
├─ Cleaner database (consistent format)
└─ Better UX (forgot password by email works)
```

#### Name Sanitization
```
Raw Input: "  John  "
  ↓ trim()
"John"
  ↓ validateName()
Check: /^[a-zA-Z\s\-']+$/
Check: length between 2-50
  ✓ Valid
  ↓ Stored in MongoDB
"John" (trimmed, safe to display)

Why this validation?
├─ Prevents injection attacks in names
├─ Allows common name formats (hyphens, apostrophes)
├─ Safe to display in UI without escaping
└─ Prevents very long names (50 char limit)
```

#### Password Handling
```
Raw Input: "MyPassword123"
  ↓ (NO trimming - spaces could be intentional)
"MyPassword123"
  ↓ validatePassword()
Check: length >= 8 ✓
Check: has uppercase ✓
Check: has lowercase ✓
Check: has number ✓
  ✓ Valid
  ↓ bcryptjs.hash() (immediate, server-side)
"$2b$12$hash..." (hashed)
  ↓ Stored in MongoDB
"$2b$12$hash..." (never plain password)

Why NOT sanitize password?
├─ Spaces could be intentional
├─ Trimming could make password weaker
├─ User knows their own password format
└─ Hashing handles any input safely
```

### Error Message Security

#### Never Reveal
```
❌ "Email already registered" (reveals user enumeration)
❌ "Database query failed" (reveals tech stack)
❌ "bcryptjs hash generation error" (reveals algorithm)
❌ "$2b$12$iJ7b..." (exposes partial hash)
❌ "Token 'abc123...' not found" (exposes token)
```

#### Generic Responses
```
✅ "Invalid email or password" (for login)
✅ "Invalid or expired verification link" (token is unique anyway)
✅ "Account creation failed" (user error, retry)
✅ "Internal server error" (don't expose details)

Why generic?
├─ Prevents attacker from enumerating existing emails
├─ Doesn't leak algorithm or implementation details
├─ Makes debugging harder for attackers
├─ Server logs contain details for administrators
```

---

## Rate Limiting & Abuse Prevention

### Current Implementation
```
Delay on Failed Attempts:
└─ 300ms delay before returning error
└─ Slows down brute force attacks
└─ Small impact on legitimate users
```

### Recommended Enhancements
```
Rate Limiting (by IP):
├─ 5 registration attempts per hour per IP
├─ 10 login attempts per hour per IP
├─ 3 verification attempts per hour per IP
└─ Return 429 (Too Many Requests) if exceeded

Account Lockout:
├─ Lock account after 5 failed login attempts
├─ Unlock after 30 minutes
├─ Notify user via email
└─ Prevent brute force attacks

Monitoring:
├─ Alert if 100+ registrations from one IP
├─ Alert if 50+ failed login attempts
├─ Log suspicious patterns
└─ Manual review of flagged accounts
```

---

## Data Protection Best Practices

### At Rest (in Database)
```
MongoDB Encryption:
├─ Database encryption (Vercel managed)
├─ Connection string in env var (not in code)
├─ Passwords stored as bcryptjs hashes
├─ Tokens stored as hex strings
├─ Backups encrypted (Vercel managed)

Access Control:
├─ MongoDB connection via URI only
├─ No direct database access (all via API)
├─ Read-only logs for auditing
└─ Admin-only access to sensitive data
```

### In Transit (Over Network)
```
HTTPS:
├─ Enforced by Vercel (HTTP redirects to HTTPS)
├─ TLS 1.3 (modern encryption)
├─ All data encrypted during transmission
├─ Certificate auto-renewed by Vercel

Headers:
├─ Content-Security-Policy (prevents XSS)
├─ X-Frame-Options (prevents clickjacking)
├─ Strict-Transport-Security (HTTPS only)
├─ X-Content-Type-Options (prevent MIME sniffing)
```

### In Memory (Server)
```
Password Handling:
├─ Plain password only in function parameter
├─ Hashed immediately
├─ Reference cleared after hashing
├─ Garbage collection removes from memory

Logging:
├─ NEVER log passwords
├─ NEVER log tokens
├─ NEVER log sensitive user data
├─ Only log non-sensitive events (registration, login)
```

---

## Validation Layers

### Layer 1: Client-Side (Browser)
```
Purpose: User feedback, UX improvement
Triggers: onChange event on inputs
Coverage: Email format, password strength, name format

Code runs in: Browser (JavaScript)
Speed: Instant
Security: None (attacker can bypass)
Example: Email field shows error message
```

### Layer 2: API Route Validation
```
Purpose: Security, prevent invalid data to DB
Triggers: POST request to API
Coverage: All fields validated again (same rules as client)

Code runs in: Next.js API route (Node.js)
Speed: ~10ms
Security: High (server-side, cannot bypass)
Example: validateRegister() function called
```

### Layer 3: Database Constraints
```
Purpose: Final defense, DB integrity
Triggers: Insert/update operations
Coverage: Email uniqueness, data types

Code runs in: MongoDB
Speed: ~50ms
Security: Very High (database enforces rules)
Example: unique index on email field
```

### Combined Security
```
Valid input:     Pass all 3 layers    ✓ Accepted
Client bypass:   Fail layer 2 or 3    ✗ Rejected
Malformed data:  Fail layer 1 or 3    ✗ Rejected
SQL injection:   Fail layer 2         ✗ Rejected
Bad script:      Fail layer 2         ✗ Rejected

Result: Multiple validation layers ensure security
```

---

## Error Handling & Logging

### Error Handling
```typescript
try {
  // 1. Parse request
  const body = await req.json()
  
  // 2. Validate
  const validation = validateRegister(...)
  if (!validation.ok) return error 400
  
  // 3. Database operations
  const user = await users.findOne(...)
  if (user) return error 409
  
  // 4. Hashing
  const hash = await hashPassword(...)
  
  // 5. Insert
  const result = await users.insertOne(...)
  if (!result.insertedId) return error 500
  
  // 6. Email
  const sent = await sendEmail(...)
  
  // 7. Success
  return success 201
} catch (error) {
  // Catch unexpected errors
  console.error('[Register] Error:', error)
  return error 500 (generic message)
}
```

### What Gets Logged
```
✓ Login attempt (user@example.com)
✓ Successful registration (user@example.com)
✓ Email verification success
✓ Failed verification attempts (generic)
✓ API errors (with stack trace)
✓ Database connection issues

✗ Plain passwords
✗ Verification tokens
✗ Password hashes (visible, but no use)
✗ User IP addresses (privacy)
✗ Session tokens
```

---

## Monitoring & Health Checks

### Metrics to Track
```
Registration Metrics:
├─ Registrations per day
├─ Registration success rate
├─ Average registration time
├─ Email verification rate
├─ Failed registration reasons

API Metrics:
├─ Response times
├─ Error rates
├─ Database query times
├─ Email delivery times

Security Metrics:
├─ Duplicate email attempts
├─ Invalid password attempts
├─ Expired token attempts
├─ Verification failures
```

### Alerting
```
Alert if:
├─ Registration success rate < 80%
├─ Email verification rate < 60%
├─ API response time > 2000ms
├─ Database response time > 500ms
├─ Email delivery failure rate > 10%
├─ 100+ failed registrations from single IP
```

---

## Deployment Checklist

Before going to production:

- [ ] Environment variables set (MONGODB_URI, RESEND_API_KEY)
- [ ] Database indexes created (MongoDB)
- [ ] Email service configured (Resend)
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Rate limiting configured
- [ ] Error logging configured
- [ ] Database backups enabled
- [ ] Monitoring/alerts set up
- [ ] Tested registration flow end-to-end
- [ ] Tested email verification
- [ ] Tested error scenarios
- [ ] Security review completed

---

**Document Version**: 1.0
**Status**: Complete ✅
**Last Updated**: 2026-04-25

For implementation details, see `USER_REGISTRATION_GUIDE.md`
For quick reference, see `USER_REGISTRATION_QUICKSTART.md`
