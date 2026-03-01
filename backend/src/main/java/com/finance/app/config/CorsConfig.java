package com.finance.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://localhost:5174");
        config.addAllowedOrigin("http://localhost:5175");
        config.addAllowedOrigin("http://localhost:5176");
        config.addAllowedOrigin("http://localhost:5177");
        config.addAllowedOrigin("http://localhost:5178");
        config.addAllowedOrigin("http://localhost:5179");
        config.addAllowedOrigin("http://localhost:5180");
        config.addAllowedOrigin("http://localhost:5181");
        config.addAllowedOrigin("http://localhost:5182");
        config.addAllowedOrigin("http://localhost:3083");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/h2-console/**", config);

        return source;
    }
}
