package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import com.weatheriq.dto.response.CitySearchResponse;
import com.weatheriq.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@Tag(name = "Locations", description = "Location geocoding and search APIs")
public class LocationController {

    private final WeatherService weatherService;

    @GetMapping("/search")
    @Operation(summary = "Search city by name using Open-Meteo Geocoding")
    public ResponseEntity<ApiResponse<List<CitySearchResponse>>> searchLocations(@RequestParam String name) {
        List<CitySearchResponse> results = weatherService.searchLocations(name);
        return ResponseEntity.ok(ApiResponse.success("City search completed", results));
    }
}
