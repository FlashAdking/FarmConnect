package com.FarmConnect.WebApplication.service;


import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.repository.FarmersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class FarmerService {

    @Autowired
    FarmersRepo farmRepo;

    @Autowired
    AuthenticationManager authmanager;

    @Autowired
    JWTService jwts;





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


    public ResponseEntity<?> verify(Farmer farmer , String role) {
        try {
            Authentication authentication =
                    authmanager.authenticate(new UsernamePasswordAuthenticationToken(farmer.getEmailOrPhone(), farmer.getPassword()));


            String token = jwts.generateToken(farmer.getEmailOrPhone() , role);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            System.out.println(token);
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid Credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (AuthenticationException e) {

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    public Optional<Farmer> findByUniqueId(String uniqueId) {
        System.out.println();
        return farmRepo.findByUniqueId(uniqueId);
    }
}
