package com.FarmConnect.WebApplication.service;
import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.repository.CropsRepo;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.mongodb.core.query.Criteria;



import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CropService {


    @Autowired
    CropsRepo objCrop;

    public Optional<Crops> getById(String cropId) {
        return objCrop.findById(cropId);
    }

    public List<Crops> getAllCrops(){
        return objCrop.findAll();
    }

    public List<Crops> getAllCropsWithoutImageData() {
        return objCrop.findAllWithoutImageData();
    }

    public void addCrops(Crops crop){
        crop.setCropId(new ObjectId().toString());
        objCrop.save(crop);
    }

    @Autowired
    private MongoTemplate mongoTemplate;

    // Other service methods...

    public List<Crops> getFilteredCrops(
            List<String> labels,
            Integer maxPrice,
            List<String> colors,
            List<String> quantity,
            Sort sort) {

        Query query = new Query();

        // Build criteria dynamically
        List<Criteria> criteriaList = new ArrayList<>();

        if (labels != null && !labels.isEmpty()) {
            criteriaList.add(Criteria.where("label").in(labels));
        }

        if (maxPrice != null) {
            criteriaList.add(Criteria.where("price").lte(maxPrice));
        }

        if (colors != null && !colors.isEmpty()) {
            criteriaList.add(Criteria.where("color").in(colors));
        }

        if (quantity != null && !quantity.isEmpty()) {
            criteriaList.add(Criteria.where("quantity").in(quantity));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        // Apply sorting if provided
        if (sort != null && sort.isSorted()) {
            query.with(sort);
        }

        // Exclude imageData field to optimize response size
        query.fields().exclude("imageData");

        // Execute the query and return results
        return mongoTemplate.find(query, Crops.class);
    }


    public void addAllCrops(List<Crops> crops){
         objCrop.saveAll(crops);
    }

    public void deleteByID(String cropId){
        objCrop.deleteById(cropId);
    }


    public Crops addCrop(Crops crop, MultipartFile imageFile) throws IOException {
        crop.setImageName(imageFile.getOriginalFilename());
        crop.setImageType(imageFile.getContentType());
        crop.setImageData(imageFile.getBytes());
        crop.setCropId(new ObjectId().toString());
        return objCrop.save(crop);
    }

    public List<Crops> getAllCropsSortedByReleaseDate() {
        return objCrop.findAllByOrderByReleaseDateDesc();
    }

    public List<Crops> getAllCropsSortedByPriceAsc() {
        return objCrop.findAllByOrderByPriceAsc();
    }

    public List<Crops> getAllCropsSortedByPriceDesc() {
        return objCrop.findAllByOrderByPriceDesc();
    }

    public List<Crops> findByLabelAndPriceLessThanEqual(String label, Integer maxPrice) {
        return objCrop.findByLabelAndPriceLessThanEqual(label , maxPrice);
    }

    public List<Crops> findByLabel(String label) {
        return objCrop.findByLabel(label);
    }

    public void assignCropToFarmer(String cropId, String farmerId) {
        Optional<Crops> cropOpt = objCrop.findById(cropId);
        if (cropOpt.isPresent()){
            Crops crop = cropOpt.get();
            crop.setFarmerId(farmerId);
            objCrop.save(crop);
        } else {
            throw new IllegalArgumentException("Crop not found for id: " + cropId);
        }
    }


    public List<Crops> findByPriceLessThanEqual(Integer maxPrice) {
        return objCrop.findByPriceLessThanEqual(maxPrice);
    }
}
