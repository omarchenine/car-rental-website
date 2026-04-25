# Email Authentication System - Quick Start

## ⚡ Quick Setup (5 minutes)

### 1. Get Resend API Key
- Visit [resend.com](https://resend.com)
- Create free account (no credit card)
- Go to API Keys section
- Copy API key (format: `re_xxx...`)

### 2. Add Environment Variables
In Vercel Project Settings → Environment Variables:

```
RESEND_API_KEY=re_your_key_here
ADMIN_EMAIL_FROM=noreply@dcmotors.vercel.app
NEXT_PUBLIC_SITE_URL=https://dcmotors.vercel.app
```

### 3. Deploy
```bash
git push  # or deploy from Vercel dashboard
```

### 4. Create First Admin
1. Visit `/admin/register`
2. Enter email, password (min 8 chars, needs uppercase, lowercase, number)
3. Click "Create Account"
4. Check email for verification link
5. Click link to verify
6. Go to `/admin/login` and sign in

## 📋 Environment Variables Checklist

Required (must add):
- [ ] RESEND_API_KEY
- [ ] ADMIN_EMAIL_FROM
- [ ] NEXT_PUBLIC_SITE_URL (optional but recommended)

Already configured (don't change):
- [ ] JWT_SECRET
- [ ] MONGODB_URI

## 🔗 Important URLs

Development:
- Register: `http://localhost:3000/admin/register`
- Login: `http://localhost:3000/admin/login`
- Forgot Password: `http://localhost:3000/admin/forgot-password`

Production:
- Register: `https://dcmotors.vercel.app/admin/register`
- Login: `https://dcmotors.vercel.app/admin/login`
- Forgot Password: `https://dcmotors.vercel.app/admin/forgot-password`

## 📧 Email Templates

The system sends three types of emails:

1. **Verification Email**
   - When: User completes registration
   - Contains: Verification link (expires in 24 hours)
   - User action: Click link to activate account

2. **Password Reset Email**
   - When: User requests password reset
   - Contains: Reset link (expires in 1 hour)
   - User action: Click link, enter new password

3. **Welcome Email**
   - When: Email verified (after clicking verification link)
   - Contains: Link to admin portal

## 🔐 Password Requirements

Passwords must have:
- ✓ At least 8 characters
- ✓ At least one UPPERCASE letter
- ✓ At least one lowercase letter
- ✓ At least one number (0-9)

Example valid password: `AdminPass123`

## 🧪 Testing

### Test Email in Development

The easiest way to test emails in development:

1. Use a catch-all email service like [Mailtrap](https://mailtrap.io) or [MailHog](https://github.com/mailhog/MailHog)
2. Update RESEND_API_KEY to test service
3. Emails will be captured and viewable

Or use real email:
1. Use your real email for registration
2. Check spam folder if email doesn't arrive
3. Resend has good deliverability (free tier is reliable)

### Manual API Testing

Register:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123",
    "confirmPassword":"TestPass123"
  }'
```

Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123"
  }'
```

## 🐛 Troubleshooting

### Email not received
- [ ] Check spam folder
- [ ] Verify RESEND_API_KEY is correct
- [ ] Check ADMIN_EMAIL_FROM is valid
- [ ] Ensure user email is correct
- [ ] Check Resend dashboard for bounce

### Verification link not working
- [ ] Link expires after 24 hours
- [ ] Check URL has token parameter
- [ ] Try registering again
- [ ] Check MongoDB for user record

### Can't log in after verification
- [ ] Verify email is confirmed in database
- [ ] Check password is correct
- [ ] Ensure user exists: `db.adminUsers.find()`
- [ ] Clear cookies and try again

### Cookies not working
- [ ] Development: should work in localhost
- [ ] Production: requires HTTPS (automatic on Vercel)
- [ ] Check browser settings (allow cookies)
- [ ] Try incognito/private mode

## 📚 Files Created/Modified

### New Files (13)
1. `lib/admin-types.ts` - User schema & validation
2. `lib/crypto.ts` - Secure token generation
3. `lib/email-service.ts` - Email sending
4. `app/api/auth/register/route.ts` - Registration API
5. `app/api/auth/verify-email/route.ts` - Verification API
6. `app/api/auth/request-reset/route.ts` - Reset request API
7. `app/api/auth/reset-password/route.ts` - Password reset API
8. `app/admin/register/page.tsx` - Registration page
9. `app/admin/verify-email/page.tsx` - Verification page
10. `app/admin/forgot-password/page.tsx` - Forgot password page
11. `app/admin/reset-password/page.tsx` - Reset password page
12. `components/admin/register-form.tsx` - Register form
13. `components/admin/email-verification-form.tsx` - Verification form

### Updated Files (5)
1. `lib/mongodb.ts` - Added AdminUser collection
2. `lib/auth.ts` - Added password hashing functions
3. `app/api/auth/login/route.ts` - Changed to email + password
4. `components/admin/login-form.tsx` - Updated for email login
5. `components/admin/password-reset-form.tsx` - New reset form
6. `components/admin/forgot-password-form.tsx` - New forgot password form

## ✅ Verification Checklist

Before going live:

- [ ] RESEND_API_KEY added to environment
- [ ] ADMIN_EMAIL_FROM configured
- [ ] NEXT_PUBLIC_SITE_URL set correctly
- [ ] Deployed to Vercel
- [ ] Tested registration flow
- [ ] Tested email verification
- [ ] Tested login with email + password
- [ ] Tested password reset flow
- [ ] Verified session cookie is set
- [ ] Checked MongoDB for user records
- [ ] Confirmed emails are being sent
- [ ] Tested in private/incognito mode

## 🚀 Deployment

### Local Testing
```bash
pnpm dev
# Visit http://localhost:3000/admin/register
```

### Deploy to Vercel
```bash
git add .
git commit -m "Add email authentication system"
git push
# Vercel deploys automatically
```

### Post-Deployment
1. Wait for deployment to complete
2. Visit production URL `/admin/register`
3. Test registration and email flow
4. Test login
5. Confirm everything works

## 📞 Support Resources

- Resend Docs: https://resend.com/docs
- MongoDB Docs: https://docs.mongodb.com/
- Next.js Auth: https://nextjs.org/docs/app/building-your-application/authentication
- bcryptjs: https://github.com/dcodeIO/bcrypt.js

## 🔄 Next Steps

1. [ ] Add environment variables
2. [ ] Deploy to Vercel
3. [ ] Create first admin account
4. [ ] Test all flows
5. [ ] Monitor email delivery
6. [ ] Keep system updated

---

**Quick Reference Card**

| Item | Value |
|------|-------|
| Registration URL | `/admin/register` |
| Login URL | `/admin/login` |
| Forgot Password | `/admin/forgot-password` |
| Verification Token Expiry | 24 hours |
| Reset Token Expiry | 1 hour |
| Session Expiry | 7 days |
| Password Min Length | 8 characters |
| Token Length | 32 bytes (256 bits) |
| Hash Algorithm | bcryptjs (12 rounds) |
| Session Storage | HTTP-only cookie |

---

**Questions? See EMAIL_AUTH_SETUP.md for complete documentation.**
