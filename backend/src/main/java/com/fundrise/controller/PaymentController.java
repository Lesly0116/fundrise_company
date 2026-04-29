package com.fundrise.controller;

import com.fundrise.dto.ApiResponse;
import com.fundrise.dto.DonationDto;
import com.fundrise.service.DonationService;
import com.fundrise.service.StripeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PaymentController {

    private final StripeService stripeService;
    private final DonationService donationService;

    @PostMapping("/donations/payment-intent")
    public ResponseEntity<ApiResponse<DonationDto.PaymentIntentResponse>> createPaymentIntent(
            @Valid @RequestBody DonationDto.CreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        DonationDto.PaymentIntentResponse response = stripeService.createPaymentIntent(request, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment intent created", response));
    }

    @PostMapping("/stripe/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        stripeService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok("Webhook processed");
    }

    @GetMapping("/campaigns/{campaignId}/donations")
    public ResponseEntity<ApiResponse<Page<DonationDto.Response>>> getCampaignDonations(
            @PathVariable Long campaignId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                donationService.getCampaignDonations(campaignId, page, size)));
    }

    @GetMapping("/donations/my-donations")
    public ResponseEntity<ApiResponse<List<DonationDto.Response>>> getMyDonations(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                donationService.getMyDonations(userDetails.getUsername())));
    }
}
