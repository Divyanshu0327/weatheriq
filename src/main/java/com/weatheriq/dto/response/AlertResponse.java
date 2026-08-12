package com.weatheriq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    private String id;
    private String userId;
    private String type;
    private double threshold;
    private boolean enabled;
    private String city;
    private double latitude;
    private double longitude;
    private Instant lastTriggeredAt;
    private Instant createdAt;
}
