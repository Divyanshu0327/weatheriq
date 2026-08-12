package com.weatheriq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private String id;
    private String userId;
    private String email;
    private String city;
    private double latitude;
    private double longitude;
    private String frequency;
    private boolean enabled;
    private Set<String> selectedMetrics;
    private Instant lastSentAt;
    private Instant createdAt;
}
