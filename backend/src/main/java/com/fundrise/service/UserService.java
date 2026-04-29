package com.fundrise.service;

import com.fundrise.dto.UserDto;
import com.fundrise.exception.ResourceNotFoundException;
import com.fundrise.model.DonationStatus;
import com.fundrise.model.User;
import com.fundrise.repository.DonationRepository;
import com.fundrise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final DonationRepository donationRepository;

    @Transactional(readOnly = true)
    public UserDto.Response getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserDto.Response getProfileById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return toResponse(user);
    }

    @Transactional
    public UserDto.Response updateProfile(String email, UserDto.UpdateProfileRequest request, MultipartFile image) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getBio() != null) user.setBio(request.getBio());

        // FIX: uploadImage returns null when Cloudinary is unconfigured;
        // only update profileImageUrl when a real URL comes back.
        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image, "profiles");
            if (imageUrl != null) {
                user.setProfileImageUrl(imageUrl);
            }
        }

        user = userRepository.save(user);
        log.info("Profile updated for user: {}", email);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto.AdminResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toAdminResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        log.info("User {} status toggled to: {}", userId, user.isEnabled());
    }

    public UserDto.Response toResponse(User u) {
        return UserDto.Response.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .bio(u.getBio())
                .profileImageUrl(u.getProfileImageUrl())
                .role(u.getRole().name())
                .createdAt(u.getCreatedAt())
                .build();
    }

    private UserDto.AdminResponse toAdminResponse(User u) {
        return UserDto.AdminResponse.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .role(u.getRole().name())
                .enabled(u.isEnabled())
                .createdAt(u.getCreatedAt())
                .campaignCount(u.getCampaigns() != null ? u.getCampaigns().size() : 0)
                .donationCount((int) donationRepository.countByDonorAndStatus(u, DonationStatus.COMPLETED))
                .build();
    }
}
