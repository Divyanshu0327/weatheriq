package com.weatheriq.service;

import com.weatheriq.document.NotificationHistoryDocument;
import com.weatheriq.repository.NotificationHistoryRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmtpEmailService implements EmailService {

    private final JavaMailSender mailSender;
    private final NotificationHistoryRepository notificationHistoryRepository;

    @Value("${app.mail.from:noreply@weatheriq.com}")
    private String mailFrom;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Override
    public boolean sendEmail(String userId, String to, String subject, String contentHtml, String notificationType) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String sender = (mailFrom != null && !mailFrom.trim().isEmpty()) ? mailFrom : "noreply@weatheriq.com";
            helper.setFrom(sender);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(contentHtml, true);

            mailSender.send(message);

            NotificationHistoryDocument history = NotificationHistoryDocument.builder()
                    .userId(userId)
                    .recipientEmail(to)
                    .type(notificationType)
                    .subject(subject)
                    .status("SENT")
                    .sentAt(Instant.now())
                    .build();
            notificationHistoryRepository.save(history);

            log.info("Successfully sent email to {} with subject '{}'", to, subject);
            return true;
        } catch (Exception ex) {
            String errorMsg = ex.getMessage();
            log.warn("[BLOCKED BY NETWORK / SMTP RETRY] Email dispatch to {} failed: {}", to, errorMsg);

            NotificationHistoryDocument history = NotificationHistoryDocument.builder()
                    .userId(userId)
                    .recipientEmail(to)
                    .type(notificationType)
                    .subject(subject)
                    .status("BLOCKED")
                    .errorMessage(errorMsg)
                    .sentAt(Instant.now())
                    .build();
            notificationHistoryRepository.save(history);
            return false;
        }
    }

    @Override
    public boolean sendVerificationEmail(String userId, String to, String verificationUrl, String rawOtp) {
        String actionUrl = (verificationUrl != null && !verificationUrl.trim().isEmpty())
                ? verificationUrl
                : (frontendUrl + "/verify-email-pending?email=" + to);

        String subject = "Verify your WeatherIQ account";
        String html = String.format("""
                <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #2563eb; margin: 0; font-size: 24px;">WeatherIQ</h2>
                        <p style="color: #64748b; font-size: 12px; margin-top: 4px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Weather Intelligence & Alerts Platform</p>
                    </div>
                    <p style="font-size: 15px; font-weight: bold;">Hello,</p>
                    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                        Thank you for registering with WeatherIQ. Please use the 6-digit verification code below to activate your account:
                    </p>
                    <div style="text-align: center; margin: 28px 0;">
                        <div style="background-color: #eff6ff; border: 2px dashed #3b82f6; color: #1d4ed8; padding: 18px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 32px; letter-spacing: 8px; display: inline-block; font-family: monospace;">
                            %s
                        </div>
                    </div>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <a href="%s" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Verify Email Account</a>
                    </div>
                    <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                        This OTP code expires in 10 minutes.<br/>
                        Maximum 5 verification attempts permitted.<br/>
                        If you did not request this code, please ignore this email.<br/><br/>
                        WeatherIQ Security Team
                    </p>
                </div>
                """, rawOtp, actionUrl);

        log.info("================================================================================");
        log.info("[DEVELOPMENT ONLY] Verification 6-Digit OTP for email {}: {}", to, rawOtp);
        log.info("================================================================================");

        return sendEmail(userId, to, subject, html, "EMAIL_VERIFICATION");
    }

    @Override
    public boolean sendPasswordResetEmail(String userId, String to, String rawOtp) {
        String resetUrl = frontendUrl + "/forgot-password";
        String subject = "WeatherIQ — Password Reset Verification Code";
        String html = String.format("""
                <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #2563eb; margin: 0; font-size: 24px;">WeatherIQ Security</h2>
                    </div>
                    <p style="font-size: 15px; font-weight: bold;">Password Reset Request</p>
                    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                        We received a request to reset your WeatherIQ account password. Use the 6-digit verification code below:
                    </p>
                    <div style="text-align: center; margin: 28px 0;">
                        <div style="background-color: #fef2f2; border: 2px dashed #ef4444; color: #b91c1c; padding: 18px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 32px; letter-spacing: 8px; display: inline-block; font-family: monospace;">
                            %s
                        </div>
                    </div>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <a href="%s" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Reset Password Now</a>
                    </div>
                    <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                        This password reset OTP expires in 10 minutes.<br/>
                        If you did not request a password reset, please secure your account immediately.<br/><br/>
                        WeatherIQ Security Team
                    </p>
                </div>
                """, rawOtp, resetUrl);

        log.info("================================================================================");
        log.info("[DEVELOPMENT ONLY] Password Reset 6-Digit OTP for email {}: {}", to, rawOtp);
        log.info("================================================================================");

        return sendEmail(userId, to, subject, html, "PASSWORD_RESET");
    }

    @Override
    public boolean sendWeatherUpdateEmail(String userId, String to, String city, String summaryHtml) {
        String subject = "WeatherIQ — Scheduled Weather Update for " + city;
        return sendEmail(userId, to, subject, summaryHtml, "SUBSCRIPTION_UPDATE");
    }

    @Override
    public boolean sendWeatherAlertEmail(String userId, String to, String alertType, String alertMessage) {
        String subject = "⚠️ WeatherIQ Alert: " + alertType;
        String html = String.format("""
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #721c24; background-color: #f8d7da; border-radius: 8px;">
                    <h2>⚠️ WeatherIQ Alert Triggered</h2>
                    <p style="font-size: 16px; font-weight: bold;">%s</p>
                    <p>Stay safe and check your WeatherIQ dashboard for further updates.</p>
                </div>
                """, alertMessage);
        return sendEmail(userId, to, subject, html, "WEATHER_ALERT");
    }
}
