package com.weatheriq.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "weatherHistory")
public class WeatherHistoryDocument {

    @Id
    private String id;

    private String city;
    private double latitude;
    private double longitude;
    private Instant timestamp;

    private double temperature;
    private double humidity;
    private double windSpeed;
    private double rainProbability;
    private Integer aqi;
    private String weatherCondition;

    @CreatedDate
    private Instant createdAt;
}
