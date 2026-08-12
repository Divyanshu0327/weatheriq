package com.weatheriq.service;

import com.weatheriq.util.WeatherUtils;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class WeatherUtilsTest {

    @Test
    void testGetWeatherCondition() {
        assertEquals("Clear sky", WeatherUtils.getWeatherCondition(0));
        assertEquals("Slight rain", WeatherUtils.getWeatherCondition(61));
        assertEquals("Thunderstorm", WeatherUtils.getWeatherCondition(95));
        assertEquals("Unknown (999)", WeatherUtils.getWeatherCondition(999));
    }

    @Test
    void testGetAqiCategory() {
        assertEquals("Good", WeatherUtils.getAqiCategory(30));
        assertEquals("Moderate", WeatherUtils.getAqiCategory(75));
        assertEquals("Unhealthy for Sensitive Groups", WeatherUtils.getAqiCategory(120));
        assertEquals("Unhealthy", WeatherUtils.getAqiCategory(180));
        assertEquals("Very Unhealthy", WeatherUtils.getAqiCategory(250));
        assertEquals("Hazardous", WeatherUtils.getAqiCategory(350));
    }
}
