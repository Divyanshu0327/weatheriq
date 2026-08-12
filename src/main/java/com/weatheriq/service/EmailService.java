package com.weatheriq.service;

public interface EmailService {
    boolean sendEmail(String userId, String to, String subject, String contentHtml, String notificationType);
    boolean sendVerificationEmail(String userId, String to, String verificationUrl, String rawToken);
    boolean sendPasswordResetEmail(String userId, String to, String token);
    boolean sendWeatherUpdateEmail(String userId, String to, String city, String summaryHtml);
    boolean sendWeatherAlertEmail(String userId, String to, String alertType, String alertMessage);
}
