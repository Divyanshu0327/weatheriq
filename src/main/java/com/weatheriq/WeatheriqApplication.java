package com.weatheriq;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@Slf4j
@SpringBootApplication
@EnableScheduling
@EnableCaching
public class WeatheriqApplication {

    public static void main(String[] args) {
        SpringApplication.run(WeatheriqApplication.class, args);
    }

    @PostConstruct
    public void debugMongoUri() {
        String uri = System.getenv("MONGODB_URI");
        if (uri == null) {
            log.warn("[DEBUG] MONGODB_URI environment variable is NULL/NOT SET");
        } else {
            String masked = uri.replaceAll("://([^:]+):([^@]+)@", "://$1:****@");
            log.warn("[DEBUG] MONGODB_URI resolved value: {}", masked);
        }
    }

}
