package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import com.weatheriq.dto.request.UpdatePreferencesRequest;
import com.weatheriq.dto.request.UpdateProfileRequest;
import com.weatheriq.dto.response.UserResponse;
import com.weatheriq.security.UserPrincipal;
import com.weatheriq.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "User profile and preferences management")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserResponse response = userService.getCurrentUserProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("User profile fetched successfully", response));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse response = userService.updateUserProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("User profile updated successfully", response));
    }

    @PutMapping("/preferences")
    @Operation(summary = "Update user preferences (units, notifications, default city)")
    public ResponseEntity<ApiResponse<UserResponse>> updatePreferences(@AuthenticationPrincipal UserPrincipal principal,
                                                                        @Valid @RequestBody UpdatePreferencesRequest request) {
        UserResponse response = userService.updateUserPreferences(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("User preferences updated successfully", response));
    }
}
