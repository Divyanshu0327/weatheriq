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
@Document(collection = "systemLogs")
public class SystemLogDocument {

    @Id
    private String id;

    private String level; // INFO, WARN, ERROR
    private String message;
    private String service;
    private String details;

    @CreatedDate
    private Instant timestamp;
}
