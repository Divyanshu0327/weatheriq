package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health Check", description = "Application health monitoring endpoint")
public class HealthController {

    @GetMapping
    @Operation(summary = "Check backend status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        Map<String, Object> healthInfo = Map.of(
                "status", "UP",
                "application", "WeatherIQ Backend API",
                "version", "1.0.0",
                "timestamp", System.currentTimeMillis()
        );
        return ResponseEntity.ok(ApiResponse.success("WeatherIQ Backend is running healthy", healthInfo));
    }
}
