package com.weatheriq.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SaveCityRequest {

    @NotBlank(message = "City is required")
    private String city;

    private String country;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String timezone;
    private Boolean isDefault;
}
