package com.fundrise.dto;

import com.fundrise.model.CampaignStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CampaignDto {

    @Getter @Setter
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
        private String title;

        @NotBlank(message = "Description is required")
        @Size(min = 20, message = "Description must be at least 20 characters")
        private String description;

        @NotNull(message = "Goal amount is required")
        @DecimalMin(value = "1.00", message = "Goal amount must be at least $1")
        private BigDecimal goalAmount;

        private String category;
        private String location;
        private LocalDateTime endDate;
    }

    @Getter @Setter
    public static class UpdateRequest {
        @Size(min = 5, max = 200)
        private String title;

        @Size(min = 20)
        private String description;

        @DecimalMin(value = "1.00")
        private BigDecimal goalAmount;

        private String category;
        private String location;
        private LocalDateTime endDate;
        private CampaignStatus status;
    }

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private BigDecimal goalAmount;
        private BigDecimal raisedAmount;
        private String imageUrl;
        private CampaignStatus status;
        private String category;
        private String location;
        private LocalDateTime endDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private OrganizerInfo organizer;
        private int donorCount;
        private double progressPercentage;

        @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
        public static class OrganizerInfo {
            private Long id;
            private String fullName;
            private String profileImageUrl;
        }
    }

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class Summary {
        private Long id;
        private String title;
        private BigDecimal goalAmount;
        private BigDecimal raisedAmount;
        private String imageUrl;
        private CampaignStatus status;
        private String category;
        private String location;
        private LocalDateTime createdAt;
        private int donorCount;
        private double progressPercentage;
        private String organizerName;
    }
}
