package com.FarmConnect.WebApplication.service;


import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.repository.FarmersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;

@Service
public class FarmerService {

    @Autowired
    FarmersRepo farmRepo;


    @GetMapping("/Farmers/{uniquId}/image")
    public ResponseEntity<byte[]> getCropImage(@PathVariable String uniqueId) {
        System.out.println("Attempting to fetch crop with ID: " + uniqueId);
        Optional<Farmer> optionalFarmer = farmRepo.findByUniqueId(uniqueId);

        if (optionalFarmer.isPresent()) {
            Farmer farmer = optionalFarmer.get();
            System.out.println("Found Farmer: " + farmer.getFullName() + ", Serving image.");
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(farmer.getImageType()))
                    .body(farmer.getFarmerImage());
        } else {
            System.out.println("Farmer not found for ID: " + uniqueId);
            return ResponseEntity.notFound().build();
        }
    }


    public List<Farmer> getAllFarmers() {
        return farmRepo.findAll();
    }

    public Farmer getFarmerById(String id) {
        return farmRepo.getByUniqueId(id);
    }

    public void updateFarmer(Farmer farmer) {
        farmRepo.save(farmer);
    }


    public void RegisterFarmer(Farmer farmer) {
        Optional<Farmer> existingFarmer = farmRepo.findByEmailOrPhone(farmer.getEmailOrPhone());
        if (existingFarmer.isPresent()) {
            throw new IllegalArgumentException("User with the given email or phone already exists.");
        }
        farmRepo.save(farmer);
    }
}
