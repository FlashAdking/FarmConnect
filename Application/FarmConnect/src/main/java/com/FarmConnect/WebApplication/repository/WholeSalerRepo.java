package com.FarmConnect.WebApplication.repository;


import com.FarmConnect.WebApplication.model.Wholesaler;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface WholeSalerRepo extends MongoRepository<Wholesaler, String> {
    @Query( "{'email' : ?0 }" )
    Optional<Wholesaler> findByEmail(String wholesaler);

    Optional<Wholesaler>  getBy_id(String username);
}
