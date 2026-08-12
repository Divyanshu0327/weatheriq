package com.weatheriq.repository;

import com.weatheriq.document.WeatherAlertDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeatherAlertRepository extends MongoRepository<WeatherAlertDocument, String> {
    List<WeatherAlertDocument> findByUserId(String userId);
    List<WeatherAlertDocument> findByEnabledTrue();
    long countByEnabledTrue();
    long countByUserId(String userId);
    void deleteByUserId(String userId);
}
