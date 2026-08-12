package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import com.weatheriq.dto.request.*;
import com.weatheriq.dto.response.AuthResponse;
import com.weatheriq.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & OTP Security", description = "User registration, 6-digit OTP email verification, login, and forgot/reset password management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account with strong password validation and 6-digit OTP dispatch")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        boolean sent = "EMAIL_SENT".equalsIgnoreCase(response.getTokenType());
        String msg = sent
                ? "Registration submitted! A 6-digit verification OTP has been sent to your email."
                : "Registration submitted! OTP generated and saved (SMTP delivery blocked by network).";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify 6-digit numeric OTP code for email activation (5 attempts max)")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Your email has been verified successfully! You may now log in."));
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend 6-digit verification OTP (60-second cooldown rate limited)")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendVerificationRequest request) {
        boolean sent = authService.resendOtp(request);
        String msg = sent
                ? "A new 6-digit verification OTP has been sent to your email."
                : "New 6-digit verification OTP generated and saved (SMTP delivery blocked by network).";
        return ResponseEntity.ok(ApiResponse.success(msg));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Alias for resending verification OTP")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        boolean sent = authService.resendOtp(request);
        String msg = sent
                ? "A new 6-digit verification OTP has been sent to your email."
                : "New 6-digit verification OTP generated and saved (SMTP delivery blocked by network).";
        return ResponseEntity.ok(ApiResponse.success(msg));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and issue JWT token (Rejects unverified accounts)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a 6-digit password reset OTP to registered email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        boolean sent = authService.forgotPassword(request);
        String msg = sent
                ? "Password reset 6-digit OTP code sent to your email address."
                : "Password reset 6-digit OTP code generated and saved (SMTP delivery blocked by network).";
        return ResponseEntity.ok(ApiResponse.success(msg));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Verify reset OTP code and set new strong BCrypt-hashed password")
    public ResponseEntity<ApiResponse<Void>> resetPasswordWithOtp(@Valid @RequestBody ResetPasswordWithOtpRequest request) {
        authService.resetPasswordWithOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully! You may now log in with your new password."));
    }
}
