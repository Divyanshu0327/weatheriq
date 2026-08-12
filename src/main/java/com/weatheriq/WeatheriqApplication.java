package com.weatheriq;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableCaching
public class WeatheriqApplication {

    public static void main(String[] args) {
        SpringApplication.run(WeatheriqApplication.class, args);
    }

}
