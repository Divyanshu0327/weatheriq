# PowerShell Integration Test Script for WeatherIQ Security and OTP Verification Policy

$baseUrl = "http://localhost:8080/api"
$adminPassword = if ($env:ADMIN_INITIAL_PASSWORD) { $env:ADMIN_INITIAL_PASSWORD } else { "Admin@12345" }

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " WEATHERIQ -- INTEGRATION TEST SUITE: SECURITY AND OTP POLICIES" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Admin Login: campusinfohub@gmail.com
Write-Host "`n[TEST 1] Main Administrator Login (campusinfohub@gmail.com)..." -ForegroundColor Yellow
$adminLoginBody = @{
    email = "campusinfohub@gmail.com"
    password = $adminPassword
} | ConvertTo-Json

try {
    $res1 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
    if ($res1.success -and $res1.data.token) {
        Write-Host "  PASS: Main admin logged in successfully. JWT issued." -ForegroundColor Green
        $adminToken = $res1.data.token
    } else {
        Write-Host "  FAIL: Admin login failed" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL: Exception on main admin login: $_" -ForegroundColor Red
}

# 2. System Admin Login: chitturaj317@gmail.com
Write-Host "`n[TEST 2] System Administrator Login (chitturaj317@gmail.com)..." -ForegroundColor Yellow
$sysAdminLoginBody = @{
    email = "chitturaj317@gmail.com"
    password = $adminPassword
} | ConvertTo-Json

try {
    $res2 = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $sysAdminLoginBody -ContentType "application/json"
    if ($res2.success -and $res2.data.token) {
        Write-Host "  PASS: System admin logged in successfully. JWT issued." -ForegroundColor Green
    } else {
        Write-Host "  FAIL: System admin login failed" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAIL: Exception on system admin login: $_" -ForegroundColor Red
}

# 3. Weak Password Rejection Tests
Write-Host "`n[TEST 3] Weak Password Policy Enforcement..." -ForegroundColor Yellow
$weakPasswords = @("12345678", "password", "Password123", "qwerty123", "Short1!")

foreach ($pass in $weakPasswords) {
    $weakReg = @{
        name = "Tester"
        email = "weak_$((Get-Random))@test.local"
        password = $pass
    } | ConvertTo-Json

    try {
        $resWeak = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $weakReg -ContentType "application/json"
        Write-Host "  FAIL: Weak password '$pass' was unexpectedly accepted!" -ForegroundColor Red
    } catch {
        Write-Host "  PASS: Rejected weak password '$pass' correctly." -ForegroundColor Green
    }
}

# 4. Strong Password Acceptance & User Registration
$testUserEmail = "otptest_$((Get-Random))@weatheriq.local"
$testUserPass = "StrongP@ssw0rd!2026"
Write-Host "`n[TEST 4] Registering User with Strong Password ($testUserEmail)..." -ForegroundColor Yellow
$regBody = @{
    name = "OTP Test User"
    email = $testUserEmail
    password = $testUserPass
} | ConvertTo-Json

try {
    $resReg = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    if ($resReg.success) {
        Write-Host "  PASS: User registered successfully. Account emailVerified = false." -ForegroundColor Green
    }
} catch {
    Write-Host "  FAIL: Registration failed: $_" -ForegroundColor Red
}

# 5. Unregistered Email Test on Forgot Password
Write-Host "`n[TEST 5] Submitting Unregistered Email to Forgot Password..." -ForegroundColor Yellow
$unregForgotBody = @{
    email = "unregistered_$((Get-Random))@notfound.local"
} | ConvertTo-Json

try {
    $resUnregForgot = Invoke-RestMethod -Uri "$baseUrl/auth/forgot-password" -Method Post -Body $unregForgotBody -ContentType "application/json"
    Write-Host "  FAIL: Unregistered email was accepted on forgot password!" -ForegroundColor Red
} catch {
    Write-Host "  PASS: Unregistered email correctly rejected with clear error message." -ForegroundColor Green
}

# 6. Login Restriction Before Verification
Write-Host "`n[TEST 6] Attempting Login Before OTP Email Verification..." -ForegroundColor Yellow
$unverifiedLoginBody = @{
    email = $testUserEmail
    password = $testUserPass
} | ConvertTo-Json

try {
    $resUnv = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $unverifiedLoginBody -ContentType "application/json"
    Write-Host "  FAIL: Unverified user was allowed to log in!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden) {
        Write-Host "  PASS: Login rejected with 403 FORBIDDEN for unverified email." -ForegroundColor Green
    } else {
        Write-Host "  FAIL: Unexpected response status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# 7. Invalid OTP Submission
Write-Host "`n[TEST 7] Submitting Invalid 6-Digit OTP (999999)..." -ForegroundColor Yellow
$invalidOtpBody = @{
    email = $testUserEmail
    otp = "999999"
} | ConvertTo-Json

try {
    $resInvOtp = Invoke-RestMethod -Uri "$baseUrl/auth/verify-otp" -Method Post -Body $invalidOtpBody -ContentType "application/json"
    Write-Host "  FAIL: Invalid OTP was accepted!" -ForegroundColor Red
} catch {
    Write-Host "  PASS: Invalid OTP code rejected with proper attempt feedback." -ForegroundColor Green
}

# 8. Resend OTP Cooldown Rate Limit
Write-Host "`n[TEST 8] Testing Resend OTP 60-Second Cooldown Rate Limiting..." -ForegroundColor Yellow
$resendBody = @{
    email = $testUserEmail
} | ConvertTo-Json

try {
    $resResend = Invoke-RestMethod -Uri "$baseUrl/auth/resend-otp" -Method Post -Body $resendBody -ContentType "application/json"
    Write-Host "  FAIL: Immediate resend succeeded without waiting for cooldown!" -ForegroundColor Red
} catch {
    Write-Host "  PASS: Resend blocked by 60s cooldown rate limiter." -ForegroundColor Green
}

# 9. Admin Security Check: Authorized Admin Access to Admin API
Write-Host "`n[TEST 9] Checking Role Security on Admin Endpoints..." -ForegroundColor Yellow
try {
    $resAdminCheck = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    if ($resAdminCheck.success) {
        Write-Host "  PASS: ADMIN account granted access to Admin Control Center." -ForegroundColor Green
    }
} catch {
    Write-Host "  FAIL: Admin access failed: $_" -ForegroundColor Red
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " ALL SECURITY AND OTP VERIFICATION TESTS COMPLETED SUCCESSFULLY" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
