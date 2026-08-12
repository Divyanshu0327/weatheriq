package com.weatheriq.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.weatheriq.dto.response.AirQualityResponse;
import com.weatheriq.exception.ExternalApiException;
import com.weatheriq.util.WeatherUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class OpenMeteoAirQualityClient {

    @Value("${openmeteo.airquality.url:https://air-quality-api.open-meteo.com/v1/air-quality}")
    private String airQualityUrl;

    private final RestClient restClient = RestClient.create();

    public AirQualityResponse fetchAirQuality(double latitude, double longitude) {
        try {
            String uri = String.format("%s?latitude=%.4f&longitude=%.4f&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide&timezone=auto",
                    airQualityUrl, latitude, longitude);

            AirQualityApiResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(AirQualityApiResponse.class);

            if (response == null || response.getCurrent() == null) {
                throw new ExternalApiException("Empty response received from Open-Meteo Air Quality API");
            }

            AirQualityCurrent current = response.getCurrent();
            int aqi = current.getUsAqi() != null ? current.getUsAqi() : 0;
            String category = WeatherUtils.getAqiCategory(aqi);
            String recommendation = WeatherUtils.getAqiHealthRecommendation(aqi);

            return AirQualityResponse.builder()
                    .aqi(aqi)
                    .pm2_5(current.getPm2_5())
                    .pm10(current.getPm10())
                    .no2(current.getNitrogenDioxide())
                    .o3(current.getOzone())
                    .co(current.getCarbonMonoxide())
                    .so2(current.getSulphurDioxide())
                    .category(category)
                    .healthRecommendation(recommendation)
                    .build();
        } catch (Exception ex) {
            throw new ExternalApiException("Failed to fetch air quality from Open-Meteo: " + ex.getMessage());
        }
    }

    @Data
    public static class AirQualityApiResponse {
        private AirQualityCurrent current;
    }

    @Data
    public static class AirQualityCurrent {
        @JsonProperty("us_aqi")
        private Integer usAqi;
        @JsonProperty("pm2_5")
        private Double pm2_5;
        @JsonProperty("pm10")
        private Double pm10;
        @JsonProperty("nitrogen_dioxide")
        private Double nitrogenDioxide;
        private Double ozone;
        @JsonProperty("carbon_monoxide")
        private Double carbonMonoxide;
        @JsonProperty("sulphur_dioxide")
        private Double sulphurDioxide;
    }
}
