package com.FarmConnect.WebApplication.controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;


import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.service.CropService;
import com.FarmConnect.WebApplication.service.ImageUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class CropsController {

    @Autowired
    CropService cropService;

    @Autowired
    ImageUploadService imageUploadService;


    // No longer need to serve images from the backend
    /*
    @GetMapping("/crops/{id}/image")
    public ResponseEntity<byte[]> getCropImage(@PathVariable String id) {
        ...
    }
    */

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

//    @PostMapping(value = "/crops", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<?> addCrop(@RequestPart("crop") String cropJson, @RequestPart("image") MultipartFile imageFile) {
//        try {
//            // Use ObjectMapper to convert JSON string to Crops object
//            ObjectMapper objectMapper = new ObjectMapper();
//            Crops crop = objectMapper.readValue(cropJson, Crops.class);
//
//            Crops crop1 = cropService.addCrop(crop, imageFile);
//            return new ResponseEntity<>(crop1, HttpStatus.CREATED);
//        } catch (IOException e) {
//            return new ResponseEntity<>("Failed to process image file: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
//        } catch (Exception e) {
//            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//    }

    @GetMapping("crops/addcart")
    public String getAddCartPage(){
        return "addcart";
    }


    //Delete
//    @DeleteMapping("/{uniqueID}")
//    public void deleteById(@PathVariable String uniqueID){
//        cropService.deleteByID(uniqueID);
//    }

//    @GetMapping("/view_crop")
//    public String getIndividualCrop(){
//        return "product_details";
//    }

    @Controller
    public class CropController {

        @GetMapping("/crops/{id}")
        public String getCropDetail(@PathVariable("id") String cropId, Model model) {
            // Retrieve crop data using the cropId
            Optional<Crops> crop = cropService.getById(cropId);
            if(!crop.isEmpty()){
                System.out.println("serving Individual crop : "+cropId);
            }
            model.addAttribute("crop", crop);
            return "product_details";  // Returns the cropDetail.html Thymeleaf template
        }
    }

    @DeleteMapping("/api/crops/{cropId}/delete")
    public ResponseEntity<Map<String, String>> deleteCropById(@PathVariable String cropId) {
        try {
            cropService.deleteByID(cropId);
            System.out.println("Crop is Deleted");
            Map<String, String> response = new HashMap<>();
            response.put("message", "Crop deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete crop");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }




    @PutMapping("/api/crops/{cropId}/update")
    public ResponseEntity<Crops> updateCropById(@PathVariable String cropId, @RequestParam Map<String, String> parameters,
                                                @RequestParam(value = "image", required = false) MultipartFile image) throws ParseException, IOException {
        System.out.println("Received request to update crop with ID: " + cropId);

        Optional<Crops> existingCropOpt = cropService.getById(cropId);
        if (existingCropOpt.isEmpty()) {
            System.out.println("Crop not found for ID: " + cropId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Crops existingCrop = existingCropOpt.get();
        System.out.println("Found crop: " + existingCrop.getName());

        // Parse and update fields
        String dateString = parameters.get("releaseDate");
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        Date date = formatter.parse(dateString);
        existingCrop.setReleaseDate(date);

        // Set other fields
        existingCrop.setName(parameters.get("name"));
        existingCrop.setDescription(parameters.get("description"));
        existingCrop.setPrice(Double.parseDouble(parameters.get("price")));
        existingCrop.setCategory(parameters.get("category"));
        existingCrop.setQuantity(Integer.parseInt(parameters.get("quantity")));
        existingCrop.setProductAvailable(Boolean.parseBoolean(parameters.get("productAvailable")));

        // Handle image upload
        if (image != null && !image.isEmpty()) {
            String imageUrl = imageUploadService.uploadImage(image);
            existingCrop.setImageUrl(imageUrl);
            System.out.println("New image uploaded to Cloudinary for crop.");
        }

        Crops updatedCrop = cropService.addCrops(existingCrop);
        System.out.println("Crop updated successfully: " + updatedCrop.getName());
        return ResponseEntity.ok(updatedCrop);
    }




    @PostMapping(value = "api/crops/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addCrop(@RequestPart("crop") String cropJson,
                                     @RequestPart("image") MultipartFile imageFile) {
        try {
            // Convert JSON string to Crops object
            ObjectMapper objectMapper = new ObjectMapper();
            Crops crop = objectMapper.readValue(cropJson, Crops.class);

            // Save crop and image
            Crops savedCrop = cropService.addCrop(crop, imageFile);
            return new ResponseEntity<>(savedCrop, HttpStatus.CREATED);

        } catch (IOException e) {
            return new ResponseEntity<>("Invalid crop data or image: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Internal error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }




}
