package com.weatheriq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyForecastItem {
    private String date;
    private double maxTemperature;
    private double minTemperature;
    private double rainProbability;
    private String weatherCondition;
    private String sunrise;
    private String sunset;
    private Double uvIndex;
}
