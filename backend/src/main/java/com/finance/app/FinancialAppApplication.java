package com.finance.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FinancialAppApplication {
    public static void main(String[] args) {
        org.springframework.context.ApplicationContext context = SpringApplication.run(FinancialAppApplication.class, args);
        String port = context.getEnvironment().getProperty("local.server.port");
        System.out.println("BACKEND_DYNAMIC_PORT=" + port);
    }
}
