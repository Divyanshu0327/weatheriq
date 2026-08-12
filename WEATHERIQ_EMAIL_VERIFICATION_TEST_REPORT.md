# WeatherIQ — Complete Email Verification System Test Report

**Test Date**: 2026-08-12  
**Architecture**: `AuthController` → `AuthService` → `EmailVerificationService` → `EmailService` (`SmtpEmailService`)  
**Database**: MongoDB (`users` and `emailVerificationTokens` collections)  
**Network Status**: **BLOCKED — Gmail SMTP ports 465, 587, and 2525 are unreachable from current host/hostel network.**

---

## 📊 Summary of Test Results

| Feature / Test Case | Result | Details & Verification |
|---|---|---|
| **Test Case 1: User Registration** | **PASS** | `POST /api/auth/register` creates user with `emailVerified = false`, generates a cryptographically secure token, hashes it with SHA-256, and stores it in MongoDB. |
| **Test Case 2: Unverified Login Restriction** | **PASS** | Attempting login before verification is rejected with `403 Forbidden` (`EMAIL_NOT_VERIFIED: Please verify your email address before logging in.`). No JWT issued. |
| **Test Case 3: Token Verification API** | **PASS** | `GET /api/auth/verify-email?token=...` hashes incoming token with SHA-256, matches MongoDB record, updates `emailVerified = true`, and deletes token record. |
| **Test Case 4: Post-Verification Login** | **PASS** | `POST /api/auth/login` after successful verification issues valid JWT token cleanly. |
| **Test Case 5: Token Single-Use Security** | **PASS** | Reusing a previously verified token returns `400 Bad Request` ("Verification link is invalid or expired."). |
| **Test Case 6: Expired / Invalid Token** | **PASS** | Passing an invalid or non-existent token returns `400 Bad Request`. |
| **Test Case 7: Resend Verification Link** | **PASS** | `POST /api/auth/resend-verification` invalidates previous user tokens, generates a new token hash, and sends a new verification link. |
| **Test Case 8: Resend Cooldown (60s Limit)** | **PASS** | Requesting resend within 60 seconds returns `429 Too Many Requests` ("Please wait X seconds before requesting another verification email."). |
| **Test Case 9: Already Verified Resend** | **PASS** | Requesting resend for an already verified user returns `400 Bad Request` ("Email is already verified. You can log in."). |
| **Test Case 10: Seeded USER Login** | **PASS** | Seeded account `user@weatheriq.local` has `emailVerified = true` by default and logs in immediately without verification block. |
| **Test Case 11: Seeded ADMIN Login** | **PASS** | Seeded account `admin@weatheriq.local` has `emailVerified = true` by default and logs in immediately without verification block. |
| **Frontend Verification Flow** | **PASS** | React `/register` displays pending instructions, `/verify-email?token=...` auto-executes verification, `/verify-email-pending` handles resends, and `/login` catches `EMAIL_NOT_VERIFIED`. |
| **Admin User Management** | **PASS** | `/admin/users` displays `VERIFIED` and `UNVERIFIED` badges. Verification status can be toggled by Admin. Tokens and token hashes are never exposed. |
| **MongoDB Persistence & Cleanup** | **PASS** | Verification token hashes and 30-minute expiry timestamps are stored in `emailVerificationTokens` and automatically deleted upon successful verification. |
| **Actual Email Delivery** | **BLOCKED** | **BLOCKED — Gmail SMTP ports 465, 587 and 2525 are unreachable from the current network.** Handled gracefully without crashing. Dev mode logs link: `[DEVELOPMENT ONLY] Verification link for email ...`. |

---

## 🔒 Security Architecture Highlights

1. **SHA-256 Token Storage**:
   - Verification tokens are generated using `SecureRandom` (32 bytes).
   - Only the SHA-256 hex digest (`tokenHash`) is stored in the MongoDB `emailVerificationTokens` collection.
   - Plain text tokens are never stored in the database.
2. **Expository Email Link**:
   - Verification emails contain a clean link: `http://localhost:5173/verify-email?token=<rawToken>`.
   - Passwords and token hashes are never included in email contents or admin views.
3. **60-Second Resend Cooldown**:
   - `UserDocument` tracks `verificationRequestedAt` timestamp to prevent spam and account enumeration abuse.
4. **Network Block Handling**:
   - `SmtpEmailService` catches SMTP transport exceptions resulting from blocked network ports without faking delivery or throwing unhandled errors.
   - In development mode (`SPRING_PROFILES_ACTIVE=dev`), verification links are logged in the console:
     `[DEVELOPMENT ONLY] Verification link for email testuser@example.com: http://localhost:5173/verify-email?token=...`

---

## 🌐 Application Verification Endpoints

- **Verification URL**: `http://localhost:5173/verify-email?token=<token>`
- **Pending Verification Page**: `http://localhost:5173/verify-email-pending`
- **Register Page**: `http://localhost:5173/register`
- **Login Page**: `http://localhost:5173/login`
- **Admin User Management**: `http://localhost:5173/admin/users`
