package com.weatheriq.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "savedCities")
@CompoundIndex(name = "user_city_idx", def = "{'userId': 1, 'city': 1}", unique = true)
public class SavedCityDocument {

    @Id
    private String id;

    private String userId;
    private String city;
    private String country;
    private double latitude;
    private double longitude;
    private String timezone;

    @Builder.Default
    private boolean isDefault = false;

    @CreatedDate
    private Instant createdAt;
}
