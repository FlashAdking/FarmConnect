package com.FarmConnect.WebApplication.service;

import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.repository.FarmersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RegistrationService {

    @Autowired
    FarmersRepo farmObj;



    public void RegisterFarmer(Farmer farmer) {
        Optional<Farmer> existingFarmer = farmObj.findByEmailOrPhone(farmer.getEmailOrPhone());
        if (existingFarmer.isPresent()) {
            throw new IllegalArgumentException("User with the given email or phone already exists.");
        }
        farmObj.save(farmer);
    }

}
