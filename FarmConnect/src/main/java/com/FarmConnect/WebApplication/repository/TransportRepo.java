package com.FarmConnect.WebApplication.repository;

import com.FarmConnect.WebApplication.model.Transporter;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransportRepo extends MongoRepository<Transporter,Integer> {
}
