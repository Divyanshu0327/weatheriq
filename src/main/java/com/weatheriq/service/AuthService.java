package com.weatheriq.service;

import com.weatheriq.document.PasswordResetTokenDocument;
import com.weatheriq.document.UserDocument;
import com.weatheriq.dto.request.*;
import com.weatheriq.dto.response.AuthResponse;
import com.weatheriq.dto.response.UserResponse;
import com.weatheriq.exception.ApiException;
import com.weatheriq.repository.EmailVerificationTokenRepository;
import com.weatheriq.repository.PasswordResetTokenRepository;
import com.weatheriq.repository.UserRepository;
import com.weatheriq.security.JwtTokenProvider;
import com.weatheriq.util.PasswordValidator;
import com.weatheriq.util.TokenUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final EmailVerificationService emailVerificationService;

    public AuthResponse register(RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        // Handle existing account check
        Optional<UserDocument> existingUserOpt = userRepository.findByEmail(cleanEmail);
        if (existingUserOpt.isPresent()) {
            UserDocument existingUser = existingUserOpt.get();
            if (existingUser.isEmailVerified()) {
                throw new ApiException("Email address is already registered and verified. Please log in.", HttpStatus.BAD_REQUEST);
            } else {
                // If previous unverified registration exists, clean it up for fresh registration
                tokenRepository.deleteByEmail(cleanEmail);
                userRepository.delete(existingUser);
                log.info("Cleared previous unverified pending registration for {}", cleanEmail);
            }
        }

        // Validate strong password policy rules
        PasswordValidator.validateStrongPassword(request.getPassword(), request.getName(), request.getEmail());

        // Create user with emailVerified = false AND enabled = false (DISABLED UNTIL OTP VERIFIED)
        UserDocument user = UserDocument.builder()
                .name(request.getName().trim())
                .email(cleanEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of("ROLE_USER"))
                .emailVerified(false)
                .enabled(false) // Account remains disabled until OTP verification
                .temperatureUnit("CELSIUS")
                .notificationEnabled(true)
                .emailNotificationsEnabled(true)
                .build();

        UserDocument savedUser = userRepository.save(user);

        // Generate and send 6-digit numeric OTP via email
        boolean sent = emailVerificationService.createAndSendVerificationToken(savedUser);

        return AuthResponse.builder()
                .token(null) // Unverified user does not receive login JWT
                .tokenType(sent ? "EMAIL_SENT" : "EMAIL_BLOCKED")
                .user(mapToUserResponse(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        UserDocument user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        // Check password first
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        // Strictly check email verification status and active account status
        if (!user.isEmailVerified() || !user.isEnabled()) {
            throw new ApiException("EMAIL_NOT_VERIFIED: Account is not activated. Please verify your email with the 6-digit OTP before logging in.", HttpStatus.FORBIDDEN);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cleanEmail, request.getPassword())
        );

        user.setLastLoginAt(Instant.now());
        UserDocument updatedUser = userRepository.save(user);

        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .user(mapToUserResponse(updatedUser))
                .build();
    }

    public void verifyOtp(VerifyOtpRequest request) {
        emailVerificationService.verifyOtp(request.getEmail(), request.getOtp());
    }

    public boolean resendOtp(ResendVerificationRequest request) {
        return emailVerificationService.resendOtp(request.getEmail());
    }

    public boolean forgotPassword(ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ApiException("Email address is required", HttpStatus.BAD_REQUEST);
        }

        String cleanEmail = request.getEmail().trim().toLowerCase();

        // Verify that the email is registered and verified in the system
        UserDocument user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ApiException("No registered account found with email address: " + cleanEmail + ". Please check your email or register a new account.", HttpStatus.BAD_REQUEST));

        if (!user.isEmailVerified()) {
            throw new ApiException("This account has not been verified yet. Please complete email OTP verification first.", HttpStatus.BAD_REQUEST);
        }

        resetTokenRepository.deleteByEmail(cleanEmail);

        // Generate 6-digit numeric Reset OTP and SHA-256 hash
        String rawOtp = TokenUtils.generate6DigitOtp();
        String tokenHash = TokenUtils.hashToken(rawOtp);

        PasswordResetTokenDocument resetToken = PasswordResetTokenDocument.builder()
                .userId(user.getId())
                .email(cleanEmail)
                .tokenHash(tokenHash)
                .attempts(0)
                .expiresAt(Instant.now().plus(10, ChronoUnit.MINUTES))
                .build();
        resetTokenRepository.save(resetToken);

        return emailService.sendPasswordResetEmail(user.getId(), user.getEmail(), rawOtp);
    }

    public void resetPasswordWithOtp(ResetPasswordWithOtpRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        String cleanOtp = request.getOtp().trim();

        UserDocument user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ApiException("No registered account found with email address: " + cleanEmail, HttpStatus.BAD_REQUEST));

        // Validate strong password policy rules for new password
        PasswordValidator.validateStrongPassword(request.getNewPassword(), user.getName(), user.getEmail());

        PasswordResetTokenDocument resetToken = resetTokenRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ApiException("Invalid or expired password reset OTP. Please request a new code.", HttpStatus.BAD_REQUEST));

        // Attempt limit check (Max 5 attempts)
        if (resetToken.getAttempts() >= 5) {
            resetTokenRepository.delete(resetToken);
            throw new ApiException("Too many failed attempts. This password reset OTP has been invalidated. Please request a new code.", HttpStatus.TOO_MANY_REQUESTS);
        }

        // Expiry check
        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            resetTokenRepository.delete(resetToken);
            throw new ApiException("Password reset OTP code has expired. Please request a new code.", HttpStatus.BAD_REQUEST);
        }

        String incomingHash = TokenUtils.hashToken(cleanOtp);
        if (!resetToken.getTokenHash().equalsIgnoreCase(incomingHash)) {
            int attemptsLeft = 5 - (resetToken.getAttempts() + 1);
            resetToken.setAttempts(resetToken.getAttempts() + 1);
            resetTokenRepository.save(resetToken);

            if (attemptsLeft <= 0) {
                resetTokenRepository.delete(resetToken);
                throw new ApiException("Invalid reset OTP code. Maximum attempts exceeded. Please request a new code.", HttpStatus.TOO_MANY_REQUESTS);
            }

            throw new ApiException("Invalid reset OTP code. " + attemptsLeft + " attempt(s) remaining.", HttpStatus.BAD_REQUEST);
        }

        // Update password securely using BCrypt
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalidate and delete password reset token
        resetTokenRepository.delete(resetToken);
    }

    public UserResponse mapToUserResponse(UserDocument user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .emailVerified(user.isEmailVerified())
                .enabled(user.isEnabled())
                .defaultCity(user.getDefaultCity())
                .temperatureUnit(user.getTemperatureUnit())
                .notificationEnabled(user.isNotificationEnabled())
                .emailNotificationsEnabled(user.isEmailNotificationsEnabled())
                .roles(user.getRoles())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
