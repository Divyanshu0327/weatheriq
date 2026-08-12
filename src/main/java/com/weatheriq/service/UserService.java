package com.weatheriq.service;

import com.weatheriq.document.UserDocument;
import com.weatheriq.dto.request.UpdatePreferencesRequest;
import com.weatheriq.dto.request.UpdateProfileRequest;
import com.weatheriq.dto.response.UserResponse;
import com.weatheriq.exception.ResourceNotFoundException;
import com.weatheriq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    public UserResponse getCurrentUserProfile(String userId) {
        UserDocument user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return authService.mapToUserResponse(user);
    }

    public UserResponse updateUserProfile(String userId, UpdateProfileRequest request) {
        UserDocument user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        UserDocument updated = userRepository.save(user);
        return authService.mapToUserResponse(updated);
    }

    public UserResponse updateUserPreferences(String userId, UpdatePreferencesRequest request) {
        UserDocument user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getDefaultCity() != null) {
            user.setDefaultCity(request.getDefaultCity());
        }
        if (request.getTemperatureUnit() != null) {
            user.setTemperatureUnit(request.getTemperatureUnit());
        }
        if (request.getNotificationEnabled() != null) {
            user.setNotificationEnabled(request.getNotificationEnabled());
        }
        if (request.getEmailNotificationsEnabled() != null) {
            user.setEmailNotificationsEnabled(request.getEmailNotificationsEnabled());
        }

        UserDocument updated = userRepository.save(user);
        return authService.mapToUserResponse(updated);
    }
}
