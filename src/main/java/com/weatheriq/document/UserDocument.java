package com.weatheriq.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class UserDocument {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    @Builder.Default
    private Set<String> roles = new HashSet<>();

    @Builder.Default
    private boolean emailVerified = false;

    @Builder.Default
    private boolean enabled = true;

    private String defaultCity;

    @Builder.Default
    private String temperatureUnit = "CELSIUS"; // CELSIUS or FAHRENHEIT

    @Builder.Default
    private boolean notificationEnabled = true;

    @Builder.Default
    private boolean emailNotificationsEnabled = true;

    private Instant lastLoginAt;

    private Instant verificationRequestedAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
