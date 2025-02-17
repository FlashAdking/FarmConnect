package com.FarmConnect.WebApplication.repositery;


import com.FarmConnect.WebApplication.model.Crops;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CropsRepo extends MongoRepository<Crops, Integer> {


}
