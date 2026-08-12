package com.weatheriq.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

public class TokenUtils {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public static String generate6DigitOtp() {
        int otp = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }

    public static String generateSecureToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    public static String hashToken(String rawToken) {
        if (rawToken == null || rawToken.trim().isEmpty()) {
            return "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
