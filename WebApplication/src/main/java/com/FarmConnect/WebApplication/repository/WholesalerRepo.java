package com.FarmConnect.WebApplication.repository;

import com.FarmConnect.WebApplication.model.Wholesaler;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WholesalerRepo extends MongoRepository<Wholesaler, String> {
}
