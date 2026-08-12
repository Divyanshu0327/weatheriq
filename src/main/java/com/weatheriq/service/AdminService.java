package com.weatheriq.service;

import com.weatheriq.document.UserDocument;
import com.weatheriq.dto.request.AdminUpdateUserRequest;
import com.weatheriq.dto.response.AdminDashboardResponse;
import com.weatheriq.dto.response.AdminUserDetailsResponse;
import com.weatheriq.dto.response.UserResponse;
import com.weatheriq.exception.ApiException;
import com.weatheriq.exception.ResourceNotFoundException;
import com.weatheriq.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final SavedCityRepository savedCityRepository;
    private final WeatherSubscriptionRepository subscriptionRepository;
    private final NotificationHistoryRepository notificationHistoryRepository;
    private final WeatherAlertRepository alertRepository;
    private final WeatherHistoryRepository historyRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository resetTokenRepository;

    public AdminDashboardResponse getAdminDashboardStats() {
        List<UserDocument> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(UserDocument::isEnabled).count();
        long adminUsers = allUsers.stream().filter(u -> u.getRoles().contains("ROLE_ADMIN") || u.getRoles().contains("ADMIN")).count();
        long normalUsers = totalUsers - adminUsers;

        long activeSubscriptions = subscriptionRepository.countByEnabledTrue();
        long totalSavedCities = savedCityRepository.count();
        long emailsSent = notificationHistoryRepository.countByStatus("SENT");
        long activeAlerts = alertRepository.countByEnabledTrue();
        long historyCount = historyRepository.count();

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .adminUsers(adminUsers)
                .normalUsers(normalUsers)
                .totalSavedCities(totalSavedCities)
                .activeSubscriptions(activeSubscriptions)
                .emailsSent(emailsSent)
                .activeAlerts(activeAlerts)
                .totalWeatherHistoryRecords(historyCount)
                .build();
    }

    public List<UserResponse> getAllUsers(String search, String roleFilter, String statusFilter, String verificationFilter) {
        List<UserDocument> users = userRepository.findAll();

        return users.stream()
                .filter(u -> {
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.trim().toLowerCase();
                        boolean matchName = u.getName() != null && u.getName().toLowerCase().contains(q);
                        boolean matchEmail = u.getEmail() != null && u.getEmail().toLowerCase().contains(q);
                        if (!matchName && !matchEmail) return false;
                    }
                    if (roleFilter != null && !roleFilter.equalsIgnoreCase("ALL")) {
                        boolean isAdmin = u.getRoles().contains("ROLE_ADMIN") || u.getRoles().contains("ADMIN");
                        if (roleFilter.equalsIgnoreCase("ADMIN") && !isAdmin) return false;
                        if (roleFilter.equalsIgnoreCase("USER") && isAdmin) return false;
                    }
                    if (statusFilter != null && !statusFilter.equalsIgnoreCase("ALL")) {
                        if (statusFilter.equalsIgnoreCase("ACTIVE") && !u.isEnabled()) return false;
                        if (statusFilter.equalsIgnoreCase("INACTIVE") && u.isEnabled()) return false;
                    }
                    if (verificationFilter != null && !verificationFilter.equalsIgnoreCase("ALL")) {
                        if (verificationFilter.equalsIgnoreCase("VERIFIED") && !u.isEmailVerified()) return false;
                        if (verificationFilter.equalsIgnoreCase("UNVERIFIED") && u.isEmailVerified()) return false;
                    }
                    return true;
                })
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public AdminUserDetailsResponse getUserDetails(String id) {
        UserDocument user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        long savedCitiesCount = savedCityRepository.countByUserId(id);
        long alertsCount = alertRepository.countByUserId(id);
        long subscriptionsCount = subscriptionRepository.countByUserId(id);

        return AdminUserDetailsResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .emailVerified(user.isEmailVerified())
                .enabled(user.isEnabled())
                .defaultCity(user.getDefaultCity())
                .temperatureUnit(user.getTemperatureUnit())
                .notificationEnabled(user.isNotificationEnabled())
                .emailNotificationsEnabled(user.isEmailNotificationsEnabled())
                .roles(user.getRoles())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .savedCitiesCount(savedCitiesCount)
                .alertsCount(alertsCount)
                .subscriptionsCount(subscriptionsCount)
                .weatherHistoryCount(0)
                .build();
    }

    public UserResponse updateUser(String id, AdminUpdateUserRequest request) {
        UserDocument user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Email uniqueness check
        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email " + request.getEmail() + " is already in use by another user", HttpStatus.BAD_REQUEST);
        }

        // Safety check for last admin
        boolean isCurrentlyAdmin = user.getRoles().contains("ROLE_ADMIN") || user.getRoles().contains("ADMIN");
        boolean willBeAdmin = request.getRoles() != null &&
                (request.getRoles().contains("ROLE_ADMIN") || request.getRoles().contains("ADMIN"));
        boolean willBeDisabled = request.getEnabled() != null && !request.getEnabled();

        if (isCurrentlyAdmin && (!willBeAdmin || willBeDisabled)) {
            ensureNotLastAdmin(id);
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        if (request.getRoles() != null) {
            Set<String> normalizedRoles = new HashSet<>();
            for (String r : request.getRoles()) {
                normalizedRoles.add(r.startsWith("ROLE_") ? r : "ROLE_" + r);
            }
            user.setRoles(normalizedRoles);
        }

        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        if (request.getEmailVerified() != null) {
            user.setEmailVerified(request.getEmailVerified());
        }

        UserDocument updated = userRepository.save(user);
        return mapToUserResponse(updated);
    }

    public UserResponse updateUserRole(String id, String newRole) {
        UserDocument user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        String targetRole = newRole.startsWith("ROLE_") ? newRole : "ROLE_" + newRole;
        boolean isCurrentlyAdmin = user.getRoles().contains("ROLE_ADMIN") || user.getRoles().contains("ADMIN");

        if (isCurrentlyAdmin && !targetRole.equals("ROLE_ADMIN")) {
            ensureNotLastAdmin(id);
        }

        Set<String> roles = new HashSet<>();
        roles.add(targetRole);
        if (targetRole.equals("ROLE_ADMIN")) {
            roles.add("ROLE_USER");
        }
        user.setRoles(roles);

        UserDocument updated = userRepository.save(user);
        return mapToUserResponse(updated);
    }

    public UserResponse updateUserStatus(String id, boolean enabled) {
        UserDocument user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        boolean isCurrentlyAdmin = user.getRoles().contains("ROLE_ADMIN") || user.getRoles().contains("ADMIN");
        if (isCurrentlyAdmin && !enabled) {
            ensureNotLastAdmin(id);
        }

        user.setEnabled(enabled);
        UserDocument updated = userRepository.save(user);
        return mapToUserResponse(updated);
    }

    public void deleteUser(String id) {
        UserDocument user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        boolean isCurrentlyAdmin = user.getRoles().contains("ROLE_ADMIN") || user.getRoles().contains("ADMIN");
        if (isCurrentlyAdmin) {
            ensureNotLastAdmin(id);
        }

        // Clean up user related documents in MongoDB
        savedCityRepository.deleteByUserId(id);
        alertRepository.deleteByUserId(id);
        subscriptionRepository.deleteByUserId(id);
        verificationTokenRepository.deleteByUserId(id);
        resetTokenRepository.deleteByUserId(id);

        userRepository.delete(user);
    }

    private void ensureNotLastAdmin(String userId) {
        List<UserDocument> allUsers = userRepository.findAll();
        long activeAdminCount = allUsers.stream()
                .filter(UserDocument::isEnabled)
                .filter(u -> u.getRoles().contains("ROLE_ADMIN") || u.getRoles().contains("ADMIN"))
                .count();

        if (activeAdminCount <= 1) {
            throw new ApiException("Operation forbidden: Cannot modify, deactivate, or delete the last active ADMIN account", HttpStatus.BAD_REQUEST);
        }
    }

    private UserResponse mapToUserResponse(UserDocument user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .emailVerified(user.isEmailVerified())
                .enabled(user.isEnabled())
                .defaultCity(user.getDefaultCity())
                .temperatureUnit(user.getTemperatureUnit())
                .notificationEnabled(user.isNotificationEnabled())
                .emailNotificationsEnabled(user.isEmailNotificationsEnabled())
                .roles(user.getRoles())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
