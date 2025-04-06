
package com.FarmConnect.WebApplication.controller;

import com.FarmConnect.WebApplication.model.Wholesaler;
import com.FarmConnect.WebApplication.repository.WholesalerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WholesalerService {

    @Autowired
    private WholesalerRepo wholesalerRepo;

    public void registerWholesaler(Wholesaler wholesaler) {
        if (wholesalerRepo.existsById(wholesaler.get_id())) {
            throw new IllegalArgumentException("Wholesaler already exists");
        }
        wholesalerRepo.save(wholesaler);
    }

    public Wholesaler getWholesalerById(String id) {
        return wholesalerRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Wholesaler not found"));
    }

    public void updateWholesaler(Wholesaler wholesaler) {
        wholesalerRepo.save(wholesaler);
    }

    public List<Wholesaler> getAllWholesalers() {
        return wholesalerRepo.findAll();
    }
}
