package com.fundrise.controller;

import com.fundrise.dto.ApiResponse;
import com.fundrise.dto.CampaignDto;
import com.fundrise.dto.UserDto;
import com.fundrise.model.CampaignStatus;
import com.fundrise.repository.CampaignRepository;
import com.fundrise.repository.DonationRepository;
import com.fundrise.repository.UserRepository;
import com.fundrise.service.CampaignService;
import com.fundrise.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final CampaignService campaignService;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final DonationRepository donationRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCampaigns", campaignRepository.countActiveCampaigns());
        stats.put("totalDonations", donationRepository.countByStatus(
                com.fundrise.model.DonationStatus.COMPLETED));
        BigDecimal totalRaised = donationRepository.sumAllCompletedDonations();
        stats.put("totalRaised", totalRaised != null ? totalRaised : BigDecimal.ZERO);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto.AdminResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @PatchMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long userId) {
        userService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.success("User status updated", null));
    }

    @GetMapping("/campaigns")
    public ResponseEntity<ApiResponse<Page<CampaignDto.Summary>>> getAllCampaigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CampaignDto.Summary> campaigns = campaignRepository
                .findByStatusOrderByCreatedAtDesc(CampaignStatus.ACTIVE, pageable)
                .map(campaignService::toSummary);
        return ResponseEntity.ok(ApiResponse.success(campaigns));
    }

    @DeleteMapping("/campaigns/{campaignId}")
    public ResponseEntity<ApiResponse<Void>> deleteCampaign(
            @PathVariable Long campaignId,
            @AuthenticationPrincipal UserDetails userDetails) {
        campaignService.deleteCampaign(campaignId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Campaign deleted by admin", null));
    }
}
