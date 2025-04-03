package com.FarmConnect.WebApplication.controller;


import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.service.FarmerService;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.BitSet;
import java.util.List;

@Controller
public class FarmerController {

    @Autowired
    FarmerService farmService;


    @PostMapping("/Signupfarmer")
    public ResponseEntity<?> registerFarmer(@Validated @RequestBody Farmer farmer) {
        try {
            // Since there's no uploading option during signup, we assign the default image
            if (farmer.getFarmerImage() == null || farmer.getFarmerImage().length == 0) {
                InputStream is = getClass().getResourceAsStream("/static/img/default-farmer.jpg");
                if (is != null) {
                    byte[] defaultImage = IOUtils.toByteArray(is);
                    farmer.setFarmerImage(defaultImage);
                    farmer.setImageName("default-farmer.jpg");
                    farmer.setImageType("image/jpeg");
                } else {
                    // If the default image is not found, return an error
                    return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Default image not found.");
                }
            }

            farmService.RegisterFarmer(farmer);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error loading default image.");
        }
    }


    @PutMapping(value = "Farmers/{id}/uploadImage", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateFarmerImage(
            @PathVariable("id") String id,
            @RequestParam("image") MultipartFile image) {
        try {
            // Retrieve the existing farmer by unique ID
            Farmer farmer = farmService.getFarmerById(id);
            if (farmer == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Farmer not found");
            }

            // Validate that an image file is provided
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest().body("Image file is required");
            }

            // Set the image details in the farmer object
            farmer.setFarmerImage(image.getBytes());
            farmer.setImageName(image.getOriginalFilename());
            farmer.setImageType(image.getContentType());

            // Update the farmer details in the database
            farmService.updateFarmer(farmer);
            return ResponseEntity.ok("Farmer image updated successfully");

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing the image file");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }


    @GetMapping("/Farmers")
    public String getFarmerPage(Model model){

        List<Farmer> farmer = farmService.getAllFarmers();

        model.addAttribute("farmers",farmer);
        return "Farmers";
    }

    @GetMapping("/api/farmers")
    @ResponseBody
    public List<Farmer> getFarmers() {
        return farmService.getAllFarmers();
    }

    @PostMapping("/farmerlogin")
    public String getLoginDetails(@RequestBody Farmer farmer , Model model){
        System.out.println(farmer);

        return farmService.verify(farmer , model);



    }

}
