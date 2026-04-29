package com.fundrise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class FundRiseApplication {
    public static void main(String[] args) {
        SpringApplication.run(FundRiseApplication.class, args);
        System.out.println("JWT_SECRET from env: " + System.getenv("JWT_SECRET"));
    }
}
