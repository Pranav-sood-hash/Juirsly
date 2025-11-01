# Supabase Authentication Setup Guide

This guide will walk you through setting up a complete authentication system using Supabase with email verification and password reset functionality.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Environment Configuration](#environment-configuration)
4. [Email Configuration](#email-configuration)
5. [Authentication Features](#authentication-features)
6. [Testing Guide](#testing-guide)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)
- Access to an email account for testing

---

## Supabase Project Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: Choose a name (e.g., "Jurisly Auth")
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click **"Create new project"** and wait for setup to complete (~2 minutes)

### Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long JWT token)

---

## Environment Configuration

### Step 1: Create Environment File

Create a `.env` file in your project root:

```bash
# .env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Replace the placeholder values with your actual Supabase credentials.

### Step 2: Add to .gitignore

Make sure `.env` is in your `.gitignore` file to keep your keys secure:

```
# .gitignore
.env
.env.local
```

### Step 3: Verify Configuration

The Supabase client is already configured in `/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Email Configuration

### Step 1: Configure Email Settings

1. In Supabase dashboard, go to **Authentication** → **Email Templates**
2. You'll see templates for:
   - **Confirm signup** (email verification)
   - **Reset password**
   - **Magic Link**
   - **Change Email Address**

### Step 2: Customize Email Templates

#### Confirm Signup Template

This email is sent when users sign up. Customize it:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
```

**Important Settings:**
- **Confirmation URL**: Should redirect to `https://your-domain.com/auth/verify`
- The app will automatically handle the verification

#### Reset Password Template

This email is sent for password resets:

```html
<h2>Reset your password</h2>

<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't request this, you can safely ignore this email.</p>
```

**Important Settings:**
- **Confirmation URL**: Should redirect to `https://your-domain.com/auth/reset-password`

### Step 3: Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set your **Site URL**:
   - For development: `http://localhost:5173` (or your dev port)
   - For production: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `http://localhost:5173/auth/verify`
   - `http://localhost:5173/auth/reset-password`
   - Add production URLs when deploying

### Step 4: Email Provider Settings

**For Development (Default):**
- Supabase provides a built-in email service
- Limited to 3 emails per hour per user
- Emails may go to spam

**For Production (Recommended):**

1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Configure your own SMTP provider (recommended options):
   - **SendGrid** (free tier: 100 emails/day)
   - **Mailgun** (free tier: 5,000 emails/month)
   - **AWS SES** (very cheap, high volume)
   - **Resend** (modern, developer-friendly)

Example SMTP configuration (SendGrid):
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: your_sendgrid_api_key
Sender email: noreply@yourdomain.com
Sender name: Jurisly
```

---

## Authentication Features

### 1. Email + Password Signup

**How it works:**
1. User fills out signup form with name, email, and password
2. Supabase creates the user account
3. Verification email is sent automatically
4. User must click the link in the email to verify
5. After verification, user can log in

**Code Example:**
```typescript
const { signup } = useAuth();

const result = await signup(email, password, name);
if (result.success) {
  // Show success message
  // User will receive verification email
}
```

### 2. Email Verification

**How it works:**
1. User clicks verification link in email
2. Supabase processes the verification via URL hash
3. App detects `type=signup` in URL hash
4. Shows verification success page
5. Redirects to login

**Code Example:**
```typescript
// Automatically handled in App.tsx
useEffect(() => {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const type = hashParams.get('type');
  
  if (type === 'signup') {
    setCurrentPage('verify-email');
  }
}, []);
```

### 3. Login System

**How it works:**
1. User enters email and password
2. System checks if email is verified
3. If verified, user is logged in
4. If not verified, shows error message with option to resend

**Code Example:**
```typescript
const { login } = useAuth();

const result = await login(email, password);
if (result.success) {
  // User is logged in
} else {
  // Show error message
  // result.message contains the error
}
```

### 4. Password Reset

**How it works:**
1. User clicks "Forgot Password" on login page
2. Enters their email address
3. Receives password reset email
4. Clicks link in email
5. Enters new password
6. Password is updated, user can log in

**Code Example:**
```typescript
const { resetPassword } = useAuth();

// Request password reset
const result = await resetPassword(email);
if (result.success) {
  // Email sent
}

// Update password (after clicking email link)
const { updatePasswordWithToken } = useAuth();
const updateResult = await updatePasswordWithToken(newPassword);
```

### 5. Session Management

**How it works:**
- Supabase automatically manages sessions using JWT tokens
- Tokens are stored in localStorage
- Sessions persist across page refreshes
- Automatic token refresh before expiration

**Code Example:**
```typescript
// Check current session
const { data: { session } } = await supabase.auth.getSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // User signed in
  } else if (event === 'SIGNED_OUT') {
    // User signed out
  }
});
```

---

## Testing Guide

### Local Development Testing

#### 1. Test Signup Flow

```bash
# Start the development server
npm run dev
```

1. Navigate to signup page
2. Fill in:
   - Name: "Test User"
   - Email: your-email@example.com
   - Password: "TestPass123!"
3. Click "Sign Up"
4. Check your email inbox (and spam folder)
5. Click the verification link
6. Verify you're redirected to verification success page
7. Try logging in with your credentials

#### 2. Test Email Verification

1. After signup, check email
2. Click verification link
3. Should see "Email Verified!" message
4. Should redirect to login page after 3 seconds
5. Log in with verified account

#### 3. Test Password Reset

1. On login page, click "Forgot Password"
2. Enter your email
3. Check email for reset link
4. Click the reset link
5. Enter new password (min 8 characters)
6. Confirm password matches
7. Submit form
8. Should see success message
9. Try logging in with new password

#### 4. Test Unverified Login Attempt

1. Sign up with a new email
2. Don't verify the email
3. Try to log in
4. Should see error: "Please verify your email before logging in"

### Production Testing Checklist

- [ ] Signup creates user in Supabase dashboard
- [ ] Verification email arrives within 1 minute
- [ ] Verification link redirects correctly
- [ ] Login works after verification
- [ ] Login fails before verification
- [ ] Password reset email arrives
- [ ] Password reset link works
- [ ] New password allows login
- [ ] Session persists after page refresh
- [ ] Logout clears session
- [ ] Email templates display correctly
- [ ] Emails don't go to spam (with custom SMTP)

### Monitoring in Supabase Dashboard

1. **View Users**: Go to **Authentication** → **Users**
   - See all registered users
   - Check email verification status
   - Manually verify emails if needed

2. **View Logs**: Go to **Logs** → **Auth Logs**
   - See all authentication events
   - Debug failed login attempts
   - Monitor email sending

3. **Check Email Rate Limits**:
   - Built-in service: 3 emails/hour/user
   - Custom SMTP: depends on provider

---

## Troubleshooting

### Issue: Emails Not Arriving

**Solutions:**
1. Check spam/junk folder
2. Verify email settings in Supabase dashboard
3. Check Supabase logs for email sending errors
4. Ensure Site URL is configured correctly
5. Consider setting up custom SMTP for production

### Issue: "Invalid redirect URL" Error

**Solutions:**
1. Go to **Authentication** → **URL Configuration**
2. Add your redirect URLs to the allowed list:
   - `http://localhost:5173/auth/verify`
   - `http://localhost:5173/auth/reset-password`
3. Include both development and production URLs

### Issue: Email Verification Link Doesn't Work

**Solutions:**
1. Check that URL hash parameters are present
2. Verify App.tsx is checking for `type=signup`
3. Check browser console for errors
4. Ensure Supabase client is initialized correctly

### Issue: "Email not confirmed" Error on Login

**Solutions:**
1. This is expected behavior - user must verify email first
2. Check if verification email was sent
3. Resend verification email using the resend function
4. Manually verify user in Supabase dashboard (for testing)

### Issue: Password Reset Link Expired

**Solutions:**
1. Password reset links expire after 1 hour
2. Request a new password reset
3. Check email timestamp
4. Ensure user clicks link within 1 hour

### Issue: Environment Variables Not Loading

**Solutions:**
1. Ensure `.env` file is in project root
2. Restart development server after creating `.env`
3. Check variable names start with `VITE_`
4. Verify no typos in variable names

### Issue: CORS Errors

**Solutions:**
1. Check Site URL in Supabase settings
2. Ensure redirect URLs are whitelisted
3. Verify you're using the correct Supabase URL
4. Check browser console for specific CORS error

---

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to git
- Use different keys for development and production
- Rotate keys if they're exposed

### 2. Email Verification
- Always require email verification before allowing login
- Don't reveal if an email exists in the system (security)
- Set reasonable expiration times for verification links

### 3. Password Requirements
- Minimum 6 characters (consider increasing to 8+)
- Consider requiring special characters
- Implement password strength indicator

### 4. Rate Limiting
- Supabase has built-in rate limiting
- Consider additional rate limiting for password resets
- Monitor for suspicious activity in logs

### 5. Session Management
- Sessions expire automatically
- Implement logout on all devices feature
- Clear sensitive data on logout

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [React Auth Patterns](https://supabase.com/docs/guides/auth/auth-helpers/react)

---

## Support

If you encounter issues:
1. Check Supabase dashboard logs
2. Review browser console errors
3. Verify environment configuration
4. Test with a different email provider
5. Check Supabase status page for outages

---

## Next Steps

After setting up authentication:
1. Customize email templates with your branding
2. Set up custom SMTP for production
3. Add social login providers (Google, GitHub, etc.)
4. Implement role-based access control
5. Add two-factor authentication
6. Set up monitoring and alerts

---

**Last Updated**: November 2025
**Version**: 1.0.0
