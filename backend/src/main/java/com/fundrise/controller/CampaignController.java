package com.fundrise.controller;

import com.fundrise.dto.ApiResponse;
import com.fundrise.dto.CampaignDto;
import com.fundrise.service.CampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CampaignDto.Summary>>> getAllCampaigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sortBy) {
        return ResponseEntity.ok(ApiResponse.success(
                campaignService.getAllCampaigns(page, size, sortBy)));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<CampaignDto.Summary>>> getFeaturedCampaigns() {
        return ResponseEntity.ok(ApiResponse.success(campaignService.getFeaturedCampaigns()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CampaignDto.Summary>>> searchCampaigns(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                campaignService.searchCampaigns(q, page, size)));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Page<CampaignDto.Summary>>> getCampaignsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                campaignService.getCampaignsByCategory(category, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CampaignDto.Response>> getCampaignById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(campaignService.getCampaignById(id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CampaignDto.Response>> createCampaign(
            @Valid @RequestPart("campaign") CampaignDto.CreateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails) {
        CampaignDto.Response response = campaignService.createCampaign(
                request, image, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Campaign created successfully", response));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CampaignDto.Response>> updateCampaign(
            @PathVariable Long id,
            @RequestPart("campaign") CampaignDto.UpdateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails) {
        CampaignDto.Response response = campaignService.updateCampaign(
                id, request, image, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Campaign updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        campaignService.deleteCampaign(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Campaign deleted successfully", null));
    }

    @GetMapping("/my-campaigns")
    public ResponseEntity<ApiResponse<Page<CampaignDto.Summary>>> getMyCampaigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                campaignService.getMyCampaigns(userDetails.getUsername(), page, size)));
    }
}
