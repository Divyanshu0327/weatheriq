package com.weatheriq.service;

import com.weatheriq.dto.response.AirQualityResponse;
import com.weatheriq.dto.response.CurrentWeatherResponse;
import com.weatheriq.dto.response.WeatherIntelligenceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WeatherIntelligenceService {

    private final WeatherService weatherService;

    public WeatherIntelligenceResponse generateIntelligence(double latitude, double longitude) {
        CurrentWeatherResponse currentWeather = weatherService.getCurrentWeather(latitude, longitude);
        AirQualityResponse airQuality = weatherService.getAirQuality(latitude, longitude);

        List<String> recommendations = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        Map<String, Object> metrics = new HashMap<>();

        metrics.put("temperature", currentWeather.getTemperature());
        metrics.put("feelsLike", currentWeather.getApparentTemperature());
        metrics.put("weatherCondition", currentWeather.getWeatherCondition());
        metrics.put("humidity", currentWeather.getHumidity());
        metrics.put("windSpeed", currentWeather.getWindSpeed());
        metrics.put("uvIndex", currentWeather.getUvIndex());
        metrics.put("aqi", airQuality.getAqi());
        metrics.put("aqiCategory", airQuality.getCategory());

        // Temperature Rules
        if (currentWeather.getTemperature() > 35) {
            warnings.add("Extreme heat alert: Temperature is above 35°C");
            recommendations.add("High temperature expected. Stay hydrated and avoid prolonged heat exposure.");
        } else if (currentWeather.getTemperature() < 5) {
            warnings.add("Cold weather alert: Temperature is below 5°C");
            recommendations.add("Cold temperature expected. Wear warm clothing and layer up.");
        } else {
            recommendations.add("Temperature is pleasant. Good conditions for outdoor activities.");
        }

        // Rain Rules
        if (currentWeather.getWeatherCode() >= 51 && currentWeather.getWeatherCode() <= 67 || currentWeather.getWeatherCode() >= 80) {
            warnings.add("Active precipitation in progress");
            recommendations.add("Rain is likely. Carry an umbrella.");
        }

        // AQI Rules
        if (airQuality.getAqi() != null && airQuality.getAqi() >= 150) {
            warnings.add("Unhealthy Air Quality Index: AQI " + airQuality.getAqi());
            recommendations.add("Air quality is unhealthy. Limit prolonged outdoor activity.");
        }

        // UV Rules
        if (currentWeather.getUvIndex() != null && currentWeather.getUvIndex() >= 6.0) {
            warnings.add("High UV Index: " + currentWeather.getUvIndex());
            recommendations.add("UV exposure is high. Consider sun protection.");
        }

        // Wind Rules
        if (currentWeather.getWindSpeed() >= 30.0) {
            warnings.add("High wind speed: " + currentWeather.getWindSpeed() + " km/h");
            recommendations.add("Strong winds are expected. Take care during outdoor activities.");
        }

        String summary = String.format("Current weather is %s at %.1f°C (Feels like %.1f°C). AQI is %d (%s).",
                currentWeather.getWeatherCondition(),
                currentWeather.getTemperature(),
                currentWeather.getApparentTemperature(),
                airQuality.getAqi(),
                airQuality.getCategory());

        return WeatherIntelligenceResponse.builder()
                .summary(summary)
                .recommendations(recommendations)
                .warnings(warnings)
                .relevantMetrics(metrics)
                .build();
    }
}
