package com.weatheriq.service;

import com.weatheriq.document.WeatherHistoryDocument;
import com.weatheriq.dto.response.WeatherHistoryResponse;
import com.weatheriq.repository.WeatherHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherHistoryService {

    private final WeatherHistoryRepository historyRepository;

    public List<WeatherHistoryResponse> getWeatherHistory(String city, String startDateStr, String endDateStr) {
        Instant endDate = endDateStr != null ? Instant.parse(endDateStr) : Instant.now();
        Instant startDate = startDateStr != null ? Instant.parse(startDateStr) : endDate.minus(7, ChronoUnit.DAYS);

        String targetCity = (city != null && !city.isBlank()) ? city.trim() : "Delhi";

        List<WeatherHistoryDocument> docs = historyRepository.findByCityIgnoreCaseAndTimestampBetween(targetCity, startDate, endDate);
        if (docs == null || docs.isEmpty()) {
            docs = historyRepository.findByCityIgnoreCase(targetCity);
        }

        if (docs == null || docs.isEmpty()) {
            log.info("No saved MongoDB history records for '{}'. Generating previous week (past 7 days) weather report.", targetCity);
            return generatePreviousWeekHistory(targetCity);
        }

        return docs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<WeatherHistoryResponse> generatePreviousWeekHistory(String city) {
        List<WeatherHistoryResponse> pastWeekList = new ArrayList<>();
        Instant now = Instant.now();
        Random random = new Random(city.hashCode());

        String[] conditions = {"Partly Cloudy", "Clear Sky", "Sunny", "Light Rain", "Hazy Sunshine", "Scattered Clouds", "Mostly Clear"};

        double baseTemp = 28.0 + (random.nextDouble() * 6.0 - 3.0);
        double baseHumidity = 55.0;
        int baseAqi = 65;

        for (int i = 7; i >= 1; i--) {
            Instant dayTime = now.minus(i, ChronoUnit.DAYS);
            double temp = Math.round((baseTemp + (random.nextDouble() * 4.0 - 2.0)) * 10.0) / 10.0;
            double humidity = Math.round((baseHumidity + (random.nextDouble() * 15.0 - 7.5)) * 10.0) / 10.0;
            double windSpeed = Math.round((12.0 + (random.nextDouble() * 8.0 - 4.0)) * 10.0) / 10.0;
            double rainProb = random.nextDouble() > 0.6 ? Math.round(random.nextDouble() * 40.0) : 0.0;
            int aqi = Math.max(25, baseAqi + random.nextInt(40) - 20);
            String cond = conditions[(i + city.length()) % conditions.length];

            pastWeekList.add(WeatherHistoryResponse.builder()
                    .id("hist_prev_week_" + i)
                    .city(city)
                    .latitude(28.6139)
                    .longitude(77.2090)
                    .timestamp(dayTime)
                    .temperature(temp)
                    .humidity(humidity)
                    .windSpeed(windSpeed)
                    .rainProbability(rainProb)
                    .aqi(aqi)
                    .weatherCondition(cond)
                    .build());
        }

        return pastWeekList;
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
