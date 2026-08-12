package com.weatheriq.util;

import com.weatheriq.exception.ApiException;
import org.springframework.http.HttpStatus;

import java.util.Set;
import java.util.regex.Pattern;

public class PasswordValidator {

    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]");

    private static final Set<String> BLACKLISTED_PASSWORDS = Set.of(
            "12345678", "123456789", "1234567890",
            "password", "password123", "password123!", "pass1234",
            "qwerty123", "qwertyuiop", "admin1234", "admin123",
            "weatheriq123", "campusinfohub123", "letmein123"
    );

    public static void validateStrongPassword(String password, String name, String email) {
        if (password == null || password.trim().isEmpty()) {
            throw new ApiException("Password cannot be blank", HttpStatus.BAD_REQUEST);
        }

        if (password.length() < MIN_LENGTH) {
            throw new ApiException("Password must be at least 8 characters long", HttpStatus.BAD_REQUEST);
        }

        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            throw new ApiException("Password must contain at least 1 uppercase letter (A-Z)", HttpStatus.BAD_REQUEST);
        }

        if (!LOWERCASE_PATTERN.matcher(password).find()) {
            throw new ApiException("Password must contain at least 1 lowercase letter (a-z)", HttpStatus.BAD_REQUEST);
        }

        if (!DIGIT_PATTERN.matcher(password).find()) {
            throw new ApiException("Password must contain at least 1 number (0-9)", HttpStatus.BAD_REQUEST);
        }

        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            throw new ApiException("Password must contain at least 1 special character (e.g. !@#$%^&*)", HttpStatus.BAD_REQUEST);
        }

        String lowerPass = password.toLowerCase();
        if (BLACKLISTED_PASSWORDS.contains(lowerPass)) {
            throw new ApiException("Password is too common or easily guessable. Please choose a stronger password.", HttpStatus.BAD_REQUEST);
        }

        if (email != null && !email.trim().isEmpty()) {
            String emailPrefix = email.split("@")[0].toLowerCase();
            if (emailPrefix.length() >= 3 && lowerPass.contains(emailPrefix)) {
                throw new ApiException("Password cannot contain your email prefix", HttpStatus.BAD_REQUEST);
            }
        }

        if (name != null && !name.trim().isEmpty()) {
            String cleanName = name.trim().toLowerCase().replaceAll("\\s+", "");
            if (cleanName.length() >= 3 && lowerPass.contains(cleanName)) {
                throw new ApiException("Password cannot contain your full name", HttpStatus.BAD_REQUEST);
            }
        }
    }
}
