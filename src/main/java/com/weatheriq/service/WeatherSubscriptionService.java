package com.weatheriq.service;

import com.weatheriq.document.UserDocument;
import com.weatheriq.document.WeatherSubscriptionDocument;
import com.weatheriq.dto.request.WeatherSubscriptionRequest;
import com.weatheriq.dto.response.SubscriptionResponse;
import com.weatheriq.exception.ApiException;
import com.weatheriq.exception.ResourceNotFoundException;
import com.weatheriq.repository.UserRepository;
import com.weatheriq.repository.WeatherSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeatherSubscriptionService {

    private final WeatherSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public List<SubscriptionResponse> getUserSubscriptions(String userId) {
        return subscriptionRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SubscriptionResponse createSubscription(String userId, WeatherSubscriptionRequest request) {
        UserDocument user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Set<String> selectedMetrics = request.getSelectedMetrics();
        if (selectedMetrics == null || selectedMetrics.isEmpty()) {
            selectedMetrics = Set.of("TEMPERATURE", "RAIN_PROBABILITY", "AQI", "WEATHER_INTELLIGENCE");
        }

        WeatherSubscriptionDocument doc = WeatherSubscriptionDocument.builder()
                .userId(userId)
                .email(user.getEmail())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .frequency(request.getFrequency())
                .enabled(request.getEnabled() != null ? request.getEnabled() : true)
                .selectedMetrics(selectedMetrics)
                .build();

        WeatherSubscriptionDocument saved = subscriptionRepository.save(doc);
        return mapToResponse(saved);
    }

    public SubscriptionResponse updateSubscription(String userId, String id, WeatherSubscriptionRequest request) {
        WeatherSubscriptionDocument doc = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WeatherSubscription", "id", id));

        if (!doc.getUserId().equals(userId)) {
            throw new ApiException("Unauthorized access to subscription", HttpStatus.FORBIDDEN);
        }

        if (request.getCity() != null) doc.setCity(request.getCity());
        if (request.getLatitude() != null) doc.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) doc.setLongitude(request.getLongitude());
        if (request.getFrequency() != null) doc.setFrequency(request.getFrequency());
        if (request.getEnabled() != null) doc.setEnabled(request.getEnabled());
        if (request.getSelectedMetrics() != null && !request.getSelectedMetrics().isEmpty()) {
            doc.setSelectedMetrics(request.getSelectedMetrics());
        }

        WeatherSubscriptionDocument updated = subscriptionRepository.save(doc);
        return mapToResponse(updated);
    }

    public void deleteSubscription(String userId, String id) {
        WeatherSubscriptionDocument doc = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WeatherSubscription", "id", id));

        if (!doc.getUserId().equals(userId)) {
            throw new ApiException("Unauthorized access to subscription", HttpStatus.FORBIDDEN);
        }

        subscriptionRepository.delete(doc);
    }

    private SubscriptionResponse mapToResponse(WeatherSubscriptionDocument doc) {
        return SubscriptionResponse.builder()
                .id(doc.getId())
                .userId(doc.getUserId())
                .email(doc.getEmail())
                .city(doc.getCity())
                .latitude(doc.getLatitude())
                .longitude(doc.getLongitude())
                .frequency(doc.getFrequency())
                .enabled(doc.isEnabled())
                .selectedMetrics(doc.getSelectedMetrics())
                .lastSentAt(doc.getLastSentAt())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
