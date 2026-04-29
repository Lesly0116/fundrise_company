package com.fundrise.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fundrise.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Handles image uploads.
 *
 * When Cloudinary credentials are present: uploads to Cloudinary CDN and returns
 * a secure_url (https://res.cloudinary.com/...).
 *
 * When Cloudinary is NOT configured (local dev / CI): delegates to
 * LocalStorageService which saves the file to disk and returns a URL of the
 * form http://localhost:8080/api/uploads/{folder}/{filename}, served by
 * UploadsController. This means images display correctly in development
 * without any external account needed.
 */
@Service
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final boolean configured;
    private final LocalStorageService localStorageService;

    private static final List<String> ALLOWED_TYPES =
            Arrays.asList("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}")    String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret,
            LocalStorageService localStorageService) {

        this.localStorageService = localStorageService;

        boolean hasCredentials = !cloudName.isEmpty()
                && !cloudName.equals("your_cloud_name")
                && !apiKey.isEmpty()
                && !apiKey.equals("your_api_key")
                && !apiSecret.isEmpty()
                && !apiSecret.equals("your_api_secret");

        this.configured = hasCredentials;

        if (hasCredentials) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key",    apiKey,
                    "api_secret", apiSecret,
                    "secure",     true
            ));
            log.info("CloudinaryService: using Cloudinary CDN (cloud: {})", cloudName);
        } else {
            this.cloudinary = null;
            log.info("CloudinaryService: Cloudinary not configured — using local file storage fallback.");
        }
    }

    /**
     * Upload an image and return a publicly accessible URL.
     * Falls back to local disk storage when Cloudinary is unconfigured.
     * Returns null only when file is null/empty (callers skip setImageUrl in that case).
     */
    public String uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        if (!configured) {
            // Fallback: save to local disk and return a local URL
            return localStorageService.saveImage(file, folder);
        }

        validateFile(file);

        try {
            String publicId = folder + "/" + UUID.randomUUID();
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id",      publicId,
                            "folder",         "fundrise/" + folder,
                            "transformation", "f_auto,q_auto,w_1200",
                            "resource_type",  "image"
                    )
            );
            String url = (String) result.get("secure_url");
            log.info("Image uploaded to Cloudinary: {}", url);
            return url;

        } catch (IOException e) {
            log.error("Cloudinary upload failed: {}", e.getMessage(), e);
            throw new BadRequestException(
                    "Failed to upload image. Please try again or continue without an image.");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 10 MB limit");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
        }
    }

    public boolean isConfigured() {
        return configured;
    }
}
