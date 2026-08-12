package com.weatheriq.service;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class EmailServiceLiveTest {

    @Autowired
    private EmailService emailService;

    @Test
    @Disabled("Manual live SMTP verification test")
    void testLiveSmtpDelivery() {
        boolean sent = emailService.sendVerificationEmail("test-user-id", "campusinfohub@gmail.com", "http://localhost:5173/verify-email-pending", "123456");
        assertTrue(sent, "Expected live Gmail SMTP dispatch to succeed");
    }
}
