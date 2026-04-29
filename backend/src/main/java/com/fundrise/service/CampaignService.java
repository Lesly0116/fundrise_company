package com.fundrise.service;

import com.fundrise.dto.CampaignDto;
import com.fundrise.exception.BadRequestException;
import com.fundrise.exception.ResourceNotFoundException;
import com.fundrise.exception.UnauthorizedException;
import com.fundrise.model.*;
import com.fundrise.repository.CampaignRepository;
import com.fundrise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public CampaignDto.Response createCampaign(CampaignDto.CreateRequest request,
                                                MultipartFile image,
                                                String organizerEmail) {
        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Campaign campaign = Campaign.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .goalAmount(request.getGoalAmount())
                .category(request.getCategory() != null ? request.getCategory() : "General")
                .location(request.getLocation())
                .endDate(request.getEndDate())
                .organizer(organizer)
                .status(CampaignStatus.ACTIVE)
                .build();

        // FIX: uploadImage now returns null when Cloudinary is unconfigured,
        // and throws BadRequestException (400) instead of a raw IOException (500)
        // on a real upload failure — so the campaign always saves cleanly.
        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image, "campaigns");
            if (imageUrl != null) {
                campaign.setImageUrl(imageUrl);
            }
        }

        campaign = campaignRepository.save(campaign);
        log.info("Campaign created: {} by {}", campaign.getId(), organizerEmail);
        return toResponse(campaign);
    }

    @Transactional
    public CampaignDto.Response updateCampaign(Long campaignId,
                                                CampaignDto.UpdateRequest request,
                                                MultipartFile image,
                                                String userEmail) {
        Campaign campaign = getCampaignEntity(campaignId);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!campaign.getOrganizer().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to update this campaign");
        }

        if (request.getTitle() != null) campaign.setTitle(request.getTitle());
        if (request.getDescription() != null) campaign.setDescription(request.getDescription());
        if (request.getGoalAmount() != null) campaign.setGoalAmount(request.getGoalAmount());
        if (request.getCategory() != null) campaign.setCategory(request.getCategory());
        if (request.getLocation() != null) campaign.setLocation(request.getLocation());
        if (request.getEndDate() != null) campaign.setEndDate(request.getEndDate());
        if (request.getStatus() != null) campaign.setStatus(request.getStatus());

        // FIX: same null-safe handling for updates
        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image, "campaigns");
            if (imageUrl != null) {
                campaign.setImageUrl(imageUrl);
            }
        }

        campaign = campaignRepository.save(campaign);
        log.info("Campaign updated: {}", campaignId);
        return toResponse(campaign);
    }

    @Transactional
    public void deleteCampaign(Long campaignId, String userEmail) {
        Campaign campaign = getCampaignEntity(campaignId);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!campaign.getOrganizer().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to delete this campaign");
        }

        campaign.setStatus(CampaignStatus.DELETED);
        campaignRepository.save(campaign);
        log.info("Campaign soft-deleted: {}", campaignId);
    }

    @Transactional(readOnly = true)
    public CampaignDto.Response getCampaignById(Long campaignId) {
        Campaign campaign = getCampaignEntity(campaignId);
        if (campaign.getStatus() == CampaignStatus.DELETED) {
            throw new ResourceNotFoundException("Campaign", campaignId);
        }
        return toResponse(campaign);
    }

    @Transactional(readOnly = true)
    public Page<CampaignDto.Summary> getAllCampaigns(int page, int size, String sortBy) {
        Sort sort = switch (sortBy) {
            case "raised"  -> Sort.by(Sort.Direction.DESC, "raisedAmount");
            case "goal"    -> Sort.by(Sort.Direction.DESC, "goalAmount");
            case "oldest"  -> Sort.by(Sort.Direction.ASC,  "createdAt");
            default        -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
        Pageable pageable = PageRequest.of(page, size, sort);
        return campaignRepository.findByStatusOrderByCreatedAtDesc(CampaignStatus.ACTIVE, pageable)
                .map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<CampaignDto.Summary> searchCampaigns(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return campaignRepository.searchCampaigns(query, CampaignStatus.ACTIVE, pageable)
                .map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<CampaignDto.Summary> getCampaignsByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return campaignRepository.findByCategoryAndStatus(category, CampaignStatus.ACTIVE, pageable)
                .map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<CampaignDto.Summary> getMyCampaigns(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return campaignRepository.findByOrganizerIdAndStatusNot(user.getId(), CampaignStatus.DELETED, pageable)
                .map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public List<CampaignDto.Summary> getFeaturedCampaigns() {
        // FIX: pass explicit PageRequest(0,6) — @Query ignores "Top6" name limit
        return campaignRepository.findFeaturedByStatus(CampaignStatus.ACTIVE, PageRequest.of(0, 6))
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    public Campaign getCampaignEntity(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", id));
    }

    public CampaignDto.Response toResponse(Campaign c) {
        return CampaignDto.Response.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .goalAmount(c.getGoalAmount())
                .raisedAmount(c.getRaisedAmount())
                .imageUrl(c.getImageUrl())
                .status(c.getStatus())
                .category(c.getCategory())
                .location(c.getLocation())
                .endDate(c.getEndDate())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .donorCount(c.getDonorCount())
                .progressPercentage(c.getProgressPercentage())
                .organizer(CampaignDto.Response.OrganizerInfo.builder()
                        .id(c.getOrganizer().getId())
                        .fullName(c.getOrganizer().getFullName())
                        .profileImageUrl(c.getOrganizer().getProfileImageUrl())
                        .build())
                .build();
    }

    public CampaignDto.Summary toSummary(Campaign c) {
        return CampaignDto.Summary.builder()
                .id(c.getId())
                .title(c.getTitle())
                .goalAmount(c.getGoalAmount())
                .raisedAmount(c.getRaisedAmount())
                .imageUrl(c.getImageUrl())
                .status(c.getStatus())
                .category(c.getCategory())
                .location(c.getLocation())
                .createdAt(c.getCreatedAt())
                .donorCount(c.getDonorCount())
                .progressPercentage(c.getProgressPercentage())
                .organizerName(c.getOrganizer().getFullName())
                .build();
    }
}
