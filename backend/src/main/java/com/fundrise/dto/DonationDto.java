package com.fundrise.dto;

import com.fundrise.model.DonationStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DonationDto {

    @Getter @Setter
    public static class CreateRequest {
        @NotNull(message = "Campaign ID is required")
        private Long campaignId;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "1.00", message = "Donation amount must be at least $1")
        @DecimalMax(value = "1000000.00", message = "Donation amount cannot exceed $1,000,000")
        private BigDecimal amount;

        private String message;
        private boolean anonymous;
        private String donorName;
        private String donorEmail;
    }

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class PaymentIntentResponse {
        private String clientSecret;
        private String paymentIntentId;
        private BigDecimal amount;
        private String currency;
    }

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class Response {
        private Long id;
        private BigDecimal amount;
        private String message;
        private boolean anonymous;
        private String donorName;
        private DonationStatus status;
        private LocalDateTime createdAt;
        private Long campaignId;
        private String campaignTitle;
    }
}
