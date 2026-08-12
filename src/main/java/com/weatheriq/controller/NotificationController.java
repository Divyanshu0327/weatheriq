package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import com.weatheriq.dto.response.ManualNotificationResponse;
import com.weatheriq.security.UserPrincipal;
import com.weatheriq.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Management", description = "On-demand weather alert email dispatch APIs for authenticated users")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send-weather-alerts")
    @Operation(summary = "Send manual weather alert digest for authenticated user's active subscriptions")
    public ResponseEntity<ApiResponse<ManualNotificationResponse>> sendWeatherAlertsNow(@AuthenticationPrincipal UserPrincipal principal) {
        ManualNotificationResponse response = notificationService.sendUserWeatherAlertsNow(principal.getId());

        String message = response.getSent() > 0
                ? "Weather alert email sent successfully"
                : (response.getProcessed() == 0 ? "No active weather subscriptions found" : "Weather alert request processed");

        return ResponseEntity.ok(ApiResponse.success(message, response));
    }
}
