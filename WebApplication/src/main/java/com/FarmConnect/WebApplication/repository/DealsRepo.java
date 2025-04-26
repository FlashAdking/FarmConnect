package com.FarmConnect.WebApplication.repository;

import com.FarmConnect.WebApplication.model.ConfirmedDeals;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DealsRepo extends MongoRepository<ConfirmedDeals , String> {
    List<ConfirmedDeals> findByUser__id(String wholesalerId);
    List<ConfirmedDeals> findByFarmer_UniqueId(String uniqueId);

}
