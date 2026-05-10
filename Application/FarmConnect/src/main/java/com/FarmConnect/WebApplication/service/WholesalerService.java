package com.FarmConnect.WebApplication.service;

import com.FarmConnect.WebApplication.model.Wholesaler;
import com.FarmConnect.WebApplication.repository.WholeSalerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class WholesalerService {

    @Autowired
    WholeSalerRepo wholeRepo;

    @Autowired
    JWTService jwts;

    @Autowired
    AuthenticationManager authmanager;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public void RegisterWholesaler(Wholesaler wholesaler) {
        Optional<Wholesaler> existingWholesaler = wholeRepo.findByEmail(wholesaler.getEmail());
        if (existingWholesaler.isPresent()) {
            throw new IllegalArgumentException("Wholsaler with the given email already exists.");
        }
        wholesaler.setPassword(encoder.encode(wholesaler.getPassword()));

        wholeRepo.save(wholesaler);

    }

    public ResponseEntity<?> Check(Wholesaler wholesaler ,String role) {
        try {
            Authentication authentication =
                    authmanager.authenticate(new UsernamePasswordAuthenticationToken(wholesaler.getEmail(), wholesaler.getPassword()));


            String token = jwts.generateToken(wholesaler.getEmail(), role );
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

    public Wholesaler getByEmailId(String username) {
        // Return the found Wholesaler, or null if not present.
        return wholeRepo.getBy_id(username).orElse(null);
    }


    public Optional<Wholesaler> findByEmail(String id) {
        return wholeRepo.findByEmail(id);
    }

    public void updateWholesaler(Wholesaler wholesaler) {
        wholeRepo.save(wholesaler);
    }

    public Optional<Wholesaler> getBy_id(String id) {
        return wholeRepo.getBy_id(id);
    }
}