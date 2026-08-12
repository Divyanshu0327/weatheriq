package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import com.weatheriq.dto.response.AirQualityResponse;
import com.weatheriq.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/air-quality")
@RequiredArgsConstructor
@Tag(name = "Air Quality", description = "AQI and environmental pollution APIs")
public class AirQualityController {

    private final WeatherService weatherService;

    @GetMapping
    @Operation(summary = "Get Air Quality Index and pollutant concentrations")
    public ResponseEntity<ApiResponse<AirQualityResponse>> getAirQuality(@RequestParam double latitude,
                                                                          @RequestParam double longitude) {
        AirQualityResponse data = weatherService.getAirQuality(latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success("Air quality data fetched successfully", data));
    }
}
