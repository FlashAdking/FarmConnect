package com.FarmConnect.WebApplication.repositery;

import com.FarmConnect.WebApplication.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepo extends MongoRepository<User , Integer> {
}
