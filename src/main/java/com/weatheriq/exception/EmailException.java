package com.weatheriq.exception;

import org.springframework.http.HttpStatus;

public class EmailException extends ApiException {
    public EmailException(String message) {
        super("Email Error: " + message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
