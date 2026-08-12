package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import com.weatheriq.dto.response.CurrentWeatherResponse;
import com.weatheriq.dto.response.DailyForecastResponse;
import com.weatheriq.dto.response.HourlyWeatherResponse;
import com.weatheriq.dto.response.WeatherIntelligenceResponse;
import com.weatheriq.service.WeatherIntelligenceService;
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
@RequestMapping("/api/weather")
@RequiredArgsConstructor
@Tag(name = "Weather Data", description = "Current weather, hourly forecast, daily forecast, and intelligence insights")
public class WeatherController {

    private final WeatherService weatherService;
    private final WeatherIntelligenceService intelligenceService;

    @GetMapping("/current")
    @Operation(summary = "Get current weather by coordinates")
    public ResponseEntity<ApiResponse<CurrentWeatherResponse>> getCurrentWeather(@RequestParam double latitude,
                                                                                  @RequestParam double longitude) {
        CurrentWeatherResponse data = weatherService.getCurrentWeather(latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success("Current weather fetched successfully", data));
    }

    @GetMapping("/hourly")
    @Operation(summary = "Get 24-hour weather forecast by coordinates")
    public ResponseEntity<ApiResponse<HourlyWeatherResponse>> getHourlyWeather(@RequestParam double latitude,
                                                                                @RequestParam double longitude) {
        HourlyWeatherResponse data = weatherService.getHourlyWeather(latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success("Hourly weather fetched successfully", data));
    }

    @GetMapping("/forecast")
    @Operation(summary = "Get 7-10 day weather forecast by coordinates")
    public ResponseEntity<ApiResponse<DailyForecastResponse>> getDailyForecast(@RequestParam double latitude,
                                                                               @RequestParam double longitude) {
        DailyForecastResponse data = weatherService.getDailyForecast(latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success("Daily forecast fetched successfully", data));
    }

    @GetMapping("/intelligence")
    @Operation(summary = "Get rule-based Weather Intelligence recommendations")
    public ResponseEntity<ApiResponse<WeatherIntelligenceResponse>> getWeatherIntelligence(@RequestParam double latitude,
                                                                                           @RequestParam double longitude) {
        WeatherIntelligenceResponse data = intelligenceService.generateIntelligence(latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success("Weather intelligence generated successfully", data));
    }
}
