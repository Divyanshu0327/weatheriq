package com.weatheriq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;
    private long activeUsers;
    private long adminUsers;
    private long normalUsers;
    private long totalSavedCities;
    private long activeSubscriptions;
    private long emailsSent;
    private long activeAlerts;
    private long totalWeatherHistoryRecords;
}
