package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import com.weatheriq.dto.response.TravelWeatherResponse;
import com.weatheriq.service.TravelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/travel")
@RequiredArgsConstructor
@Tag(name = "Travel Mode", description = "Travel weather suitability and packing recommendations")
public class TravelController {

    private final TravelService travelService;

    @GetMapping("/weather")
    @Operation(summary = "Get destination travel weather assessment and suggestions")
    public ResponseEntity<ApiResponse<TravelWeatherResponse>> getTravelWeather(
            @RequestParam(required = false) String destination,
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(required = false) String date) {
        TravelWeatherResponse response = travelService.getTravelWeather(destination, latitude, longitude, date);
        return ResponseEntity.ok(ApiResponse.success("Travel weather assessment completed", response));
    }
}
