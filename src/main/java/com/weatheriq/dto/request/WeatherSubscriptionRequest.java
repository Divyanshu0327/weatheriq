package com.weatheriq.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.Set;

@Data
public class WeatherSubscriptionRequest {

    @NotBlank(message = "City is required")
    private String city;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotBlank(message = "Frequency is required")
    @Pattern(regexp = "^(HOURLY|EVERY_3_HOURS|DAILY)$", message = "Frequency must be HOURLY, EVERY_3_HOURS, or DAILY")
    private String frequency;

    private Boolean enabled;
    private Set<String> selectedMetrics;
}
