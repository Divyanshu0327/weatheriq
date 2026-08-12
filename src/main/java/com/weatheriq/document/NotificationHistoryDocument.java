package com.weatheriq.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notificationHistory")
public class NotificationHistoryDocument {

    @Id
    private String id;

    private String userId;
    private String recipientEmail;
    private String type; // SUBSCRIPTION_UPDATE, WEATHER_ALERT, EMAIL_VERIFICATION, PASSWORD_RESET
    private String subject;
    private String status; // SENT, FAILED
    private String errorMessage;

    @CreatedDate
    private Instant sentAt;
}
