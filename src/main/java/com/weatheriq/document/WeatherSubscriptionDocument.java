package com.weatheriq.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "weatherSubscriptions")
public class WeatherSubscriptionDocument {

    @Id
    private String id;

    private String userId;
    private String email;
    private String city;
    private double latitude;
    private double longitude;

    private String frequency; // HOURLY, EVERY_3_HOURS, DAILY

    @Builder.Default
    private boolean enabled = true;

    @Builder.Default
    private Set<String> selectedMetrics = new HashSet<>(); // TEMPERATURE, RAIN_PROBABILITY, AQI, WIND, HUMIDITY, WEATHER_INTELLIGENCE, ALERTS

    private Instant lastSentAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
