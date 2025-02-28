package com.FarmConnect.WebApplication.controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;


import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.service.CropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Controller
@CrossOrigin
public class CropsController {

    @Autowired
    CropService cropService;


    @GetMapping("/crops/{id}/image")
    public ResponseEntity<byte[]> getCropImage(@PathVariable String id) {
        System.out.println("Attempting to fetch crop with ID: " + id);
        Optional<Crops> optionalCrop = cropService.getById(id);
        if (optionalCrop.isPresent()) {
            Crops crop = optionalCrop.get();
            System.out.println("Found crop: " + crop.getName() + ", Serving image.");
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(crop.getImageType()))
                    .body(crop.getImageData());
        } else {
            System.out.println("Crop not found for ID: " + id);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/crops")
    public String getCrops(
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String[] label,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) String[] colors,
            @RequestParam(required = false) String[] quantity,
            Model model) {

        // Convert arrays to lists and sanitize
        List<String> labels = sanitizeArrayToList(label);
        List<String> colorsList = sanitizeArrayToList(colors);
        List<String> sizesList = sanitizeArrayToList(quantity);

        // Build Sort object
        Sort sort = Sort.unsorted();
        if ("new".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "releaseDate");
        } else if ("priceAsc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("priceDesc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        }

        // Fetch filtered and sorted crops using the service layer
        List<Crops> crops = cropService.getFilteredCrops(labels, maxPrice, colorsList, sizesList, sort);

        model.addAttribute("crops", crops);
        return "crops";
    }

    private List<String> sanitizeArrayToList(String[] array) {
        if (array != null) {
            List<String> list = Arrays.stream(array)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            return list.isEmpty() ? null : list;
        }
        return null;
    }




    //Post

    @PostMapping("/")
    public ResponseEntity<String> addCrops(@RequestBody List<Crops> crops) {
        if (crops == null || crops.isEmpty()) {
            return ResponseEntity.badRequest().body("Crop list cannot be empty");
        }

        cropService.addAllCrops(crops);

        return ResponseEntity.status(HttpStatus.CREATED).body("Crops added successfully");
    }

    @PostMapping("/crop")
    public String addProd(@RequestBody Crops crop){
        cropService.addCrops(crop);
        return "Single crop added";
    }

    @PostMapping(value = "/crops", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addCrop(@RequestPart("crop") String cropJson, @RequestPart("image") MultipartFile imageFile) {
        try {
            // Use ObjectMapper to convert JSON string to Crops object
            ObjectMapper objectMapper = new ObjectMapper();
            Crops crop = objectMapper.readValue(cropJson, Crops.class);

            Crops crop1 = cropService.addCrop(crop, imageFile);
            return new ResponseEntity<>(crop1, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>("Failed to process image file: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    //Delete
    @DeleteMapping("/{uniqueID}")
    public void deleteById(@PathVariable String uniqueID){
        cropService.deleteByID(uniqueID);
    }
}
