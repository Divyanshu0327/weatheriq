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
public class HourlyWeatherResponse {
    private double latitude;
    private double longitude;
    private String timezone;
    private List<HourlyWeatherItem> hourlyList;
}
