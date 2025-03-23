package com.FarmConnect.WebApplication.controller;


import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
public class RegisterAllController {

    @Autowired
    RegistrationService regService;

    @PostMapping("/Signupfarmer")
    public ResponseEntity<?> registerFarmer(@Validated @RequestBody Farmer farmer) {
        try {
            regService.RegisterFarmer(farmer);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }


}
