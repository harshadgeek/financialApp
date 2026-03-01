package com.finance.app.service;

import org.springframework.stereotype.Service;

/**
 * Data seeding is handled by src/main/resources/data.sql
 * which Spring Boot auto-runs after JPA schema creation
 * when spring.jpa.defer-datasource-initialization=true.
 */
@Service
public class DataSeederService {
    // No-op: seeding is done via data.sql
}
