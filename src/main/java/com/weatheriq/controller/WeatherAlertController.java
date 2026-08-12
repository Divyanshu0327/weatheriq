package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import com.weatheriq.dto.request.WeatherAlertRequest;
import com.weatheriq.dto.response.AlertResponse;
import com.weatheriq.security.UserPrincipal;
import com.weatheriq.service.WeatherAlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Tag(name = "Weather Alerts", description = "Smart weather alert rules management")
@SecurityRequirement(name = "bearerAuth")
public class WeatherAlertController {

    private final WeatherAlertService alertService;

    @GetMapping
    @Operation(summary = "Get user's configured weather alerts")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getAlerts(@AuthenticationPrincipal UserPrincipal principal) {
        List<AlertResponse> alerts = alertService.getUserAlerts(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Alerts fetched successfully", alerts));
    }

    @PostMapping
    @Operation(summary = "Create a new weather alert rule")
    public ResponseEntity<ApiResponse<AlertResponse>> createAlert(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @Valid @RequestBody WeatherAlertRequest request) {
        AlertResponse response = alertService.createAlert(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Weather alert created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a weather alert rule")
    public ResponseEntity<ApiResponse<AlertResponse>> updateAlert(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @PathVariable String id,
                                                                   @Valid @RequestBody WeatherAlertRequest request) {
        AlertResponse response = alertService.updateAlert(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Weather alert updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a weather alert rule")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(@AuthenticationPrincipal UserPrincipal principal,
                                                         @PathVariable String id) {
        alertService.deleteAlert(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Weather alert deleted successfully"));
    }
}
