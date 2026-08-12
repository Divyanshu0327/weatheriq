package com.weatheriq.config;

import com.weatheriq.document.UserDocument;
import com.weatheriq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.initial-password:Admin@12345}")
    private String adminInitialPassword;

    @Override
    public void run(String... args) {
        log.info("Checking WeatherIQ database seeding status...");

        // 1. Seed Main Administrator: campusinfohub@gmail.com
        userRepository.findByEmail("campusinfohub@gmail.com").ifPresentOrElse(
                admin -> {
                    admin.setPassword(passwordEncoder.encode(adminInitialPassword));
                    admin.setEmailVerified(true);
                    admin.setEnabled(true);
                    admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_USER"));
                    userRepository.save(admin);
                    log.info("Updated administrator credentials: campusinfohub@gmail.com");
                },
                () -> {
                    UserDocument admin1 = UserDocument.builder()
                            .name("Campus InfoHub Administrator")
                            .email("campusinfohub@gmail.com")
                            .password(passwordEncoder.encode(adminInitialPassword))
                            .roles(Set.of("ROLE_ADMIN", "ROLE_USER"))
                            .emailVerified(true)
                            .enabled(true)
                            .defaultCity("Delhi")
                            .temperatureUnit("CELSIUS")
                            .notificationEnabled(true)
                            .emailNotificationsEnabled(true)
                            .build();
                    userRepository.save(admin1);
                    log.info("Seeded administrator account: campusinfohub@gmail.com");
                }
        );

        // 2. Seed System Administrator: chitturaj317@gmail.com
        userRepository.findByEmail("chitturaj317@gmail.com").ifPresentOrElse(
                admin -> {
                    admin.setPassword(passwordEncoder.encode(adminInitialPassword));
                    admin.setEmailVerified(true);
                    admin.setEnabled(true);
                    admin.setRoles(Set.of("ROLE_ADMIN", "ROLE_USER"));
                    userRepository.save(admin);
                    log.info("Updated system administrator credentials: chitturaj317@gmail.com");
                },
                () -> {
                    UserDocument admin2 = UserDocument.builder()
                            .name("System Administrator")
                            .email("chitturaj317@gmail.com")
                            .password(passwordEncoder.encode(adminInitialPassword))
                            .roles(Set.of("ROLE_ADMIN", "ROLE_USER"))
                            .emailVerified(true)
                            .enabled(true)
                            .defaultCity("Delhi")
                            .temperatureUnit("CELSIUS")
                            .notificationEnabled(true)
                            .emailNotificationsEnabled(true)
                            .build();
                    userRepository.save(admin2);
                    log.info("Seeded system administrator account: chitturaj317@gmail.com");
                }
        );

        // 3. Seed Development USER
        if (!userRepository.existsByEmail("user@weatheriq.local")) {
            UserDocument user = UserDocument.builder()
                    .name("Development User")
                    .email("user@weatheriq.local")
                    .password(passwordEncoder.encode("User@12345"))
                    .roles(Set.of("ROLE_USER"))
                    .emailVerified(true)
                    .enabled(true)
                    .defaultCity("Delhi")
                    .temperatureUnit("CELSIUS")
                    .notificationEnabled(true)
                    .emailNotificationsEnabled(true)
                    .build();
            userRepository.save(user);
            log.info("Seeded development account: user@weatheriq.local (Role: USER)");
        }

        // 4. Seed Development ADMIN
        if (!userRepository.existsByEmail("admin@weatheriq.local")) {
            UserDocument admin = UserDocument.builder()
                    .name("Local Admin")
                    .email("admin@weatheriq.local")
                    .password(passwordEncoder.encode("Admin@12345"))
                    .roles(Set.of("ROLE_ADMIN", "ROLE_USER"))
                    .emailVerified(true)
                    .enabled(true)
                    .defaultCity("Delhi")
                    .temperatureUnit("CELSIUS")
                    .notificationEnabled(true)
                    .emailNotificationsEnabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Seeded development account: admin@weatheriq.local (Role: ADMIN)");
        }

        log.info("Database seeding check completed.");
    }
}
