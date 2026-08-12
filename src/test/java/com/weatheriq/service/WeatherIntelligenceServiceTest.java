package com.weatheriq.service;

import com.weatheriq.dto.response.AirQualityResponse;
import com.weatheriq.dto.response.CurrentWeatherResponse;
import com.weatheriq.dto.response.WeatherIntelligenceResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.when;

class WeatherIntelligenceServiceTest {

    @Mock
    private WeatherService weatherService;

    @InjectMocks
    private WeatherIntelligenceService intelligenceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGenerateIntelligenceForExtremeHeatAndRain() {
        CurrentWeatherResponse currentWeather = CurrentWeatherResponse.builder()
                .temperature(38.0)
                .apparentTemperature(41.0)
                .weatherCondition("Slight rain")
                .weatherCode(61)
                .humidity(70.0)
                .windSpeed(15.0)
                .uvIndex(8.0)
                .build();

        AirQualityResponse airQuality = AirQualityResponse.builder()
                .aqi(160)
                .category("Unhealthy")
                .healthRecommendation("Limit prolonged outdoor exertion.")
                .build();

        when(weatherService.getCurrentWeather(anyDouble(), anyDouble())).thenReturn(currentWeather);
        when(weatherService.getAirQuality(anyDouble(), anyDouble())).thenReturn(airQuality);

        WeatherIntelligenceResponse response = intelligenceService.generateIntelligence(28.61, 77.21);

        assertNotNull(response);
        assertTrue(response.getWarnings().stream().anyMatch(w -> w.contains("Extreme heat")));
        assertTrue(response.getRecommendations().stream().anyMatch(r -> r.contains("Rain is likely")));
        assertTrue(response.getRecommendations().stream().anyMatch(r -> r.contains("Air quality is unhealthy")));
        assertTrue(response.getWarnings().stream().anyMatch(w -> w.contains("High UV")));
    }
}
