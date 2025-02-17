package com.FarmConnect.WebApplication.repositery;

import org.springframework.boot.rsocket.server.RSocketServer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransportRepo extends MongoRepository<RSocketServer.Transport,Integer> {
}
