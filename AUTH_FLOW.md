# BuySell Liberia Authentication System

This document explains the authentication flow implemented in the BuySell Liberia application.

## Overview

The application uses a **unified authentication system** that combines:
- **Custom JWT-based authentication** with MongoDB storage
- **Firebase Authentication** only for Google OAuth (extracting user data)
- **Email verification** with OTP codes
- **HTTP-only cookies** for secure token storage

## Authentication Flows

### 1. Email/Password Registration Flow

```
User fills signup form → Backend creates pending user → OTP sent to email → 
User enters OTP → Email verified → User created in MongoDB → Success message → Redirect to login
```

**Steps:**
1. User provides: Full Name, Username, Email, Phone (optional), Password, Country
2. Backend validates and stores user in `PendingUser` collection
3. 6-digit OTP generated and sent via email
4. User enters OTP in verification form
5. Backend verifies OTP and moves user from `PendingUser` to `User` collection
6. Success screen shown, then redirects to login

### 2. Email/Password Login Flow

```
User enters credentials → Backend validates → JWT tokens generated → 
Tokens stored in HTTP-only cookies → User authenticated
```

**Steps:**
1. User provides email and password
2. Backend validates credentials against MongoDB
3. Access token (15min) and refresh token (7 days) generated
4. Tokens stored as HTTP-only cookies
5. User data returned and stored in React context

### 3. Google OAuth Registration Flow

```
User clicks "Continue with Google" → Firebase popup → User data extracted → 
Check if user exists → If not, pre-fill signup form → Complete manual fields → 
OTP verification → User created in MongoDB
```

**Steps:**
1. User clicks "Continue with Google"
2. Firebase handles Google OAuth popup
3. Extract user data (email, name, photo)
4. Check if user exists in our MongoDB
5. If new user: pre-fill signup form with Google data
6. User completes remaining fields (username, country, password)
7. Follow standard OTP verification flow
8. User stored in MongoDB (not Firebase)

### 4. Google OAuth Login Flow

```
User clicks "Continue with Google" → Firebase popup → Extract email → 
Check MongoDB → If exists, generate JWT → Login successful
```

**Steps:**
1. User clicks "Continue with Google" on login form
2. Firebase handles Google OAuth
3. Extract email from Google response
4. Check if user exists in MongoDB with that email
5. If exists: generate JWT tokens and login
6. If not exists: redirect to complete registration

### 5. Forgot Password Flow

```
User enters email → OTP sent → User enters OTP → New password form → 
Password updated in MongoDB → Redirect to login
```

**Steps:**
1. User provides email on forgot password form
2. Backend generates and sends password reset OTP
3. User enters 6-digit OTP
4. OTP verified, password reset form shown
5. User enters new password (with confirmation)
6. Password hashed and updated in MongoDB
7. Redirect to login with success message

## Technical Implementation

### Database Models

#### User Model (MongoDB)
```typescript
{
  fullName: string
  username: string (unique)
  email: string (unique) 
  phone?: string
  password: string (hashed with bcrypt)
  country: string
  isEmailVerified: boolean
  refreshToken?: string
  role: "user" | "admin"
  status: "active" | "inactive" | "suspended"
  createdAt: Date
  updatedAt: Date
}
```

#### PendingUser Model (MongoDB)
```typescript
{
  fullName: string
  username: string
  email: string
  phone?: string
  password: string (hashed)
  country: string
  createdAt: Date
  expiresAt: Date (24 hours from creation)
}
```

#### OTP Model (MongoDB)
```typescript
{
  email: string
  otp: string (6-digit)
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
  createdAt: Date
  expiresAt: Date (10 minutes from creation)
}
```

### Security Features

1. **Password Security**
   - Passwords hashed with bcrypt (salt rounds: 12)
   - Minimum 6 characters required

2. **Token Security**
   - JWT access tokens (15 minutes expiry)
   - JWT refresh tokens (7 days expiry)
   - HTTP-only cookies (secure in production)
   - SameSite: strict

3. **OTP Security**
   - 6-digit numeric codes
   - 10-minute expiry
   - One-time use (deleted after verification)
   - Rate limiting on resend (60 seconds)

4. **Email Verification**
   - Required before login
   - Automatic cleanup of expired pending users
   - Secure SMTP with Gmail

### API Endpoints

#### Authentication Routes
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/forgot-password` - Send password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `POST /api/auth/resend-otp` - Resend verification OTP
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile

#### Google Auth Routes
- `POST /api/auth/check-google-user` - Check if Google user exists
- `POST /api/auth/google-login` - Login with Google account

### Environment Variables

Required environment variables:
```
MONGO_URI=mongodb://localhost:27017/buysell
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### Frontend Components

- **AuthProvider**: React context for authentication state
- **AuthModal**: Multi-step authentication modal
- **SignupForm**: Registration form with Google OAuth
- **LoginForm**: Login form with Google OAuth  
- **OtpForm**: OTP verification with resend functionality
- **ForgotPasswordForm**: Password reset initiation
- **VerificationSuccess**: Success screen after email verification

## Error Handling

The system includes comprehensive error handling:
- Form validation with user-friendly messages
- API error responses with specific error codes
- Toast notifications for user feedback
- Automatic retry mechanisms for failed requests
- Graceful fallbacks for network issues

## Testing the System

To test the authentication system:

1. **Setup Environment**
   ```bash
   cp .env.example .env.local
   # Fill in your actual values
   ```

2. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud
   ```

3. **Configure Gmail SMTP**
   - Enable 2FA on Gmail
   - Generate App Password
   - Use App Password in SMTP_PASS

4. **Setup Firebase (for Google Auth)**
   - Create Firebase project
   - Enable Google Authentication
   - Add your domain to authorized domains
   - Update environment variables

5. **Test Flows**
   - Registration with email verification
   - Login with email/password
   - Google OAuth registration
   - Google OAuth login
   - Password reset flow
   - Token refresh

## Security Considerations

1. **Never store sensitive data in localStorage**
2. **Use HTTPS in production**
3. **Implement rate limiting on authentication endpoints**  
4. **Monitor for brute force attacks**
5. **Regular security audits of dependencies**
6. **Implement account lockout after failed attempts**
7. **Use secure password requirements**
8. **Monitor unusual login patterns**

## Future Enhancements

1. **Multi-factor Authentication (MFA)**
2. **Social login with Facebook, Apple**
3. **Account recovery without email**
4. **Advanced user roles and permissions**
5. **Session management dashboard**
6. **Login history and device tracking**
7. **Email templates with better design**
8. **SMS-based OTP as backup**
