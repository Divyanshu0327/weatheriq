package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import com.weatheriq.dto.response.WeatherHistoryResponse;
import com.weatheriq.service.WeatherHistoryService;
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
@RequestMapping("/api/weather-history")
@RequiredArgsConstructor
@Tag(name = "Weather History", description = "Historical weather observations and trends")
public class WeatherHistoryController {

    private final WeatherHistoryService historyService;

    @GetMapping
    @Operation(summary = "Get historical weather observations filtered by city and date range")
    public ResponseEntity<ApiResponse<List<WeatherHistoryResponse>>> getWeatherHistory(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<WeatherHistoryResponse> history = historyService.getWeatherHistory(city, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Weather history fetched successfully", history));
    }
}
