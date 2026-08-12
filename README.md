# WeatherIQ — Weather Intelligence & Personal Alerts Platform (Backend)

Welcome to the backend specification and production REST API implementation for **WeatherIQ**.

WeatherIQ is a Spring Boot & MongoDB weather platform designed to do more than display temperature—it converts raw meteorology metrics into actionable advice, smart alerts, scheduled city email subscriptions, travel weather assessments, and historical trends.

---

## 🏗️ Architecture & Package Structure

Clean layered architecture under base package `com.weatheriq`:

```
com.weatheriq
├── client                # Open-Meteo REST clients (Geocoding, Forecast, Air Quality)
├── config                # Spring configurations (OpenAPI/Swagger, Security, Caching)
├── controller            # Thin REST Controllers exposing public and protected endpoints
├── document              # MongoDB Data Documents (users, savedCities, subscriptions, alerts...)
├── dto                   # API Request and Response DTOs
│   ├── request
│   └── response
├── exception             # Global exception handling (@RestControllerAdvice)
├── mapper                # Model-to-DTO mappers
├── repository            # Spring Data MongoDB Repositories
├── scheduler             # Spring @Scheduled background jobs for email digests and alerts
├── security              # Spring Security filter chain, JWT token provider, user details
├── service               # Business logic, rule engine, email dispatcher
└── util                  # Weather WMO code and AQI threshold utilities
```

---

## 🚀 Tech Stack

- **Framework**: Spring Boot 4.1.0 (Java 21)
- **Database**: MongoDB (Spring Data MongoDB)
- **Security**: Spring Security + Stateless JWT Authentication
- **Caching**: Spring Cache with Caffeine in-memory store
- **External Integration**: Open-Meteo Weather, Geocoding, and Air Quality APIs
- **Email & Scheduling**: JavaMailSender + Spring `@Scheduled`
- **Documentation**: Springdoc OpenAPI / Swagger UI
- **Build Tool**: Maven

---

## 🛠️ Environment Configuration & Setup

Copy `.env.example` or configure environment variables in your runtime environment:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/weatheriq
MONGODB_DATABASE=weatheriq

# JWT Security
JWT_SECRET=YourSuperSecretKeyForJWTTokenSigningMustBeAtLeast256Bits
JWT_EXPIRATION=86400000

# Mail / SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
MAIL_FROM=noreply@weatheriq.com

# Open-Meteo Integration Endpoints
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1/forecast
OPEN_METEO_GEOCODING_URL=https://geocoding-api.open-meteo.com/v1/search
OPEN_METEO_AIR_QUALITY_URL=https://air-quality-api.open-meteo.com/v1/air-quality

# Frontend CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 💻 How to Build and Run

1. **Compile & Test**:
   ```bash
   ./mvnw clean test
   ```

2. **Run Application**:
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Access Interactive Swagger Documentation**:
   Open browser at `http://localhost:8080/swagger-ui.html` or view raw OpenAPI specification at `http://localhost:8080/v3/api-docs`.

---

## 📡 REST API Endpoint Summary

### 1. Health & Admin
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Check application health status | No |
| `GET` | `/api/admin/dashboard` | Get platform analytics and user counts | Yes (`ROLE_ADMIN`) |

### 2. Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & get JWT | No |
| `POST` | `/api/auth/verify-email` | Verify email address via token | No |
| `POST` | `/api/auth/resend-verification` | Resend email verification code | No |
| `POST` | `/api/auth/forgot-password` | Request password reset token | No |
| `POST` | `/api/auth/reset-password` | Reset password using token | No |

### 3. User Profile & Preferences
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users/me` | Fetch authenticated user profile | Yes |
| `PUT` | `/api/users/me` | Update user profile (Name) | Yes |
| `PUT` | `/api/users/preferences` | Update units, notifications, default city | Yes |

### 4. Weather & Location Data (Open-Meteo Integration)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/locations/search?name=Delhi` | City geocoding search | No |
| `GET` | `/api/weather/current?latitude=..&longitude=..` | Real-time weather conditions | No |
| `GET` | `/api/weather/hourly?latitude=..&longitude=..` | 24-Hour hourly forecast timeline | No |
| `GET` | `/api/weather/forecast?latitude=..&longitude=..` | 7–10 Day daily forecast | No |
| `GET` | `/api/air-quality?latitude=..&longitude=..` | AQI and pollutant concentrations | No |
| `GET` | `/api/weather/intelligence?latitude=..&longitude=..` | Weather Intelligence insights | No |

### 5. Saved Cities
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/cities` | List user's saved cities | Yes |
| `POST` | `/api/cities` | Save a new city | Yes |
| `PUT` | `/api/cities/{id}/default` | Set city as default location | Yes |
| `DELETE` | `/api/cities/{id}` | Remove saved city | Yes |

### 6. Weather Subscriptions & Scheduled Email Jobs
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/weather-subscriptions` | List scheduled subscriptions | Yes |
| `POST` | `/api/weather-subscriptions` | Create subscription (HOURLY, DAILY...) | Yes |
| `PUT` | `/api/weather-subscriptions/{id}` | Update subscription frequency/metrics | Yes |
| `DELETE` | `/api/weather-subscriptions/{id}` | Remove subscription | Yes |

### 7. Smart Alerts, Travel Mode & History
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/alerts` | List configured weather alerts | Yes |
| `POST` | `/api/alerts` | Add alert rule (HEAT, RAIN, AQI...) | Yes |
| `PUT` | `/api/alerts/{id}` | Update alert rule | Yes |
| `DELETE` | `/api/alerts/{id}` | Delete alert rule | Yes |
| `GET` | `/api/travel/weather?destination=..&latitude=..&longitude=..` | Travel weather suitability | No |
| `GET` | `/api/weather-history?city=..` | Filter historical observations | Yes |

---

## 🔒 Production Deployment & Security Configuration

### Required Environment Variables
Configure the following environment variables in your IDE or deployment environment:

| Variable Name | Description / Example | Default / Local Fallback |
|---|---|---|
| `MONGODB_URI` | Connection URI (Local or MongoDB Atlas) | `mongodb://localhost:27017/weatheriq` |
| `MONGODB_DATABASE` | Target Database Name | `weatheriq` |
| `JWT_SECRET` | Strong 256-bit+ secret key for JWT signing | *Mandatory in Production* |
| `JWT_EXPIRATION` | Token expiration in ms | `86400000` (24 Hours) |
| `SMTP_HOST` | Mail host address | `smtp.gmail.com` |
| `SMTP_PORT` | Mail host port | `587` |
| `SMTP_USERNAME` | SMTP account email address | *Required for email sending* |
| `SMTP_PASSWORD` | SMTP password / Gmail App Password | *Required for email sending* |
| `MAIL_FROM` | Sender address | *Required for email sending* |
| `FRONTEND_URL` | Frontend application web URL | `http://localhost:5173` |
| `CORS_ALLOWED_ORIGINS` | Permitted origins for CORS | `http://localhost:5173,http://localhost:3000` |
| `VITE_API_BASE_URL` | Frontend API Base URL | `http://localhost:8080/api` |

### IntelliJ IDEA Local Setup
To run the backend locally in IntelliJ IDEA with environment variables:
1. Open **Run/Debug Configurations** -> select `WeatheriqApplication`.
2. Under **Environment variables**, click the edit icon and add key-value pairs (e.g., `JWT_SECRET=your_local_secret;SMTP_USERNAME=you@gmail.com;SMTP_PASSWORD=your_app_password`).

### Render Production Architecture
- **Backend**: Spring Boot Docker Web Service using root `./Dockerfile`, port `8080`. Connects to MongoDB Atlas via `MONGODB_URI` environment variable.
- **Frontend**: React + Vite Static Site with root directory `frontend`, build command `npm install && npm run build`, publish directory `dist`. Set `VITE_API_BASE_URL` to your Render backend URL.

