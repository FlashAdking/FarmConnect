package com.FarmConnect.WebApplication.repository;

import com.FarmConnect.WebApplication.model.Farmer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmersRepo extends MongoRepository<Farmer , Integer> {
}
