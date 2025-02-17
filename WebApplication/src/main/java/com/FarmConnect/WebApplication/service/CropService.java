package com.FarmConnect.WebApplication.service;

import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.repositery.CropsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CropService {


    @Autowired
    CropsRepo objCrop;


//    public List<Crops> getCrops(){
//        return objCrop.findBy();
//    }


    public Crops getById(int cropId){
        return objCrop.findById(cropId).orElse( new Crops());
    }

    public List<Crops> getAllCrops(){
        return objCrop.findAll();
    }

    public void addCrops(Crops crop){
        objCrop.save(crop);
    }

    public void addAllCrops(List<Crops> crops){
         objCrop.saveAll(crops);
    }


}
