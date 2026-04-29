package com.fundrise.config;

import com.fundrise.model.User;
import com.fundrise.model.Role;
import com.fundrise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    @Bean
    CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {

            String adminEmail = "admin@fundrise.com";

            if (!userRepository.existsByEmail(adminEmail)) {

                User admin = new User();
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("FundRise444!")); // change si tu veux
                admin.setRole(Role.ADMIN);

                userRepository.save(admin);

                System.out.println("ADMIN CREATED: " + adminEmail);
            }
        };
    
    }
}
