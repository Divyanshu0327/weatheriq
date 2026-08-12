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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "alerts")
public class WeatherAlertDocument {

    @Id
    private String id;

    private String userId;
    private String type; // RAIN, HEAVY_RAIN, EXTREME_HEAT, EXTREME_COLD, HIGH_AQI, HIGH_UV, STRONG_WIND
    private double threshold;

    @Builder.Default
    private boolean enabled = true;

    private String city;
    private double latitude;
    private double longitude;

    private Instant lastTriggeredAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
