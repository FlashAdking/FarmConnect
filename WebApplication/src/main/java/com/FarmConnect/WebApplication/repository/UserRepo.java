package com.FarmConnect.WebApplication.repository;


import com.FarmConnect.WebApplication.model.Wholesaler;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepo extends MongoRepository<Wholesaler, Integer> {
}
