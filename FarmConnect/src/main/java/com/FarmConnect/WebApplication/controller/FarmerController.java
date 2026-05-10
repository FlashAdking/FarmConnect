package com.FarmConnect.WebApplication.controller;



import com.FarmConnect.WebApplication.model.ConfirmedDeals;
import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.service.CropService;
import com.FarmConnect.WebApplication.service.DealsService;
import com.FarmConnect.WebApplication.service.FarmerService;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
public class FarmerController {

    @Autowired
    FarmerService farmerService;

    @Autowired
    CropService cropService;

    @Autowired
    DealsService dealsService;

    // Register a new farmer
    @PostMapping("/Signupfarmer")
    public ResponseEntity<?> registerFarmer(@Valid @RequestBody Farmer farmer) {
        try {
            if (farmer.getFarmerImage() == null || farmer.getFarmerImage().length == 0) {
                InputStream is = getClass().getResourceAsStream("/static/img/default-farmer.jpg");
                if (is != null) {
                    byte[] defaultImage = IOUtils.toByteArray(is);
                    farmer.setFarmerImage(defaultImage);
                    farmer.setImageName("default-farmer.jpg");
                    farmer.setImageType("image/jpeg");
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Default image not found."));
                }
            }
            farmerService.RegisterFarmer(farmer);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error loading default image."));
        }
    }

    // Login farmer
    @PostMapping("/farmerlogin")
    public ResponseEntity<?> loginFarmer(@RequestBody Farmer farmer) {
        try {
            return farmerService.verify(farmer, "ROLE_FARMER");
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Get current farmer profile (used by frontend JS: fetch('/api/farmer/profile'))
    @GetMapping("/api/farmer/profile")
    public ResponseEntity<Farmer> getFarmerProfile(@RequestHeader("Authorization") String token) {
        Optional<Farmer> farmerOpt = farmerService.findByToken(token);
        return farmerOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    // Update farmer profile
    @PutMapping("/api/farmer/update")
    public ResponseEntity<?> updateFarmer(@RequestBody Farmer updatedFarmer,
                                          @RequestHeader("Authorization") String token) {
        try {
            Optional<Farmer> farmerOpt = farmerService.findByToken(token);
            if (farmerOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }

            Farmer existingFarmer = farmerOpt.get();
            existingFarmer.setFullName(updatedFarmer.getFullName());
            existingFarmer.setEmailOrPhone(updatedFarmer.getEmailOrPhone());
            existingFarmer.setAddress(updatedFarmer.getAddress());
            existingFarmer.setState(updatedFarmer.getState());
            existingFarmer.setLandInAcre(updatedFarmer.getLandInAcre());

            farmerService.updateFarmer(existingFarmer);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update profile"));
        }
    }

    // Upload profile image
    @PutMapping(value = "/farmers/{uniqueId}/uploadImage", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfileImage(@PathVariable("uniqueId") String uniqueId,
                                                @RequestParam("image") MultipartFile image) {
        try {
            Farmer farmer = farmerService.getFarmerById(uniqueId);
            if (farmer == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Farmer not found"));
            }

            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No image uploaded"));
            }

            farmer.setFarmerImage(image.getBytes());
            farmer.setImageName(image.getOriginalFilename());
            farmer.setImageType(image.getContentType());

            farmerService.updateFarmer(farmer);
            return ResponseEntity.ok(Map.of("message", "Image uploaded successfully"));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process the image"));
        }
    }

    // Get farmer image
    @GetMapping("/farmers/{uniqueId}/image")
    public ResponseEntity<byte[]> getFarmerImage(@PathVariable("uniqueId") String uniqueId) {
        Optional<Farmer> optionalFarmer = farmerService.findByUniqueId(uniqueId);

        if (optionalFarmer.isPresent()) {
            Farmer farmer = optionalFarmer.get();
            String imageType = farmer.getImageType();
            if (imageType == null || imageType.isEmpty()) {
                imageType = "image/jpeg";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(imageType))
                    .body(farmer.getFarmerImage());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get all farmers
    @GetMapping("/farmers")
    public String getFarmerPage(Model model){

        List<Farmer> farmer = farmerService.getAllFarmers();

        model.addAttribute("farmers",farmer);
        return "Farmers";
    }

    @GetMapping("/api/farmers")
    @ResponseBody
    public List<Farmer> getFarmers() {
        return farmerService.getAllFarmers();
    }

    // Get farmer by ID
    @GetMapping("/api/farmer/farmers/{uniqueId}")
    public ResponseEntity<Farmer> getFarmerById(@PathVariable String uniqueId) {
        Optional<Farmer> farmer = farmerService.findByUniqueId(uniqueId);
        return farmer.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get crops of logged-in farmer
    @GetMapping("/api/farmer/crops")
    public ResponseEntity<List<Crops>> getCropsByFarmer(@RequestHeader("Authorization") String token) {
        Optional<Farmer> farmerOpt = farmerService.findByToken(token);
        if (farmerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Crops> crops = cropService.getCropsByfarmer(farmerOpt.get().getUniqueId());
        return ResponseEntity.ok(crops);
    }

    // Get confirmed deals for the farmer
    @GetMapping("/api/farmer/deals")
    public ResponseEntity<List<ConfirmedDeals>> getConfirmedDeals(@RequestHeader("Authorization") String token) {
        Optional<Farmer> farmerOpt = farmerService.findByToken(token);
        if (farmerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<ConfirmedDeals> deals = dealsService.getDealsByFarmer(farmerOpt.get().getUniqueId());
        return ResponseEntity.ok(deals);
    }



    @GetMapping("/api/crops/{cropId}")
    public ResponseEntity<Crops> getCropById(@PathVariable String cropId) {
        System.out.println("Backend received cropId: " + cropId); // Add this line
        Optional<Crops> cropOpt = cropService.getById(cropId);
        return cropOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }


}