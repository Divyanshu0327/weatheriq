package com.weatheriq.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class WeatherAlertRequest {

    @NotBlank(message = "Alert type is required")
    @Pattern(regexp = "^(RAIN|HEAVY_RAIN|EXTREME_HEAT|EXTREME_COLD|HIGH_AQI|HIGH_UV|STRONG_WIND)$", 
             message = "Invalid alert type")
    private String type;

    @NotNull(message = "Threshold is required")
    private Double threshold;

    private Boolean enabled;

    @NotBlank(message = "City is required")
    private String city;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;
}
