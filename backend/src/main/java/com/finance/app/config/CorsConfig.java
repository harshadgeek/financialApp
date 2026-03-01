package com.finance.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow any localhost port (Vite picks a dynamic one each run).
        // setAllowedOriginPatterns supports wildcards and is compatible
        // with allowCredentials=true, unlike addAllowedOrigin("*").
        config.setAllowedOriginPatterns(List.of("http://localhost:*"));

        // Credentials (Authorization header / cookies) must be sent.
        config.setAllowCredentials(true);

        // Allow all standard request headers (including Authorization).
        config.setAllowedHeaders(List.of("*"));

        // Allow all HTTP methods.
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Cache preflight response for 1 hour to reduce OPTIONS requests.
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        // Apply to every path — Spring Security's Customizer.withDefaults()
        // delegates to this bean, so a single "/**" mapping covers the whole app
        // (including /api/**, /uploads/**, and any future endpoints).
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
