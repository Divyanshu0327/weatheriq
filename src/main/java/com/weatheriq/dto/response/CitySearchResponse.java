package com.weatheriq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitySearchResponse {
    private Long id;
    private String name;
    private String country;
    private double latitude;
    private double longitude;
    private String timezone;
    private String admin1;
    private Double elevation;
}
