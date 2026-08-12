package com.weatheriq.scheduler;

import com.weatheriq.document.UserDocument;
import com.weatheriq.document.WeatherSubscriptionDocument;
import com.weatheriq.dto.response.AirQualityResponse;
import com.weatheriq.dto.response.CurrentWeatherResponse;
import com.weatheriq.dto.response.WeatherIntelligenceResponse;
import com.weatheriq.repository.UserRepository;
import com.weatheriq.repository.WeatherSubscriptionRepository;
import com.weatheriq.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class WeatherEmailScheduler {

    private final WeatherSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final WeatherService weatherService;
    private final WeatherIntelligenceService intelligenceService;
    private final WeatherAlertService alertService;
    private final WeatherHistoryService historyService;
    private final EmailService emailService;

    /**
     * Scheduled weather email subscription job.
     * Evaluates active user weather subscriptions and sends digest emails for due subscriptions.
     */
    @Scheduled(cron = "${app.scheduling.subscription-cron:0 0 * * * *}", zone = "${app.scheduling.timezone:UTC}")
    public void processScheduledSubscriptions() {
        log.info("Starting scheduled weather email subscription job...");
        List<WeatherSubscriptionDocument> subscriptions = subscriptionRepository.findByEnabledTrue();
        log.info("Found {} active subscriptions in database for evaluation.", subscriptions.size());

        Instant now = Instant.now();
        int processedCount = 0;
        int sentCount = 0;
        int skippedCount = 0;
        int failedCount = 0;

        for (WeatherSubscriptionDocument sub : subscriptions) {
            processedCount++;
            if (!isSubscriptionDue(sub, now)) {
                skippedCount++;
                continue;
            }

            try {
                // Validate recipient user account & notification preference
                Optional<UserDocument> userOpt = userRepository.findById(sub.getUserId());
                if (userOpt.isPresent()) {
                    UserDocument user = userOpt.get();
                    if (!user.isEnabled() || !user.isEmailNotificationsEnabled()) {
                        log.info("Skipping subscription id {} (city: {}): User account disabled or email notifications turned off.",
                                sub.getId(), sub.getCity());
                        skippedCount++;
                        continue;
                    }
                }

                String recipientEmail = sub.getEmail();
                if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
                    if (userOpt.isPresent() && userOpt.get().getEmail() != null) {
                        recipientEmail = userOpt.get().getEmail();
                    } else {
                        log.warn("Skipping subscription id {}: Missing recipient email address.", sub.getId());
                        skippedCount++;
                        continue;
                    }
                }

                boolean success = sendSubscriptionUpdate(sub, recipientEmail);
                if (success) {
                    sub.setLastSentAt(now);
                    subscriptionRepository.save(sub);
                    sentCount++;
                    log.info("Successfully sent weather digest for city {} to recipient [USER_ID: {}].",
                            sub.getCity(), sub.getUserId());
                } else {
                    failedCount++;
                    log.warn("Email dispatch returned false for subscription id {} (city: {}).", sub.getId(), sub.getCity());
                }
            } catch (Exception ex) {
                failedCount++;
                log.error("Failed to process subscription id {} for city {}: {}", sub.getId(), sub.getCity(), ex.getMessage());
            }
        }

        log.info("Hourly weather subscription job completed. Total: {}, Sent: {}, Skipped: {}, Failed: {}",
                processedCount, sentCount, skippedCount, failedCount);
    }

    /**
     * Scheduled weather alert evaluation job.
     * Evaluates threshold rules for active alerts and dispatches warning emails when triggered.
     */
    @Scheduled(cron = "${app.scheduling.alert-cron:0 0 * * * *}", zone = "${app.scheduling.timezone:UTC}")
    public void processScheduledAlerts() {
        log.info("Starting scheduled weather alert evaluation job...");
        try {
            alertService.evaluateAlerts();
            log.info("Scheduled weather alert evaluation completed successfully.");
        } catch (Exception ex) {
            log.error("Error evaluating scheduled weather alerts: {}", ex.getMessage());
        }
    }

    public boolean isSubscriptionDue(WeatherSubscriptionDocument sub, Instant now) {
        if (sub.getLastSentAt() == null) {
            return true;
        }

        long minutesSinceLastSent = ChronoUnit.MINUTES.between(sub.getLastSentAt(), now);

        String freq = sub.getFrequency() != null ? sub.getFrequency().toUpperCase() : "HOURLY";
        return switch (freq) {
            case "HOURLY" -> minutesSinceLastSent >= 55;
            case "EVERY_3_HOURS" -> minutesSinceLastSent >= 175;
            case "DAILY" -> minutesSinceLastSent >= 1430;
            default -> minutesSinceLastSent >= 55;
        };
    }

    private boolean sendSubscriptionUpdate(WeatherSubscriptionDocument sub, String recipientEmail) {
        CurrentWeatherResponse weather = weatherService.getCurrentWeather(sub.getLatitude(), sub.getLongitude());
        AirQualityResponse aqi = weatherService.getAirQuality(sub.getLatitude(), sub.getLongitude());
        WeatherIntelligenceResponse intel = intelligenceService.generateIntelligence(sub.getLatitude(), sub.getLongitude());

        // Record history observation
        historyService.recordObservation(sub.getCity(), sub.getLatitude(), sub.getLongitude(),
                weather.getTemperature(), weather.getHumidity(), weather.getWindSpeed(),
                weather.getWeatherCode() >= 50 ? 80.0 : 10.0, aqi.getAqi(), weather.getWeatherCondition());

        StringBuilder html = new StringBuilder();
        html.append(String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #1a73e8; margin-bottom: 5px;">WeatherIQ Digest — %s</h2>
                    <p style="color: #666; font-size: 14px;">Summary update for your subscribed city.</p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h3 style="margin-top: 0; color: #333;">Current Conditions</h3>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #111;">%.1f°C <span style="font-size: 14px; font-weight: normal; color: #555;">(Feels like %.1f°C)</span></p>
                        <p style="margin: 5px 0;"><strong>Condition:</strong> %s</p>
                        <p style="margin: 5px 0;"><strong>Humidity:</strong> %.0f%% | <strong>Wind:</strong> %.1f km/h</p>
                    </div>
                """, sub.getCity(), weather.getTemperature(), weather.getApparentTemperature(), weather.getWeatherCondition(), weather.getHumidity(), weather.getWindSpeed()));

        if (sub.getSelectedMetrics() != null && sub.getSelectedMetrics().contains("AQI") && aqi != null) {
            html.append(String.format("""
                    <div style="background: #e8f0fe; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h4 style="margin-top: 0; color: #1967d2;">Air Quality Index</h4>
                        <p style="margin: 5px 0;"><strong>US AQI:</strong> %d (%s)</p>
                        <p style="margin: 5px 0; font-size: 13px;">%s</p>
                    </div>
                    """, aqi.getAqi(), aqi.getCategory(), aqi.getHealthRecommendation()));
        }

        if (sub.getSelectedMetrics() != null && sub.getSelectedMetrics().contains("WEATHER_INTELLIGENCE") && intel != null) {
            html.append("""
                    <div style="background: #fef7e0; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h4 style="margin-top: 0; color: #b06000;">Smart Weather Intelligence</h4>
                    """);
            if (intel.getRecommendations() != null) {
                for (String rec : intel.getRecommendations()) {
                    html.append(String.format("<p style=\"margin: 5px 0;\">💡 %s</p>", rec));
                }
            }
            html.append("</div>");
        }

        html.append("""
                    <p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px;">
                        Sent automatically by WeatherIQ Platform • Manage subscriptions in your account settings.
                    </p>
                </div>
                """);

        return emailService.sendWeatherUpdateEmail(sub.getUserId(), recipientEmail, sub.getCity(), html.toString());
    }
}

