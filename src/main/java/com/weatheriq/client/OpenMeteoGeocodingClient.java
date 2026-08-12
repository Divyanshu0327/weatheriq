package com.weatheriq.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.weatheriq.dto.response.CitySearchResponse;
import com.weatheriq.exception.ExternalApiException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OpenMeteoGeocodingClient {

    @Value("${openmeteo.geocoding.url:https://geocoding-api.open-meteo.com/v1/search}")
    private String geocodingUrl;

    private final RestClient restClient = RestClient.create();

    public List<CitySearchResponse> searchCities(String name) {
        try {
            GeocodingApiResponse response = restClient.get()
                    .uri(geocodingUrl + "?name={name}&count=10&language=en&format=json", name)
                    .retrieve()
                    .body(GeocodingApiResponse.class);

            if (response == null || response.getResults() == null) {
                return Collections.emptyList();
            }

            return response.getResults().stream()
                    .map(r -> CitySearchResponse.builder()
                            .id(r.getId())
                            .name(r.getName())
                            .country(r.getCountry())
                            .latitude(r.getLatitude())
                            .longitude(r.getLongitude())
                            .timezone(r.getTimezone())
                            .admin1(r.getAdmin1())
                            .elevation(r.getElevation())
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            throw new ExternalApiException("Failed to search location from Open-Meteo: " + ex.getMessage());
        }
    }

    @Data
    public static class GeocodingApiResponse {
        private List<GeocodingResult> results;
    }

    @Data
    public static class GeocodingResult {
        private Long id;
        private String name;
        private String country;
        private double latitude;
        private double longitude;
        private String timezone;
        private String admin1;
        private Double elevation;
    }
}
