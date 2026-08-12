package com.weatheriq.util;

import java.util.HashMap;
import java.util.Map;

public class WeatherUtils {

    private static final Map<Integer, String> WMO_CODE_MAP = new HashMap<>();

    static {
        WMO_CODE_MAP.put(0, "Clear sky");
        WMO_CODE_MAP.put(1, "Mainly clear");
        WMO_CODE_MAP.put(2, "Partly cloudy");
        WMO_CODE_MAP.put(3, "Overcast");
        WMO_CODE_MAP.put(45, "Fog");
        WMO_CODE_MAP.put(48, "Depositing rime fog");
        WMO_CODE_MAP.put(51, "Light drizzle");
        WMO_CODE_MAP.put(53, "Moderate drizzle");
        WMO_CODE_MAP.put(55, "Dense drizzle");
        WMO_CODE_MAP.put(56, "Light freezing drizzle");
        WMO_CODE_MAP.put(57, "Dense freezing drizzle");
        WMO_CODE_MAP.put(61, "Slight rain");
        WMO_CODE_MAP.put(63, "Moderate rain");
        WMO_CODE_MAP.put(65, "Heavy rain");
        WMO_CODE_MAP.put(66, "Light freezing rain");
        WMO_CODE_MAP.put(67, "Heavy freezing rain");
        WMO_CODE_MAP.put(71, "Slight snow fall");
        WMO_CODE_MAP.put(73, "Moderate snow fall");
        WMO_CODE_MAP.put(75, "Heavy snow fall");
        WMO_CODE_MAP.put(77, "Snow grains");
        WMO_CODE_MAP.put(80, "Slight rain showers");
        WMO_CODE_MAP.put(81, "Moderate rain showers");
        WMO_CODE_MAP.put(82, "Violent rain showers");
        WMO_CODE_MAP.put(85, "Slight snow showers");
        WMO_CODE_MAP.put(86, "Heavy snow showers");
        WMO_CODE_MAP.put(95, "Thunderstorm");
        WMO_CODE_MAP.put(96, "Thunderstorm with slight hail");
        WMO_CODE_MAP.put(99, "Thunderstorm with heavy hail");
    }

    public static String getWeatherCondition(int code) {
        return WMO_CODE_MAP.getOrDefault(code, "Unknown (" + code + ")");
    }

    public static String getAqiCategory(int aqi) {
        if (aqi <= 50) return "Good";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 150) return "Unhealthy for Sensitive Groups";
        if (aqi <= 200) return "Unhealthy";
        if (aqi <= 300) return "Very Unhealthy";
        return "Hazardous";
    }

    public static String getAqiHealthRecommendation(int aqi) {
        if (aqi <= 50) {
            return "Air quality is satisfactory and poses little or no risk.";
        } else if (aqi <= 100) {
            return "Air quality is acceptable. Sensitive individuals should consider reducing prolonged outdoor exertion.";
        } else if (aqi <= 150) {
            return "Members of sensitive groups may experience health effects. Limit prolonged outdoor exertion.";
        } else if (aqi <= 200) {
            return "Air quality is unhealthy. Everyone should limit prolonged outdoor exertion and wear a protective mask if necessary.";
        } else if (aqi <= 300) {
            return "Air quality is very unhealthy. Avoid outdoor activities and keep windows closed.";
        } else {
            return "Emergency conditions: Air quality is hazardous. Remain indoors and use air purifiers.";
        }
    }
}
