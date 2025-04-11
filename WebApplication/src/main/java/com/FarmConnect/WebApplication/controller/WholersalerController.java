package com.FarmConnect.WebApplication.controller;

import com.FarmConnect.WebApplication.model.Wholesaler;
import com.FarmConnect.WebApplication.service.WholesalerService;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

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
            return wholeService.Check(wholesaler);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

}
