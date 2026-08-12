package com.weatheriq.repository;

import com.weatheriq.document.SystemLogDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemLogRepository extends MongoRepository<SystemLogDocument, String> {
}
