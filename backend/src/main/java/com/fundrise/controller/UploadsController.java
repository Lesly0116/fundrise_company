package com.fundrise.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

/**
 * Serves locally-stored upload files at /api/uploads/{folder}/{filename}.
 * This endpoint is marked permitAll in SecurityConfig so no auth is needed.
 * Only active when Cloudinary is not configured; with real Cloudinary credentials
 * images are served directly from the Cloudinary CDN and this controller is unused.
 */
@RestController
@RequestMapping("/api/uploads")
@Slf4j
public class UploadsController {

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    // Map MIME types by extension so Content-Type is set correctly
    private static final Map<String, MediaType> MEDIA_TYPES = Map.of(
            "jpg",  MediaType.IMAGE_JPEG,
            "jpeg", MediaType.IMAGE_JPEG,
            "png",  MediaType.IMAGE_PNG,
            "gif",  MediaType.IMAGE_GIF,
            "webp", MediaType.parseMediaType("image/webp")
    );

    @GetMapping("/{folder}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String folder,
            @PathVariable String filename) {

        try {
            // Prevent path traversal
            String safeName = Paths.get(filename).getFileName().toString();
            String safeFolder = Paths.get(folder).getFileName().toString();

            Path filePath = Paths.get(uploadsDir)
                    .toAbsolutePath().normalize()
                    .resolve(safeFolder)
                    .resolve(safeName)
                    .normalize();

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                log.warn("File not found or unreadable: {}", filePath);
                return ResponseEntity.notFound().build();
            }

            String ext = safeName.contains(".")
                    ? safeName.substring(safeName.lastIndexOf('.') + 1).toLowerCase()
                    : "jpg";
            MediaType mediaType = MEDIA_TYPES.getOrDefault(ext, MediaType.IMAGE_JPEG);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000") // 1 year cache
                    .body(resource);

        } catch (MalformedURLException e) {
            log.error("Malformed URL for file: {}/{}", folder, filename);
            return ResponseEntity.badRequest().build();
        }
    }
}
