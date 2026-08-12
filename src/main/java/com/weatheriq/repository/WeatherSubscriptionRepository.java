package com.weatheriq.repository;

import com.weatheriq.document.WeatherSubscriptionDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeatherSubscriptionRepository extends MongoRepository<WeatherSubscriptionDocument, String> {
    List<WeatherSubscriptionDocument> findByUserId(String userId);
    List<WeatherSubscriptionDocument> findByUserIdAndEnabledTrue(String userId);
    List<WeatherSubscriptionDocument> findByEnabledTrue();
    long countByEnabledTrue();
    long countByUserId(String userId);
    void deleteByUserId(String userId);
}
