package com.weatheriq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelWeatherResponse {
    private String destination;
    private String travelDate;
    private double latitude;
    private double longitude;
    private double expectedTemperature;
    private double rainProbability;
    private Integer aqi;
    private Double uvIndex;
    private double windSpeed;
    private String weatherCondition;
    private String travelRating; // EXCELLENT, GOOD, MODERATE, POOR
    private List<String> recommendations;
}
