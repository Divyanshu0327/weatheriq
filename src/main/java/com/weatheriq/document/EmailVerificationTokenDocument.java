package com.weatheriq.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "emailVerificationTokens")
public class EmailVerificationTokenDocument {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String email;

    @Indexed
    private String tokenHash;

    @Builder.Default
    private int attempts = 0;

    private Instant expiresAt;

    @CreatedDate
    private Instant createdAt;
}
