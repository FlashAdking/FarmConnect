package com.FarmConnect.WebApplication.repository;

import com.FarmConnect.WebApplication.model.Farmer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmersRepo extends MongoRepository<Farmer , String> {

    Optional<Farmer> findByUniqueId(String uniqueId);

    Farmer getByUniqueId(String uniqueId);

    @Query( "{'emailOrPhone' : ?0 }" )
    Optional<Farmer> findByEmailOrPhone(String emailOrPhone);
}
