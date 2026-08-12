package com.weatheriq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrentWeatherResponse {
    private double temperature;
    private double apparentTemperature;
    private String weatherCondition;
    private int weatherCode;
    private double humidity;
    private double windSpeed;
    private double windDirection;
    private Double visibility;
    private Double pressure;
    private Double uvIndex;
    private String sunrise;
    private String sunset;
    private String timestamp;
}
