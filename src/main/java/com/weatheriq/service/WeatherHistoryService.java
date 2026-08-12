package com.weatheriq.service;

import com.weatheriq.document.WeatherHistoryDocument;
import com.weatheriq.dto.response.WeatherHistoryResponse;
import com.weatheriq.repository.WeatherHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeatherHistoryService {

    private final WeatherHistoryRepository historyRepository;

    public List<WeatherHistoryResponse> getWeatherHistory(String city, String startDateStr, String endDateStr) {
        Instant endDate = endDateStr != null ? Instant.parse(endDateStr) : Instant.now();
        Instant startDate = startDateStr != null ? Instant.parse(startDateStr) : endDate.minus(7, ChronoUnit.DAYS);

        List<WeatherHistoryDocument> docs;
        if (city != null && !city.isBlank()) {
            docs = historyRepository.findByCityIgnoreCaseAndTimestampBetween(city, startDate, endDate);
            if (docs.isEmpty()) {
                docs = historyRepository.findByCityIgnoreCase(city);
            }
        } else {
            docs = historyRepository.findAll();
        }

        return docs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public void recordObservation(String city, double latitude, double longitude, double temperature,
                                  double humidity, double windSpeed, double rainProbability, Integer aqi, String condition) {
        WeatherHistoryDocument history = WeatherHistoryDocument.builder()
                .city(city)
                .latitude(latitude)
                .longitude(longitude)
                .timestamp(Instant.now())
                .temperature(temperature)
                .humidity(humidity)
                .windSpeed(windSpeed)
                .rainProbability(rainProbability)
                .aqi(aqi)
                .weatherCondition(condition)
                .build();
        historyRepository.save(history);
    }

    private WeatherHistoryResponse mapToResponse(WeatherHistoryDocument doc) {
        return WeatherHistoryResponse.builder()
                .id(doc.getId())
                .city(doc.getCity())
                .latitude(doc.getLatitude())
                .longitude(doc.getLongitude())
                .timestamp(doc.getTimestamp())
                .temperature(doc.getTemperature())
                .humidity(doc.getHumidity())
                .windSpeed(doc.getWindSpeed())
                .rainProbability(doc.getRainProbability())
                .aqi(doc.getAqi())
                .weatherCondition(doc.getWeatherCondition())
                .build();
    }
}
