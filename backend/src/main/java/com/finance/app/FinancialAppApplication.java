package com.finance.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@EnableScheduling
@EnableMongoAuditing
public class FinancialAppApplication {
    private static final Logger log = LoggerFactory.getLogger(FinancialAppApplication.class);

    public static void main(String[] args) {
        org.springframework.context.ApplicationContext context = SpringApplication.run(FinancialAppApplication.class, args);
        String port = context.getEnvironment().getProperty("local.server.port");
        log.info("BACKEND_DYNAMIC_PORT={}", port);
    }
}
