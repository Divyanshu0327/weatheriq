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
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private boolean emailVerified;
    @Builder.Default
    private boolean enabled = true;
    private String defaultCity;
    private String temperatureUnit;
    private boolean notificationEnabled;
    private boolean emailNotificationsEnabled;
    private Set<String> roles;
    private Instant lastLoginAt;
    private Instant createdAt;
}
