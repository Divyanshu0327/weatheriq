package com.weatheriq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HourlyWeatherItem {
    private String time;
    private double temperature;
    private double apparentTemperature;
    private double rainProbability;
    private double rain;
    private double humidity;
    private double windSpeed;
    private double windDirection;
    private String weatherCondition;
}
