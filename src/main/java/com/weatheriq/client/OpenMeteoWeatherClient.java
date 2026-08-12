package com.weatheriq.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.weatheriq.dto.response.*;
import com.weatheriq.exception.ExternalApiException;
import com.weatheriq.util.WeatherUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OpenMeteoWeatherClient {

    @Value("${openmeteo.weather.url:https://api.open-meteo.com/v1/forecast}")
    private String weatherUrl;

    private final RestClient restClient = RestClient.create();

    public OpenMeteoForecastResponse fetchRawForecast(double latitude, double longitude) {
        try {
            String uri = String.format("%s?latitude=%.4f&longitude=%.4f" +
                            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m" +
                            "&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,rain,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,uv_index" +
                            "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max" +
                            "&timezone=auto",
                    weatherUrl, latitude, longitude);

            OpenMeteoForecastResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(OpenMeteoForecastResponse.class);

            if (response == null) {
                throw new ExternalApiException("Empty response received from Open-Meteo Weather API");
            }
            return response;
        } catch (Exception ex) {
            throw new ExternalApiException("Failed to fetch weather from Open-Meteo: " + ex.getMessage());
        }
    }

    public CurrentWeatherResponse getCurrentWeather(double latitude, double longitude) {
        OpenMeteoForecastResponse raw = fetchRawForecast(latitude, longitude);
        CurrentUnits current = raw.getCurrent();
        DailyUnits daily = raw.getDaily();

        Double uvIndex = null;
        if (raw.getHourly() != null && raw.getHourly().getUvIndex() != null && !raw.getHourly().getUvIndex().isEmpty()) {
            uvIndex = raw.getHourly().getUvIndex().get(0);
        }

        String sunrise = (daily != null && daily.getSunrise() != null && !daily.getSunrise().isEmpty()) ? daily.getSunrise().get(0) : null;
        String sunset = (daily != null && daily.getSunset() != null && !daily.getSunset().isEmpty()) ? daily.getSunset().get(0) : null;

        return CurrentWeatherResponse.builder()
                .temperature(current.getTemperature2m())
                .apparentTemperature(current.getApparentTemperature())
                .weatherCondition(WeatherUtils.getWeatherCondition(current.getWeatherCode()))
                .weatherCode(current.getWeatherCode())
                .humidity(current.getRelativeHumidity2m())
                .windSpeed(current.getWindSpeed10m())
                .windDirection(current.getWindDirection10m())
                .visibility(raw.getHourly() != null && raw.getHourly().getVisibility() != null && !raw.getHourly().getVisibility().isEmpty() ? raw.getHourly().getVisibility().get(0) : null)
                .pressure(current.getSurfacePressure())
                .uvIndex(uvIndex)
                .sunrise(sunrise)
                .sunset(sunset)
                .timestamp(current.getTime())
                .build();
    }

    public HourlyWeatherResponse getHourlyWeather(double latitude, double longitude) {
        OpenMeteoForecastResponse raw = fetchRawForecast(latitude, longitude);
        HourlyUnits hourly = raw.getHourly();

        List<HourlyWeatherItem> items = new ArrayList<>();
        if (hourly != null && hourly.getTime() != null) {
            int count = Math.min(24, hourly.getTime().size());
            for (int i = 0; i < count; i++) {
                items.add(HourlyWeatherItem.builder()
                        .time(hourly.getTime().get(i))
                        .temperature(hourly.getTemperature2m().get(i))
                        .apparentTemperature(hourly.getApparentTemperature().get(i))
                        .rainProbability(hourly.getPrecipitationProbability().get(i))
                        .rain(hourly.getRain() != null && i < hourly.getRain().size() ? hourly.getRain().get(i) : 0.0)
                        .humidity(hourly.getRelativeHumidity2m().get(i))
                        .windSpeed(hourly.getWindSpeed10m().get(i))
                        .windDirection(hourly.getWindDirection10m().get(i))
                        .weatherCondition(WeatherUtils.getWeatherCondition(hourly.getWeatherCode().get(i)))
                        .build());
            }
        }

        return HourlyWeatherResponse.builder()
                .latitude(latitude)
                .longitude(longitude)
                .timezone(raw.getTimezone())
                .hourlyList(items)
                .build();
    }

    public DailyForecastResponse getDailyForecast(double latitude, double longitude) {
        OpenMeteoForecastResponse raw = fetchRawForecast(latitude, longitude);
        DailyUnits daily = raw.getDaily();

        List<DailyForecastItem> items = new ArrayList<>();
        if (daily != null && daily.getTime() != null) {
            int count = daily.getTime().size();
            for (int i = 0; i < count; i++) {
                items.add(DailyForecastItem.builder()
                        .date(daily.getTime().get(i))
                        .maxTemperature(daily.getTemperature2mMax().get(i))
                        .minTemperature(daily.getTemperature2mMin().get(i))
                        .rainProbability(daily.getPrecipitationProbabilityMax().get(i))
                        .weatherCondition("Forecast Day " + (i + 1))
                        .sunrise(daily.getSunrise().get(i))
                        .sunset(daily.getSunset().get(i))
                        .uvIndex(daily.getUvIndexMax() != null && i < daily.getUvIndexMax().size() ? daily.getUvIndexMax().get(i) : null)
                        .build());
            }
        }

        return DailyForecastResponse.builder()
                .latitude(latitude)
                .longitude(longitude)
                .timezone(raw.getTimezone())
                .dailyList(items)
                .build();
    }

    @Data
    public static class OpenMeteoForecastResponse {
        private double latitude;
        private double longitude;
        private String timezone;
        private CurrentUnits current;
        private HourlyUnits hourly;
        private DailyUnits daily;
    }

    @Data
    public static class CurrentUnits {
        private String time;
        @JsonProperty("temperature_2m")
        private double temperature2m;
        @JsonProperty("relative_humidity_2m")
        private double relativeHumidity2m;
        @JsonProperty("apparent_temperature")
        private double apparentTemperature;
        @JsonProperty("weather_code")
        private int weatherCode;
        @JsonProperty("surface_pressure")
        private double surfacePressure;
        @JsonProperty("wind_speed_10m")
        private double windSpeed10m;
        @JsonProperty("wind_direction_10m")
        private double windDirection10m;
    }

    @Data
    public static class HourlyUnits {
        private List<String> time;
        @JsonProperty("temperature_2m")
        private List<Double> temperature2m;
        @JsonProperty("relative_humidity_2m")
        private List<Double> relativeHumidity2m;
        @JsonProperty("apparent_temperature")
        private List<Double> apparentTemperature;
        @JsonProperty("precipitation_probability")
        private List<Double> precipitationProbability;
        private List<Double> rain;
        @JsonProperty("weather_code")
        private List<Integer> weatherCode;
        private List<Double> visibility;
        @JsonProperty("wind_speed_10m")
        private List<Double> windSpeed10m;
        @JsonProperty("wind_direction_10m")
        private List<Double> windDirection10m;
        @JsonProperty("uv_index")
        private List<Double> uvIndex;
    }

    @Data
    public static class DailyUnits {
        private List<String> time;
        @JsonProperty("temperature_2m_max")
        private List<Double> temperature2mMax;
        @JsonProperty("temperature_2m_min")
        private List<Double> temperature2mMin;
        @JsonProperty("precipitation_probability_max")
        private List<Double> precipitationProbabilityMax;
        private List<String> sunrise;
        private List<String> sunset;
        @JsonProperty("uv_index_max")
        private List<Double> uvIndexMax;
    }
}
