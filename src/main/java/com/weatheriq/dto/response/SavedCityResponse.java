package com.weatheriq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedCityResponse {
    private String id;
    private String city;
    private String country;
    private double latitude;
    private double longitude;
    private String timezone;
    private boolean isDefault;
    private Instant createdAt;
}
