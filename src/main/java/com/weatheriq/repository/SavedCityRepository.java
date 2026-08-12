package com.weatheriq.repository;

import com.weatheriq.document.SavedCityDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedCityRepository extends MongoRepository<SavedCityDocument, String> {
    List<SavedCityDocument> findByUserId(String userId);
    Optional<SavedCityDocument> findByUserIdAndCityIgnoreCase(String userId, String city);
    boolean existsByUserIdAndCityIgnoreCase(String userId, String city);
    Optional<SavedCityDocument> findByUserIdAndIsDefaultTrue(String userId);
    long countByUserId(String userId);
    void deleteByUserId(String userId);
}
