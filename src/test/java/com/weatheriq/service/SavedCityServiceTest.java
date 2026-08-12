package com.weatheriq.service;

import com.weatheriq.document.SavedCityDocument;
import com.weatheriq.dto.request.SaveCityRequest;
import com.weatheriq.dto.response.SavedCityResponse;
import com.weatheriq.exception.ApiException;
import com.weatheriq.repository.SavedCityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class SavedCityServiceTest {

    @Mock
    private SavedCityRepository savedCityRepository;

    @InjectMocks
    private SavedCityService savedCityService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSaveCitySuccess() {
        SaveCityRequest request = new SaveCityRequest();
        request.setCity("Delhi");
        request.setCountry("India");
        request.setLatitude(28.61);
        request.setLongitude(77.21);
        request.setIsDefault(true);

        when(savedCityRepository.existsByUserIdAndCityIgnoreCase("user123", "Delhi")).thenReturn(false);
        when(savedCityRepository.findByUserIdAndIsDefaultTrue("user123")).thenReturn(Optional.empty());

        SavedCityDocument savedDoc = SavedCityDocument.builder()
                .id("city123")
                .userId("user123")
                .city("Delhi")
                .country("India")
                .latitude(28.61)
                .longitude(77.21)
                .isDefault(true)
                .build();

        when(savedCityRepository.save(any(SavedCityDocument.class))).thenReturn(savedDoc);

        SavedCityResponse response = savedCityService.saveCity("user123", request);

        assertNotNull(response);
        assertEquals("Delhi", response.getCity());
        assertTrue(response.isDefault());
        verify(savedCityRepository, times(1)).save(any(SavedCityDocument.class));
    }

    @Test
    void testSaveDuplicateCityThrowsException() {
        SaveCityRequest request = new SaveCityRequest();
        request.setCity("Delhi");

        when(savedCityRepository.existsByUserIdAndCityIgnoreCase("user123", "Delhi")).thenReturn(true);

        assertThrows(ApiException.class, () -> savedCityService.saveCity("user123", request));
    }
}
