package com.medicare.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS configuration for the React (Vite) frontend.
 * Allowed origins can be tuned with MEDICARE_CORS_ORIGINS (comma separated).
 */
@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        String origins = System.getenv("MEDICARE_CORS_ORIGINS");
        String[] originList = (origins == null || origins.isBlank())
                ? new String[]{"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"}
                : origins.split(",");

        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(originList)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("X-User-Id", "X-User-Role")
                        .maxAge(3600);
            }
        };
    }
}
