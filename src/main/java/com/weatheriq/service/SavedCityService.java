package com.weatheriq.service;

import com.weatheriq.document.SavedCityDocument;
import com.weatheriq.dto.request.SaveCityRequest;
import com.weatheriq.dto.response.SavedCityResponse;
import com.weatheriq.exception.ApiException;
import com.weatheriq.exception.ResourceNotFoundException;
import com.weatheriq.repository.SavedCityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedCityService {

    private final SavedCityRepository savedCityRepository;

    public List<SavedCityResponse> getUserCities(String userId) {
        return savedCityRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SavedCityResponse saveCity(String userId, SaveCityRequest request) {
        if (savedCityRepository.existsByUserIdAndCityIgnoreCase(userId, request.getCity())) {
            throw new ApiException("City '" + request.getCity() + "' is already in your saved cities", HttpStatus.BAD_REQUEST);
        }

        boolean isDefault = Boolean.TRUE.equals(request.getIsDefault());

        if (isDefault) {
            clearPreviousDefault(userId);
        }

        SavedCityDocument savedCity = SavedCityDocument.builder()
                .userId(userId)
                .city(request.getCity())
                .country(request.getCountry())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timezone(request.getTimezone())
                .isDefault(isDefault)
                .build();

        SavedCityDocument saved = savedCityRepository.save(savedCity);
        return mapToResponse(saved);
    }

    public SavedCityResponse setDefaultCity(String userId, String cityId) {
        SavedCityDocument targetCity = savedCityRepository.findById(cityId)
                .orElseThrow(() -> new ResourceNotFoundException("SavedCity", "id", cityId));

        if (!targetCity.getUserId().equals(userId)) {
            throw new ApiException("Unauthorized access to saved city", HttpStatus.FORBIDDEN);
        }

        clearPreviousDefault(userId);
        targetCity.setDefault(true);
        SavedCityDocument updated = savedCityRepository.save(targetCity);
        return mapToResponse(updated);
    }

    public void deleteCity(String userId, String cityId) {
        SavedCityDocument targetCity = savedCityRepository.findById(cityId)
                .orElseThrow(() -> new ResourceNotFoundException("SavedCity", "id", cityId));

        if (!targetCity.getUserId().equals(userId)) {
            throw new ApiException("Unauthorized access to saved city", HttpStatus.FORBIDDEN);
        }

        savedCityRepository.delete(targetCity);
    }

    private void clearPreviousDefault(String userId) {
        savedCityRepository.findByUserIdAndIsDefaultTrue(userId).ifPresent(c -> {
            c.setDefault(false);
            savedCityRepository.save(c);
        });
    }

    private SavedCityResponse mapToResponse(SavedCityDocument doc) {
        return SavedCityResponse.builder()
                .id(doc.getId())
                .city(doc.getCity())
                .country(doc.getCountry())
                .latitude(doc.getLatitude())
                .longitude(doc.getLongitude())
                .timezone(doc.getTimezone())
                .isDefault(doc.isDefault())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
