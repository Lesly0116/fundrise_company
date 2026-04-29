package com.fundrise.service;

import com.fundrise.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Fallback image storage used when Cloudinary credentials are not configured.
 * Files are saved under the directory specified by app.uploads.dir (default:
 * ./uploads) and served publicly via UploadsController at /api/uploads/{folder}/{filename}.
 *
 * In production with Cloudinary configured, this service is never called.
 */
@Service
@Slf4j
public class LocalStorageService {

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    @Value("${app.uploads.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final List<String> ALLOWED_TYPES =
            Arrays.asList("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private static final List<String> EXTENSION_MAP = List.of(); // resolved per content-type

    /**
     * Save the file and return a fully-qualified URL that the frontend can use directly.
     */
    public String saveImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 10 MB limit");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
        }

        try {
            // Resolve storage directory: <uploadsDir>/<folder>/
            Path dir = Paths.get(uploadsDir, folder).toAbsolutePath().normalize();
            Files.createDirectories(dir);

            String ext = extensionFor(file.getContentType());
            String filename = UUID.randomUUID() + ext;
            Path dest = dir.resolve(filename);
            file.transferTo(dest);

            // Return URL the browser can fetch: /api/uploads/<folder>/<filename>
            String url = baseUrl + "/api/uploads/" + folder + "/" + filename;
            log.info("Image saved locally: {}", dest);
            log.info("Serving at: {}", url);
            return url;

        } catch (IOException e) {
            log.error("Failed to save image locally: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to save image: " + e.getMessage());
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png"  -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif"  -> ".gif";
            default           -> ".jpg";
        };
    }
}
