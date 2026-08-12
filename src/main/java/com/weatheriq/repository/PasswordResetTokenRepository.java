package com.weatheriq.repository;

import com.weatheriq.document.PasswordResetTokenDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetTokenDocument, String> {
    Optional<PasswordResetTokenDocument> findByEmail(String email);
    Optional<PasswordResetTokenDocument> findByTokenHash(String tokenHash);
    void deleteByUserId(String userId);
    void deleteByEmail(String email);
}
