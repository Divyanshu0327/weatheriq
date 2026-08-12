package com.weatheriq.service;

import com.weatheriq.document.UserDocument;
import com.weatheriq.document.WeatherSubscriptionDocument;
import com.weatheriq.dto.response.AirQualityResponse;
import com.weatheriq.dto.response.CurrentWeatherResponse;
import com.weatheriq.dto.response.ManualNotificationResponse;
import com.weatheriq.dto.response.WeatherIntelligenceResponse;
import com.weatheriq.exception.ApiException;
import com.weatheriq.exception.ResourceNotFoundException;
import com.weatheriq.repository.UserRepository;
import com.weatheriq.repository.WeatherSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserRepository userRepository;
    private final WeatherSubscriptionRepository subscriptionRepository;
    private final WeatherService weatherService;
    private final WeatherIntelligenceService intelligenceService;
    private final WeatherHistoryService historyService;
    private final EmailService emailService;

    public ManualNotificationResponse sendUserWeatherAlertsNow(String userId) {
        UserDocument user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!user.isEnabled()) {
            throw new ApiException("User account is disabled", HttpStatus.FORBIDDEN);
        }

        if (!user.isEmailNotificationsEnabled()) {
            log.info("Manual alert requested for user [ID: {}], but email notifications are turned off in settings.", userId);
            return ManualNotificationResponse.builder()
                    .processed(0)
                    .sent(0)
                    .skipped(0)
                    .failed(0)
                    .build();
        }

        String recipientEmail = user.getEmail();
        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            log.warn("Manual alert requested for user [ID: {}], but user has no email address.", userId);
            return ManualNotificationResponse.builder()
                    .processed(0)
                    .sent(0)
                    .skipped(0)
                    .failed(0)
                    .build();
        }

        List<WeatherSubscriptionDocument> subscriptions = subscriptionRepository.findByUserIdAndEnabledTrue(userId);
        log.info("Processing manual weather alert request for user [ID: {}]. Found {} active subscriptions.",
                userId, subscriptions.size());

        if (subscriptions.isEmpty()) {
            return ManualNotificationResponse.builder()
                    .processed(0)
                    .sent(0)
                    .skipped(0)
                    .failed(0)
                    .build();
        }

        Instant now = Instant.now();
        int processedCount = 0;
        int sentCount = 0;
        int skippedCount = 0;
        int failedCount = 0;

        for (WeatherSubscriptionDocument sub : subscriptions) {
            processedCount++;
            try {
                boolean success = sendManualSubscriptionDigest(sub, recipientEmail);
                if (success) {
                    sub.setLastSentAt(now);
                    subscriptionRepository.save(sub);
                    sentCount++;
                    log.info("Manual weather alert sent for city {} to recipient [USER_ID: {}].", sub.getCity(), userId);
                } else {
                    failedCount++;
                    log.warn("Manual weather alert email dispatch failed for city {} to user [ID: {}].", sub.getCity(), userId);
                }
            } catch (Exception ex) {
                failedCount++;
                log.error("Failed to process manual alert for subscription id {} (city: {}): {}",
                        sub.getId(), sub.getCity(), ex.getMessage(), ex);
            }
        }

        return ManualNotificationResponse.builder()
                .processed(processedCount)
                .sent(sentCount)
                .skipped(skippedCount)
                .failed(failedCount)
                .build();
    }

    private boolean sendManualSubscriptionDigest(WeatherSubscriptionDocument sub, String recipientEmail) {
        CurrentWeatherResponse weather = weatherService.getCurrentWeather(sub.getLatitude(), sub.getLongitude());
        AirQualityResponse aqi = weatherService.getAirQuality(sub.getLatitude(), sub.getLongitude());
        WeatherIntelligenceResponse intel = intelligenceService.generateIntelligence(sub.getLatitude(), sub.getLongitude());

        // Record history observation
        historyService.recordObservation(sub.getCity(), sub.getLatitude(), sub.getLongitude(),
                weather.getTemperature(), weather.getHumidity(), weather.getWindSpeed(),
                weather.getWeatherCode() >= 50 ? 80.0 : 10.0, aqi != null ? aqi.getAqi() : null, weather.getWeatherCondition());

        StringBuilder html = new StringBuilder();
        html.append(String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #1a73e8; margin-bottom: 5px;">WeatherIQ On-Demand Digest — %s</h2>
                    <p style="color: #666; font-size: 14px;">Instant weather update requested via your WeatherIQ dashboard.</p>
                    
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
                        Sent on-demand by WeatherIQ Platform • Manage subscriptions in your account settings.
                    </p>
                </div>
                """);

        return emailService.sendEmail(sub.getUserId(), recipientEmail, "WeatherIQ — On-Demand Weather Alert for " + sub.getCity(), html.toString(), "MANUAL_WEATHER_ALERT");
    }
}
