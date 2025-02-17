package com.FarmConnect.WebApplication.controller;


import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.service.CropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Crops")
public class CropsController {

    @Autowired
    CropService cropService;

    @GetMapping("/{cropid}")
    public Crops getCropById(@PathVariable int cropId){
        return cropService.getById(cropId);
    }

    @PostMapping("/Crops")
    public String addMultipleCrops(@RequestBody List<Crops> crops){
        cropService.addAllCrops(crops);
        return "Crops addes Successfully";
    }

    @PostMapping("/Crop")
    public void addProd(@RequestBody Crops crop){
        cropService.addCrops(crop);
    }

    @GetMapping("/Crops/{cropId}")
    public Crops getCrop(@PathVariable int cropId){
        return  cropService.getById(cropId);
    }

    @GetMapping("/Crops")
    public List<Crops> getAllCrops(){
        return cropService.getAllCrops();
    }

}
