package com.FarmConnect.WebApplication.controller;

import com.FarmConnect.WebApplication.model.ConfirmedDeals;
import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.model.Wholesaler;
import com.FarmConnect.WebApplication.repository.CropsRepo;
import com.FarmConnect.WebApplication.repository.FarmersRepo;
import com.FarmConnect.WebApplication.repository.WholeSalerRepo;
import com.FarmConnect.WebApplication.service.DealsService;
import com.FarmConnect.WebApplication.service.JWTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
public class DealsController {

    @Autowired
    DealsService dealsService;

    @Autowired
    CropsRepo cropsRepo;

    @Autowired
    JWTService jwtService;

    @Autowired
    WholeSalerRepo wholeSalerRepo;

    @Autowired
    FarmersRepo farmersRepo;

    @GetMapping("/api/confirm-deals")
    public List<ConfirmedDeals> getDealsByUser(Principal principal) {
        String emailOrPhone = principal.getName();

        // First try to find wholesaler by email
        Optional<Wholesaler> wholesaler = wholeSalerRepo.findByEmail(emailOrPhone);
        if (wholesaler.isPresent()) {
            System.out.println("Wholesaler found by email in deal: " + wholesaler.get().get_id());
            return dealsService.FindUserGetDeals(wholesaler.get().get_id());
        }

        // If not found by email, try to find farmer by email
        Optional<Farmer> farmer = farmersRepo.findByEmailOrPhone(emailOrPhone);
        if (farmer.isPresent()) {
            System.out.println("Farmer found by email in deal: " + farmer.get().getUniqueId());
            return dealsService.FindUserGetDeals(farmer.get().getUniqueId());
        }

        // If still not found, try phone number
        // If no user found, return empty list
        System.out.println("No user found for: " + emailOrPhone);
        return new ArrayList<>();
    }

    @PostMapping("/Deals/save")
    public ResponseEntity<?> createDeal(@RequestBody List<ConfirmedDeals> dealsRequest,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract JWT token
            String token = authHeader.substring(7); // Remove "Bearer " prefix

            // Extract wholesaler email or phone from JWT
            String emailOrPhone = jwtService.extractUserName(token);

            // Find the wholesaler by email or phone
            Wholesaler wholesaler = wholeSalerRepo.findByEmail(emailOrPhone)
                    .orElseThrow(() -> new RuntimeException("Wholesaler not found"));

            // Process each deal
            List<ConfirmedDeals> processedDeals = new ArrayList<>();

            for (ConfirmedDeals deal : dealsRequest) {
                // Set the wholesaler
                deal.setUser(wholesaler);

                // Process crops and set farmer information
                List<Crops> crops = deal.getCrops();
                if (crops != null && !crops.isEmpty()) {
                    // Get the farmerId from the first crop (assuming all crops in one deal are from same farmer)
                    String farmerId = crops.get(0).getFarmerId();

                    // Fetch full farmer object
                    Farmer farmer = farmersRepo.findById(farmerId)
                            .orElseThrow(() -> new RuntimeException("Farmer not found: " + farmerId));
                    deal.setFarmer(farmer);

                    // Ensure we have complete crop objects
                    List<Crops> completeCrops = new ArrayList<>();
                    for (Crops crop : crops) {
                        Crops completeCrop = cropsRepo.findById(crop.getCropId())
                                .orElseThrow(() -> new RuntimeException("Crop not found: " + crop.getCropId()));
                        // Set quantity from request if available
                        if (crop.getQuantity() > 0) {
                            completeCrop.setQuantity(crop.getQuantity());
                        }
                        completeCrops.add(completeCrop);
                    }
                    deal.setCrops(completeCrops);
                }

                // Generate ID if not present
                if (deal.getDealId() == null) {
                    deal.setDealId(UUID.randomUUID().toString());
                }

                // Set order date if not provided
                if (deal.getOrderDate() == null) {
                    deal.setOrderDate(new Date());
                }

                processedDeals.add(deal);
            }

            List<ConfirmedDeals> savedDeals = dealsService.saveDeal(processedDeals);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Deals successfully saved");
            response.put("data", savedDeals);

            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to create deal: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
}
