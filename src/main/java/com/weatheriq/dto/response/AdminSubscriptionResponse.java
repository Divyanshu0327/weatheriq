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
public class AdminSubscriptionResponse {
    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private String city;
    private String frequency;
    private Integer targetHour;
    private boolean enabled;
    private Instant createdAt;
}
