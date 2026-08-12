package com.weatheriq.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdatePreferencesRequest {

    private String defaultCity;

    @Pattern(regexp = "^(CELSIUS|FAHRENHEIT)$", message = "Temperature unit must be CELSIUS or FAHRENHEIT")
    private String temperatureUnit;

    private Boolean notificationEnabled;
    private Boolean emailNotificationsEnabled;
}
