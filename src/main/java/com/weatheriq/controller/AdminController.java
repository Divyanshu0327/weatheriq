package com.weatheriq.controller;

import com.weatheriq.dto.ApiResponse;
import com.weatheriq.dto.request.AdminUpdateUserRequest;
import com.weatheriq.dto.response.AdminDashboardResponse;
import com.weatheriq.dto.response.AdminUserDetailsResponse;
import com.weatheriq.dto.response.UserResponse;
import com.weatheriq.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.weatheriq.scheduler.WeatherEmailScheduler;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Management", description = "Admin monitoring analytics and user management APIs")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;
    private final WeatherEmailScheduler weatherEmailScheduler;

    @PostMapping("/scheduler/trigger")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Manually trigger scheduled weather subscription and alert jobs (ADMIN role required)")
    public ResponseEntity<ApiResponse<Map<String, String>>> triggerSchedulerManually() {
        weatherEmailScheduler.processScheduledSubscriptions();
        weatherEmailScheduler.processScheduledAlerts();
        return ResponseEntity.ok(ApiResponse.success("Scheduled weather subscription and alert jobs triggered successfully",
                Map.of("status", "SUCCESS", "message", "Scheduler execution completed")));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin dashboard statistics (ADMIN role required)")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse stats = adminService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Admin stats fetched successfully", stats));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all registered users with search and filter options")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "ALL") String role,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "ALL") String verification
    ) {
        List<UserResponse> users = adminService.getAllUsers(search, role, status, verification);
        return ResponseEntity.ok(ApiResponse.success("User list retrieved successfully", users));
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user details including metric counts by user ID")
    public ResponseEntity<ApiResponse<AdminUserDetailsResponse>> getUserDetails(@PathVariable String id) {
        AdminUserDetailsResponse userDetails = adminService.getUserDetails(id);
        return ResponseEntity.ok(ApiResponse.success("User details retrieved successfully", userDetails));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user details (name, email, role, enabled, emailVerified)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String id,
            @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        UserResponse updated = adminService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role (USER or ADMIN)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        String role = body.getOrDefault("role", "USER");
        UserResponse updated = adminService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", updated));
    }

    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate or deactivate user account status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> body
    ) {
        boolean enabled = body.getOrDefault("enabled", true);
        UserResponse updated = adminService.updateUserStatus(id, enabled);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", updated));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Permanently delete user and clean up associated records")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User permanently deleted", null));
    }
}
