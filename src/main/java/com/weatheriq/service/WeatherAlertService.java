package com.weatheriq.service;

import com.weatheriq.document.UserDocument;
import com.weatheriq.document.WeatherAlertDocument;
import com.weatheriq.dto.request.WeatherAlertRequest;
import com.weatheriq.dto.response.AirQualityResponse;
import com.weatheriq.dto.response.AlertResponse;
import com.weatheriq.dto.response.CurrentWeatherResponse;
import com.weatheriq.exception.ApiException;
import com.weatheriq.exception.ResourceNotFoundException;
import com.weatheriq.repository.UserRepository;
import com.weatheriq.repository.WeatherAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherAlertService {

    private final WeatherAlertRepository alertRepository;
    private final UserRepository userRepository;
    private final WeatherService weatherService;
    private final EmailService emailService;

    public List<AlertResponse> getUserAlerts(String userId) {
        return alertRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AlertResponse createAlert(String userId, WeatherAlertRequest request) {
        WeatherAlertDocument doc = WeatherAlertDocument.builder()
                .userId(userId)
                .type(request.getType())
                .threshold(request.getThreshold())
                .enabled(request.getEnabled() != null ? request.getEnabled() : true)
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        WeatherAlertDocument saved = alertRepository.save(doc);
        return mapToResponse(saved);
    }

    public AlertResponse updateAlert(String userId, String id, WeatherAlertRequest request) {
        WeatherAlertDocument doc = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WeatherAlert", "id", id));

        if (!doc.getUserId().equals(userId)) {
            throw new ApiException("Unauthorized access to alert", HttpStatus.FORBIDDEN);
        }

        if (request.getType() != null) doc.setType(request.getType());
        if (request.getThreshold() != null) doc.setThreshold(request.getThreshold());
        if (request.getEnabled() != null) doc.setEnabled(request.getEnabled());
        if (request.getCity() != null) doc.setCity(request.getCity());
        if (request.getLatitude() != null) doc.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) doc.setLongitude(request.getLongitude());

        WeatherAlertDocument updated = alertRepository.save(doc);
        return mapToResponse(updated);
    }

    public void deleteAlert(String userId, String id) {
        WeatherAlertDocument doc = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WeatherAlert", "id", id));

        if (!doc.getUserId().equals(userId)) {
            throw new ApiException("Unauthorized access to alert", HttpStatus.FORBIDDEN);
        }

        alertRepository.delete(doc);
    }

    public void evaluateAlerts() {
        List<WeatherAlertDocument> activeAlerts = alertRepository.findByEnabledTrue();
        Instant now = Instant.now();
        log.info("Found {} active weather alerts in database for evaluation.", activeAlerts.size());

        int evaluatedCount = 0;
        int triggeredCount = 0;
        int failedCount = 0;

        for (WeatherAlertDocument alert : activeAlerts) {
            evaluatedCount++;
            // Cooldown check: 6 hours
            if (alert.getLastTriggeredAt() != null && alert.getLastTriggeredAt().plus(6, ChronoUnit.HOURS).isAfter(now)) {
                continue;
            }

            try {
                CurrentWeatherResponse weather = weatherService.getCurrentWeather(alert.getLatitude(), alert.getLongitude());
                AirQualityResponse aqiResponse = weatherService.getAirQuality(alert.getLatitude(), alert.getLongitude());

                boolean triggered = false;
                String alertMessage = "";

                switch (alert.getType()) {
                    case "RAIN":
                        if (weather.getWeatherCode() >= 51 && weather.getWeatherCode() <= 67 || weather.getWeatherCode() >= 80) {
                            triggered = true;
                            alertMessage = String.format("Rain detected in %s. Current condition: %s.", alert.getCity(), weather.getWeatherCondition());
                        }
                        break;

                    case "EXTREME_HEAT":
                        if (weather.getTemperature() >= alert.getThreshold()) {
                            triggered = true;
                            alertMessage = String.format("Extreme Heat in %s: Temperature reached %.1f°C (Threshold: %.1f°C).",
                                    alert.getCity(), weather.getTemperature(), alert.getThreshold());
                        }
                        break;

                    case "EXTREME_COLD":
                        if (weather.getTemperature() <= alert.getThreshold()) {
                            triggered = true;
                            alertMessage = String.format("Extreme Cold in %s: Temperature dropped to %.1f°C (Threshold: %.1f°C).",
                                    alert.getCity(), weather.getTemperature(), alert.getThreshold());
                        }
                        break;

                    case "HIGH_AQI":
                        if (aqiResponse != null && aqiResponse.getAqi() != null && aqiResponse.getAqi() >= alert.getThreshold()) {
                            triggered = true;
                            alertMessage = String.format("High AQI Alert for %s: AQI reached %d (%s). Threshold: %.0f.",
                                    alert.getCity(), aqiResponse.getAqi(), aqiResponse.getCategory(), alert.getThreshold());
                        }
                        break;

                    case "HIGH_UV":
                        if (weather.getUvIndex() != null && weather.getUvIndex() >= alert.getThreshold()) {
                            triggered = true;
                            alertMessage = String.format("High UV Alert for %s: UV Index reached %.1f (Threshold: %.1f).",
                                    alert.getCity(), weather.getUvIndex(), alert.getThreshold());
                        }
                        break;

                    case "STRONG_WIND":
                        if (weather.getWindSpeed() >= alert.getThreshold()) {
                            triggered = true;
                            alertMessage = String.format("Strong Wind Alert for %s: Wind speed reached %.1f km/h (Threshold: %.1f km/h).",
                                    alert.getCity(), weather.getWindSpeed(), alert.getThreshold());
                        }
                        break;
                }

                if (triggered) {
                    triggeredCount++;
                    final String messageToSend = alertMessage;
                    userRepository.findById(alert.getUserId()).ifPresent(user -> {
                        if (user.isEnabled() && user.isEmailNotificationsEnabled()) {
                            emailService.sendWeatherAlertEmail(user.getId(), user.getEmail(), alert.getType(), messageToSend);
                            log.info("Triggered and sent alert [{}] for city {} to recipient [USER_ID: {}].",
                                    alert.getType(), alert.getCity(), user.getId());
                        } else {
                            log.info("Alert [{}] triggered for city {}, but user account is disabled or email notifications turned off.",
                                    alert.getType(), alert.getCity());
                        }
                    });

                    alert.setLastTriggeredAt(now);
                    alertRepository.save(alert);
                }
            } catch (Exception ex) {
                failedCount++;
                log.error("Failed to evaluate alert id {}: {}", alert.getId(), ex.getMessage());
            }
        }

        log.info("Weather alert evaluation job completed. Evaluated: {}, Triggered: {}, Failed: {}",
                evaluatedCount, triggeredCount, failedCount);
    }

    private AlertResponse mapToResponse(WeatherAlertDocument doc) {
        return AlertResponse.builder()
                .id(doc.getId())
                .userId(doc.getUserId())
                .type(doc.getType())
                .threshold(doc.getThreshold())
                .enabled(doc.isEnabled())
                .city(doc.getCity())
                .latitude(doc.getLatitude())
                .longitude(doc.getLongitude())
                .lastTriggeredAt(doc.getLastTriggeredAt())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
