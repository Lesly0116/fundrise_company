package com.fundrise.service;

import com.fundrise.dto.DonationDto;
import com.fundrise.exception.BadRequestException;
import com.fundrise.model.*;
import com.fundrise.repository.CampaignRepository;
import com.fundrise.repository.DonationRepository;
import com.fundrise.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    private final DonationRepository donationRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;

    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    @Value("${stripe.webhook.secret:}")
    private String webhookSecret;

    // FIX: replaced @PostConstruct (which runs even with placeholder keys and
    // silently sets Stripe.apiKey to "sk_test_your_stripe_secret_key") with a
    // lazy isConfigured() check. The API key is now only applied at the moment
    // a real call is about to be made, after verifying the key looks genuine.
    private boolean isConfigured() {
        return stripeSecretKey != null
                && !stripeSecretKey.isEmpty()
                && !stripeSecretKey.equals("sk_test_your_stripe_secret_key")
                && (stripeSecretKey.startsWith("sk_test_") || stripeSecretKey.startsWith("sk_live_"));
    }

    @Transactional
    public DonationDto.PaymentIntentResponse createPaymentIntent(DonationDto.CreateRequest request,
            String userEmail) {
        // FIX: surface a clear 400 when Stripe isn't configured instead of
        // getting a cryptic Stripe SDK authentication error wrapped in a 500.
        if (!isConfigured()) {
            throw new BadRequestException(
                    "Payment processing is not configured. Please contact the site administrator.");
        }

        Campaign campaign = campaignRepository.findById(request.getCampaignId())
                .orElseThrow(() -> new BadRequestException("Campaign not found"));

        if (campaign.getStatus() != CampaignStatus.ACTIVE) {
            throw new BadRequestException("This campaign is not accepting donations");
        }

        long amountInCents = request.getAmount().multiply(BigDecimal.valueOf(100)).longValue();

        Map<String, String> metadata = new HashMap<>();
        metadata.put("campaignId", campaign.getId().toString());
        metadata.put("campaignTitle", campaign.getTitle());
        metadata.put("donorEmail", request.getDonorEmail() != null ? request.getDonorEmail() : userEmail);
        metadata.put("anonymous", String.valueOf(request.isAnonymous()));
        if (request.getMessage() != null)
            metadata.put("message", request.getMessage());
        if (request.getDonorName() != null)
            metadata.put("donorName", request.getDonorName());

        try {
            // FIX: set the API key immediately before each call (thread-safe, idempotent)
            Stripe.apiKey = stripeSecretKey;

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("usd")
                    .setDescription("Donation to: " + campaign.getTitle())
                    .putAllMetadata(metadata)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build())
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            User donor = userEmail != null ? userRepository.findByEmail(userEmail).orElse(null) : null;
            Donation donation = Donation.builder()
                    .amount(request.getAmount())
                    .message(request.getMessage())
                    .anonymous(request.isAnonymous())
                    .campaign(campaign)
                    .donor(donor)
                    .stripePaymentIntentId(paymentIntent.getId())
                    .status(DonationStatus.PENDING)
                    .donorName(request.isAnonymous() ? "Anonymous" : request.getDonorName())
                    .donorEmail(request.getDonorEmail() != null ? request.getDonorEmail() : userEmail)
                    .build();

            donationRepository.save(donation);
            log.info("Payment intent created: {} for campaign: {}", paymentIntent.getId(), campaign.getId());

            return DonationDto.PaymentIntentResponse.builder()
                    .clientSecret(paymentIntent.getClientSecret())
                    .paymentIntentId(paymentIntent.getId())
                    .amount(request.getAmount())
                    .currency("usd")
                    .build();

        } catch (StripeException e) {
            log.error("Stripe error creating payment intent: {}", e.getMessage());
            throw new BadRequestException("Payment processing error: " + e.getMessage());
        }
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        if (webhookSecret == null || webhookSecret.isEmpty()
                || webhookSecret.equals("whsec_your_webhook_secret")) {
            log.warn("Stripe webhook secret not configured — skipping signature verification");
            return;
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            throw new BadRequestException("Invalid webhook signature");
        }

        log.info("Processing Stripe webhook event: {}", event.getType());

        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentFailed(event);
            default -> log.info("Unhandled Stripe event type: {}", event.getType());
        }
    }

    private void handlePaymentSucceeded(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject().orElse(null);
        if (paymentIntent == null)
            return;

        Optional<Donation> donationOpt = donationRepository.findByStripePaymentIntentId(paymentIntent.getId());
        if (donationOpt.isEmpty()) {
            log.warn("No donation found for payment intent: {}", paymentIntent.getId());
            return;
        }

        Donation donation = donationOpt.get();
        donation.setStatus(DonationStatus.COMPLETED);
        donationRepository.save(donation);

        Campaign campaign = donation.getCampaign();
        campaign.setRaisedAmount(campaign.getRaisedAmount().add(donation.getAmount()));

        if (campaign.getRaisedAmount().compareTo(campaign.getGoalAmount()) >= 0) {
            campaign.setStatus(CampaignStatus.COMPLETED);
            log.info("Campaign {} reached its goal!", campaign.getId());
        }

        campaignRepository.save(campaign);
        log.info("Donation {} confirmed for campaign {}, amount: ${}",
                donation.getId(), campaign.getId(), donation.getAmount());
    }

    private void handlePaymentFailed(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject().orElse(null);
        if (paymentIntent == null)
            return;

        donationRepository.findByStripePaymentIntentId(paymentIntent.getId()).ifPresent(donation -> {
            donation.setStatus(DonationStatus.FAILED);
            donationRepository.save(donation);
            log.info("Donation {} marked as failed", donation.getId());
        });
    }
}
