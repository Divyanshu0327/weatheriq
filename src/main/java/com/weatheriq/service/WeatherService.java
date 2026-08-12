package com.weatheriq.service;

import com.weatheriq.client.OpenMeteoAirQualityClient;
import com.weatheriq.client.OpenMeteoGeocodingClient;
import com.weatheriq.client.OpenMeteoWeatherClient;
import com.weatheriq.dto.response.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final OpenMeteoGeocodingClient geocodingClient;
    private final OpenMeteoWeatherClient weatherClient;
    private final OpenMeteoAirQualityClient airQualityClient;

    @Cacheable(value = "locations", key = "#name.toLowerCase()")
    public List<CitySearchResponse> searchLocations(String name) {
        return geocodingClient.searchCities(name);
    }

    @Cacheable(value = "currentWeather", key = "T(String).format('%.2f_%.2f', #latitude, #longitude)")
    public CurrentWeatherResponse getCurrentWeather(double latitude, double longitude) {
        return weatherClient.getCurrentWeather(latitude, longitude);
    }

    @Cacheable(value = "hourlyWeather", key = "T(String).format('%.2f_%.2f', #latitude, #longitude)")
    public HourlyWeatherResponse getHourlyWeather(double latitude, double longitude) {
        return weatherClient.getHourlyWeather(latitude, longitude);
    }

    @Cacheable(value = "dailyForecast", key = "T(String).format('%.2f_%.2f', #latitude, #longitude)")
    public DailyForecastResponse getDailyForecast(double latitude, double longitude) {
        return weatherClient.getDailyForecast(latitude, longitude);
    }

    @Cacheable(value = "airQuality", key = "T(String).format('%.2f_%.2f', #latitude, #longitude)")
    public AirQualityResponse getAirQuality(double latitude, double longitude) {
        return airQualityClient.fetchAirQuality(latitude, longitude);
    }
}
