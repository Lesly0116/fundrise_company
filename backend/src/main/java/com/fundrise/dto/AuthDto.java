package com.fundrise.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDto {

    @Getter @Setter
    public static class RegisterRequest {
        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
        private String lastName;

        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
                 message = "Password must contain at least one uppercase letter, one lowercase letter, and one digit")
        private String password;
    }

    @Getter @Setter
    public static class LoginRequest {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class AuthResponse {
        private String token;
        private String tokenType = "Bearer";
        private Long userId;
        private String email;
        private String firstName;
        private String lastName;
        private String role;
        private String profileImageUrl;
    }
}
