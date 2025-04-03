package com.FarmConnect.WebApplication.service;


import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.repository.FarmersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;

@Service
public class FarmerService {

    @Autowired
    FarmersRepo farmRepo;

    @Autowired
    AuthenticationManager authmanager;

    @Autowired
    JWTService jwts;


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

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public void RegisterFarmer(Farmer farmer) {
        Optional<Farmer> existingFarmer = farmRepo.findByEmailOrPhone(farmer.getEmailOrPhone());
        if (existingFarmer.isPresent()) {
            throw new IllegalArgumentException("User with the given email or phone already exists.");
        }
        farmer.setPassword(encoder.encode(farmer.getPassword()) );
        farmRepo.save(farmer);
    }

    public String verify(Farmer farmer , Model model) {
        Authentication authentication =
                authmanager.authenticate(new UsernamePasswordAuthenticationToken(farmer.getEmailOrPhone() , farmer.getPassword()));

        if(authentication.isAuthenticated()){
            String token = jwts.genrateToken(farmer.getEmailOrPhone());
            model.addAttribute("token", token );
            System.out.println(token);
            return "index";

        }

       model.addAttribute("error","Invalid Credentials");
        return "farmerlogin";
    }
}
