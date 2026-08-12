package com.weatheriq.service;

import com.weatheriq.document.EmailVerificationTokenDocument;
import com.weatheriq.document.UserDocument;
import com.weatheriq.exception.ApiException;
import com.weatheriq.exception.ResourceNotFoundException;
import com.weatheriq.repository.EmailVerificationTokenRepository;
import com.weatheriq.repository.UserRepository;
import com.weatheriq.util.TokenUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.verification.token-expiry-minutes:10}")
    private int tokenExpiryMinutes;

    public boolean createAndSendVerificationToken(UserDocument user) {
        // Delete previous verification tokens for this email
        tokenRepository.deleteByEmail(user.getEmail());

        // Generate 6-digit numeric OTP and SHA-256 hash
        String rawOtp = TokenUtils.generate6DigitOtp();
        String tokenHash = TokenUtils.hashToken(rawOtp);

        EmailVerificationTokenDocument tokenDoc = EmailVerificationTokenDocument.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .tokenHash(tokenHash)
                .attempts(0)
                .expiresAt(Instant.now().plus(tokenExpiryMinutes, ChronoUnit.MINUTES))
                .build();
        tokenRepository.save(tokenDoc);

        // Update verificationRequestedAt timestamp on user document
        user.setVerificationRequestedAt(Instant.now());
        userRepository.save(user);

        // Dispatch verification email
        boolean sent = emailService.sendVerificationEmail(user.getId(), user.getEmail(), "", rawOtp);
        if (!sent) {
            log.warn("SMTP dispatch to {} resulted in BLOCKED/FAILED status", user.getEmail());
        }
        return sent;
    }

    public UserDocument verifyOtp(String email, String rawOtp) {
        if (email == null || email.trim().isEmpty() || rawOtp == null || rawOtp.trim().isEmpty()) {
            throw new ApiException("Email and OTP code are required", HttpStatus.BAD_REQUEST);
        }

        String cleanEmail = email.trim().toLowerCase();
        String cleanOtp = rawOtp.trim();

        EmailVerificationTokenDocument tokenDoc = tokenRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ApiException("Invalid or expired OTP code. Please request a new OTP code or re-register.", HttpStatus.BAD_REQUEST));

        // Attempt limit check (Max 5 attempts)
        if (tokenDoc.getAttempts() >= 5) {
            tokenRepository.delete(tokenDoc);
            // Purge unverified registration on max failed attempts
            userRepository.findByEmail(cleanEmail).ifPresent(u -> {
                if (!u.isEmailVerified()) {
                    userRepository.delete(u);
                    log.info("Purged unverified registration for {} due to 5 failed OTP attempts.", cleanEmail);
                }
            });
            throw new ApiException("Too many failed attempts. Unverified registration has been cleared. Please register again.", HttpStatus.TOO_MANY_REQUESTS);
        }

        // Expiry check
        if (tokenDoc.getExpiresAt().isBefore(Instant.now())) {
            tokenRepository.delete(tokenDoc);
            throw new ApiException("OTP code has expired. Please request a new OTP code or re-register.", HttpStatus.BAD_REQUEST);
        }

        String incomingHash = TokenUtils.hashToken(cleanOtp);
        if (!tokenDoc.getTokenHash().equalsIgnoreCase(incomingHash)) {
            int attemptsLeft = 5 - (tokenDoc.getAttempts() + 1);
            tokenDoc.setAttempts(tokenDoc.getAttempts() + 1);
            tokenRepository.save(tokenDoc);

            if (attemptsLeft <= 0) {
                tokenRepository.delete(tokenDoc);
                userRepository.findByEmail(cleanEmail).ifPresent(u -> {
                    if (!u.isEmailVerified()) {
                        userRepository.delete(u);
                    }
                });
                throw new ApiException("Invalid OTP code. Maximum attempts exceeded. Registration cleared.", HttpStatus.TOO_MANY_REQUESTS);
            }

            throw new ApiException("Invalid OTP code. " + attemptsLeft + " attempt(s) remaining.", HttpStatus.BAD_REQUEST);
        }

        UserDocument user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", cleanEmail));

        // ONLY AFTER SUCCESSFUL OTP VERIFICATION DO WE MARK EMAIL VERIFIED & ACCOUNT ACTIVE!
        user.setEmailVerified(true);
        user.setEnabled(true);
        UserDocument updatedUser = userRepository.save(user);

        // Remove single-use token document upon successful verification
        tokenRepository.delete(tokenDoc);
        log.info("Successfully verified OTP for email {}. Account activated!", cleanEmail);
        return updatedUser;
    }

    public boolean resendOtp(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new ApiException("Email address is required", HttpStatus.BAD_REQUEST);
        }

        String cleanEmail = email.trim().toLowerCase();
        UserDocument user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ApiException("No pending registration found with email address: " + cleanEmail + ". Please register first.", HttpStatus.BAD_REQUEST));

        if (user.isEmailVerified()) {
            throw new ApiException("Email is already verified. You can log in.", HttpStatus.BAD_REQUEST);
        }

        // 60-second cooldown rate limit check
        if (user.getVerificationRequestedAt() != null) {
            Instant cooldownEndTime = user.getVerificationRequestedAt().plus(60, ChronoUnit.SECONDS);
            if (Instant.now().isBefore(cooldownEndTime)) {
                long remainingSeconds = ChronoUnit.SECONDS.between(Instant.now(), cooldownEndTime);
                throw new ApiException("Please wait " + Math.max(1, remainingSeconds) + " seconds before requesting another OTP.", HttpStatus.TOO_MANY_REQUESTS);
            }
        }

        return createAndSendVerificationToken(user);
    }
}
