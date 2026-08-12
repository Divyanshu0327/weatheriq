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
public class AdminUserDetailsResponse {
    private String id;
    private String name;
    private String email;
    private boolean emailVerified;
    private boolean enabled;
    private String defaultCity;
    private String temperatureUnit;
    private boolean notificationEnabled;
    private boolean emailNotificationsEnabled;
    private Set<String> roles;
    private Instant lastLoginAt;
    private Instant createdAt;
    private Instant updatedAt;

    // Associated Counts
    private long savedCitiesCount;
    private long alertsCount;
    private long weatherHistoryCount;
    private long subscriptionsCount;
}
