package com.fundrise.service;

import com.fundrise.dto.DonationDto;
import com.fundrise.model.*;
import com.fundrise.repository.DonationRepository;
import com.fundrise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<DonationDto.Response> getCampaignDonations(Long campaignId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return donationRepository.findByCampaignIdAndStatusOrderByCreatedAtDesc(
                campaignId, DonationStatus.COMPLETED, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<DonationDto.Response> getMyDonations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new com.fundrise.exception.ResourceNotFoundException("User not found"));
        return donationRepository.findByDonorAndStatusOrderByCreatedAtDesc(user, DonationStatus.COMPLETED)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private DonationDto.Response toResponse(Donation d) {
        String displayName;
        if (d.isAnonymous()) {
            displayName = "Anonymous";
        } else if (d.getDonorName() != null) {
            displayName = d.getDonorName();
        } else if (d.getDonor() != null) {
            displayName = d.getDonor().getFullName();
        } else {
            displayName = "Anonymous";
        }

        return DonationDto.Response.builder()
                .id(d.getId())
                .amount(d.getAmount())
                .message(d.getMessage())
                .anonymous(d.isAnonymous())
                .donorName(displayName)
                .status(d.getStatus())
                .createdAt(d.getCreatedAt())
                .campaignId(d.getCampaign().getId())
                .campaignTitle(d.getCampaign().getTitle())
                .build();
    }
}
