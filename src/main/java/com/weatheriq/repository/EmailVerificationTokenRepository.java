package com.weatheriq.repository;

import com.weatheriq.document.EmailVerificationTokenDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends MongoRepository<EmailVerificationTokenDocument, String> {
    Optional<EmailVerificationTokenDocument> findByEmail(String email);
    Optional<EmailVerificationTokenDocument> findByTokenHash(String tokenHash);
    void deleteByUserId(String userId);
    void deleteByEmail(String email);
}
