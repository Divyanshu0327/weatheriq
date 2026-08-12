package com.weatheriq.repository;

import com.weatheriq.document.WeatherHistoryDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface WeatherHistoryRepository extends MongoRepository<WeatherHistoryDocument, String> {
    List<WeatherHistoryDocument> findByCityIgnoreCaseAndTimestampBetween(String city, Instant startDate, Instant endDate);
    List<WeatherHistoryDocument> findByCityIgnoreCase(String city);
}
