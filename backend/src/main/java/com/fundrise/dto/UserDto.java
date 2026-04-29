package com.fundrise.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class UserDto {

    @Getter @Setter
    public static class UpdateProfileRequest {
        @Size(min = 2, max = 100)
        private String firstName;

        @Size(min = 2, max = 100)
        private String lastName;

        @Size(max = 500)
        private String bio;
    }

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class Response {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String bio;
        private String profileImageUrl;
        private String role;
        private java.time.LocalDateTime createdAt;
    }

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class AdminResponse {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String role;
        private boolean enabled;
        private java.time.LocalDateTime createdAt;
        private int campaignCount;
        private int donationCount;
    }
}
