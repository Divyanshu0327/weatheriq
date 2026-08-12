package com.weatheriq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherIntelligenceResponse {
    private String summary;
    private List<String> recommendations;
    private List<String> warnings;
    private Map<String, Object> relevantMetrics;
}
