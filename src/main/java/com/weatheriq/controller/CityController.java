package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import com.weatheriq.dto.request.SaveCityRequest;
import com.weatheriq.dto.response.SavedCityResponse;
import com.weatheriq.security.UserPrincipal;
import com.weatheriq.service.SavedCityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
@Tag(name = "Saved Cities", description = "User saved locations management")
@SecurityRequirement(name = "bearerAuth")
public class CityController {

    private final SavedCityService savedCityService;

    @GetMapping
    @Operation(summary = "Get user's saved cities")
    public ResponseEntity<ApiResponse<List<SavedCityResponse>>> getCities(@AuthenticationPrincipal UserPrincipal principal) {
        List<SavedCityResponse> cities = savedCityService.getUserCities(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Saved cities fetched successfully", cities));
    }

    @PostMapping
    @Operation(summary = "Save a new city")
    public ResponseEntity<ApiResponse<SavedCityResponse>> saveCity(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @Valid @RequestBody SaveCityRequest request) {
        SavedCityResponse response = savedCityService.saveCity(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("City saved successfully", response));
    }

    @PutMapping("/{id}/default")
    @Operation(summary = "Set a saved city as default")
    public ResponseEntity<ApiResponse<SavedCityResponse>> setDefaultCity(@AuthenticationPrincipal UserPrincipal principal,
                                                                          @PathVariable String id) {
        SavedCityResponse response = savedCityService.setDefaultCity(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Default city updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a saved city")
    public ResponseEntity<ApiResponse<Void>> deleteCity(@AuthenticationPrincipal UserPrincipal principal,
                                                         @PathVariable String id) {
        savedCityService.deleteCity(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Saved city deleted successfully"));
    }
}
