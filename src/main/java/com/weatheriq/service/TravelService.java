package com.weatheriq.service;

import com.weatheriq.dto.response.AirQualityResponse;
import com.weatheriq.dto.response.CurrentWeatherResponse;
import com.weatheriq.dto.response.TravelWeatherResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TravelService {

    private final WeatherService weatherService;

    public TravelWeatherResponse getTravelWeather(String destination, double latitude, double longitude, String travelDate) {
        CurrentWeatherResponse weather = weatherService.getCurrentWeather(latitude, longitude);
        AirQualityResponse aqi = weatherService.getAirQuality(latitude, longitude);

        List<String> recommendations = new ArrayList<>();
        int negativePoints = 0;

        // Rain evaluation
        if (weather.getWeatherCode() >= 51 && weather.getWeatherCode() <= 67 || weather.getWeatherCode() >= 80) {
            recommendations.add("Carry an umbrella and waterproof jacket due to expected rain.");
            negativePoints += 2;
        }

        // Temperature evaluation
        if (weather.getTemperature() > 35.0) {
            recommendations.add("High temperatures expected. Hydrate frequently and wear light breathable cotton clothing.");
            negativePoints += 2;
        } else if (weather.getTemperature() < 10.0) {
            recommendations.add("Cold conditions expected. Carry heavy jackets and warm layers.");
            negativePoints += 1;
        } else {
            recommendations.add("Pleasant temperature conditions for outdoor travel.");
        }

        // AQI evaluation
        if (aqi.getAqi() != null && aqi.getAqi() >= 150) {
            recommendations.add("Poor air quality expected. Consider wearing an N95 mask outdoors.");
            negativePoints += 2;
        }

        // UV evaluation
        if (weather.getUvIndex() != null && weather.getUvIndex() >= 6.0) {
            recommendations.add("High UV index. Bring sunscreen (SPF 30+), sunglasses, and a hat.");
            negativePoints += 1;
        }

        // Wind evaluation
        if (weather.getWindSpeed() >= 30.0) {
            recommendations.add("Strong winds expected. Be cautious during outdoor activities.");
            negativePoints += 1;
        }

        String travelRating;
        if (negativePoints == 0) {
            travelRating = "EXCELLENT";
            recommendations.add("Ideal conditions for outdoor sightseeing and travel activities.");
        } else if (negativePoints <= 2) {
            travelRating = "GOOD";
        } else if (negativePoints <= 4) {
            travelRating = "MODERATE";
        } else {
            travelRating = "POOR";
            recommendations.add("Sub-optimal weather conditions. Consider rescheduling outdoor excursions if possible.");
        }

        return TravelWeatherResponse.builder()
                .destination(destination != null ? destination : "Target Destination")
                .travelDate(travelDate != null ? travelDate : "Today")
                .latitude(latitude)
                .longitude(longitude)
                .expectedTemperature(weather.getTemperature())
                .rainProbability(weather.getWeatherCode() >= 50 ? 80.0 : 10.0)
                .aqi(aqi.getAqi())
                .uvIndex(weather.getUvIndex())
                .windSpeed(weather.getWindSpeed())
                .weatherCondition(weather.getWeatherCondition())
                .travelRating(travelRating)
                .recommendations(recommendations)
                .build();
    }
}
