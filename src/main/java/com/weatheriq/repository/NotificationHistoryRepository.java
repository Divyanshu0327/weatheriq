package com.weatheriq.repository;

import com.weatheriq.document.NotificationHistoryDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationHistoryRepository extends MongoRepository<NotificationHistoryDocument, String> {
    List<NotificationHistoryDocument> findByUserId(String userId);
    long countByStatus(String status);
}
