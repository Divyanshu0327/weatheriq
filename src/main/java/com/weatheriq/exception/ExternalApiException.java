package com.weatheriq.exception;

import org.springframework.http.HttpStatus;

public class ExternalApiException extends ApiException {
    public ExternalApiException(String message) {
        super("External API Error: " + message, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
