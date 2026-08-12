package com.weatheriq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherHistoryResponse {
    private String id;
    private String city;
    private double latitude;
    private double longitude;
    private Instant timestamp;
    private double temperature;
    private double humidity;
    private double windSpeed;
    private double rainProbability;
    private Integer aqi;
    private String weatherCondition;
}
