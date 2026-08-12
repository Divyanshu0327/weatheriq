package com.weatheriq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AirQualityResponse {
    private Integer aqi;
    private Double pm2_5;
    private Double pm10;
    private Double no2;
    private Double o3;
    private Double co;
    private Double so2;
    private String category;
    private String healthRecommendation;
}
