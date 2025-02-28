package com.FarmConnect.WebApplication.repository;


import com.FarmConnect.WebApplication.model.Crops;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CropsRepo extends MongoRepository<Crops, String>{

    @Query(value = "{}", fields = "{ 'imageData' : 0 }")
    List<Crops> findAllWithoutImageData();

    List<Crops> findAllByOrderByReleaseDateDesc();
    List<Crops> findAllByOrderByPriceAsc();
    List<Crops> findAllByOrderByPriceDesc();

    Optional<Crops> findById(String cropId);

//    @Query("{ "
//            + "'$and': ["
//            + "  { 'label': { '$in': ?0 } },"
//            + "  { 'price': { '$lte': ?1 } },"
//            + "  { 'color': { '$in': ?2 } },"
//            + "  { 'size': { '$in': ?3 } }"
//            + "]"
//            + "}")
//    List<Crops> findCropsByFilters(List<String> labels, Integer maxPrice, List<String> colors, List<String> sizes, Sort sort);

    List<Crops> findByLabelAndPriceLessThanEqual(String label, Integer price);

    List<Crops> findByLabel(String label);

    List<Crops> findByPriceLessThanEqual(Integer price);

}
