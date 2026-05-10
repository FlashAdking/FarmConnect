package com.FarmConnect.WebApplication.controller;

import com.FarmConnect.WebApplication.model.ConfirmedDeals;
import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.model.Wholesaler;
import com.FarmConnect.WebApplication.service.WholesalerService;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.Principal;
import java.util.*;

@Controller
public class WholersalerController {

    @Autowired
    WholesalerService wholeService;

    @PostMapping("/Signupwholesaler")
    public ResponseEntity<?> RegisterWholesaler(@Validated @RequestBody Wholesaler wholesaler){
        try {
            // Since there's no uploading option during signup, we assign the default image
            if (wholesaler.getWholesalerImage() == null || wholesaler.getWholesalerImage().length == 0) {
                InputStream is = getClass().getResourceAsStream("/static/img/WholeSaler.jpeg");
                if (is != null) {
                    byte[] defaultImage = IOUtils.toByteArray(is);
                    wholesaler.setWholesalerImage(defaultImage);
                    wholesaler.setImageName("WholeSaler.jpeg");
                    wholesaler.setImageType("image/jpeg");
                } else {
                    // If the default image is not found, return an error
                    return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Default image not found.");
                }
            }

            wholeService.RegisterWholesaler(wholesaler);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error loading default image.");
        }

    }

    @PostMapping("/wholesalerlogin")
    ResponseEntity<?> getTokenForWholesaler(@RequestBody Wholesaler wholesaler){
        try {
            System.out.println("Received login request for: " + wholesaler);
            return wholeService.Check(wholesaler , "ROLE_WHOLESALER");
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 1. GET wholesaler profile (for /api/wholesaler/profile)
    @GetMapping("/api/wholesaler/profile")
    public ResponseEntity<?> getWholesalerProfile(Principal principal) {
        // Use the principal's name (or other identifier) to locate the wholesaler
        Optional<Wholesaler> optionalWholesaler = wholeService.findByEmail(principal.getName());
        if (!optionalWholesaler.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Wholesaler not found");
        }
        Wholesaler wholesaler = optionalWholesaler.get();
        Map<String, Object> response = new HashMap<>();
        response.put("fullName", wholesaler.getFullName());
        response.put("email", wholesaler.getEmail());
        response.put("phoneNumber", wholesaler.getPhoneNumber());
        response.put("address", wholesaler.getAddress());
        // Example statistics (adjust according to your model implementation)
        response.put("totalPurchases", 50);
        response.put("amountSpent", 152548);
        response.put("farmersConnected", 88);
        response.put("pendingDeals", 55);
        // Convert image bytes to a Base64 string if an image exists
        if (wholesaler.getWholesalerImage() != null) {
            String base64Image = Base64.getEncoder().encodeToString(wholesaler.getWholesalerImage());
            response.put("imageBase64", base64Image);
            response.put("imageType", wholesaler.getImageType());
        }
        return ResponseEntity.ok(response);
    }

    // 2. GET confirmed deals (for /api/wholesaler/confirmed-deals)
    @GetMapping("/api/wholesaler/confirmed-deals")
    public ResponseEntity<?> getConfirmedDeals(Principal principal) {
        Optional<Wholesaler> optionalWholesaler = wholeService.findByEmail(principal.getName());
        if (!optionalWholesaler.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Wholesaler not found");
        }
        Wholesaler wholesaler = optionalWholesaler.get();
        List<ConfirmedDeals> deals = wholesaler.getConfirmedDeals(); // Assuming this list exists in your model
        return ResponseEntity.ok(deals);
    }

    // 3. PUT update wholesaler profile (for /api/wholesaler/update-profile)
    @PutMapping("/api/wholesaler/update-profile")
    public ResponseEntity<?> updateWholesalerProfile(@RequestBody Wholesaler updatedProfile, Principal principal) {
        Optional<Wholesaler> optionalWholesaler = wholeService.findByEmail(principal.getName());
        if (!optionalWholesaler.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Wholesaler not found");
        }
        Wholesaler existingWholesaler = optionalWholesaler.get();
        // Update only the profile information. Adjust the fields as necessary.
        existingWholesaler.setFullName(updatedProfile.getFullName());
        existingWholesaler.setEmail(updatedProfile.getEmail());
        existingWholesaler.setPhoneNumber(updatedProfile.getPhoneNumber());
        existingWholesaler.setAddress(updatedProfile.getAddress());

        // Call your service to update the wholesaler
        wholeService.updateWholesaler(existingWholesaler);
        return ResponseEntity.ok(existingWholesaler);
    }

    // 4. POST update wholesaler image (for /api/wholesaler/upload-image)
    @PostMapping(value = "/api/wholesaler/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateWholesalerImage(@RequestParam("profileImageFile") MultipartFile image, Principal principal) {
        Optional<Wholesaler> optionalWholesaler = wholeService.findByEmail(principal.getName());
        if (!optionalWholesaler.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Wholesaler not found");
        }
        Wholesaler wholesaler = optionalWholesaler.get();

        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().body("Image file is required");
        }

        try {
            wholesaler.setWholesalerImage(image.getBytes());
            wholesaler.setImageName(image.getOriginalFilename());
            wholesaler.setImageType(image.getContentType());
            wholeService.updateWholesaler(wholesaler);
            return ResponseEntity.ok("Wholesaler image updated successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing the image file");
        }
    }

    @GetMapping("/wholesaler/{_id}/image")
    public ResponseEntity<byte[]> getWholesalerImage(@PathVariable("_id") String _id) {
        // Fetch the wholesaler using its unique identifier.
        Optional<Wholesaler> optionalWholesaler = wholeService.getBy_id(_id);

        if (optionalWholesaler.isPresent()) {
            Wholesaler wholesaler = optionalWholesaler.get();
            // Determine the image type, defaulting to "image/jpeg" if not set.
            String imageType = wholesaler.getImageType();
            if (imageType == null || imageType.trim().isEmpty()) {
                imageType = "image/jpeg";
            }
            // Return the image data along with the proper Content-Type header.
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(imageType))
                    .body(wholesaler.getWholesalerImage());
        } else {
            // If no wholesaler is found for the given _id, return a 404 response.
            return ResponseEntity.notFound().build();
        }
    }


}
