package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import com.weatheriq.dto.request.WeatherSubscriptionRequest;
import com.weatheriq.dto.response.SubscriptionResponse;
import com.weatheriq.security.UserPrincipal;
import com.weatheriq.service.WeatherSubscriptionService;
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
@RequestMapping("/api/weather-subscriptions")
@RequiredArgsConstructor
@Tag(name = "Weather Subscriptions", description = "Scheduled city-wise weather update email subscriptions")
@SecurityRequirement(name = "bearerAuth")
public class WeatherSubscriptionController {

    private final WeatherSubscriptionService subscriptionService;

    @GetMapping
    @Operation(summary = "Get current user's weather subscriptions")
    public ResponseEntity<ApiResponse<List<SubscriptionResponse>>> getSubscriptions(@AuthenticationPrincipal UserPrincipal principal) {
        List<SubscriptionResponse> subscriptions = subscriptionService.getUserSubscriptions(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Subscriptions fetched successfully", subscriptions));
    }

    @PostMapping
    @Operation(summary = "Create a new weather subscription")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> createSubscription(@AuthenticationPrincipal UserPrincipal principal,
                                                                                 @Valid @RequestBody WeatherSubscriptionRequest request) {
        SubscriptionResponse response = subscriptionService.createSubscription(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Weather subscription created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing weather subscription")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> updateSubscription(@AuthenticationPrincipal UserPrincipal principal,
                                                                                 @PathVariable String id,
                                                                                 @Valid @RequestBody WeatherSubscriptionRequest request) {
        SubscriptionResponse response = subscriptionService.updateSubscription(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Weather subscription updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a weather subscription")
    public ResponseEntity<ApiResponse<Void>> deleteSubscription(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @PathVariable String id) {
        subscriptionService.deleteSubscription(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Weather subscription deleted successfully"));
    }
}
