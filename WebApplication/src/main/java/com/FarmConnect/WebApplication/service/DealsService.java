package com.FarmConnect.WebApplication.service;

import com.FarmConnect.WebApplication.model.ConfirmedDeals;
import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.model.Wholesaler;
import com.FarmConnect.WebApplication.repository.DealsRepo;
import com.FarmConnect.WebApplication.repository.FarmersRepo;
import com.FarmConnect.WebApplication.repository.WholeSalerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DealsService {

    @Autowired
    FarmersRepo farmersRepo;

    @Autowired
    WholeSalerRepo wholeSalerRepo;

    @Autowired
    DealsRepo confirmedDealsRepo;

    public List<ConfirmedDeals> FindUserGetDeals(String userId) {
        List<ConfirmedDeals> list = new ArrayList<>();

        // Try to find user as wholesaler
        Optional<Wholesaler> wholesaler = wholeSalerRepo.getBy_id(userId);
        if (wholesaler.isPresent()) {
            // If user is a wholesaler, get their deals
            System.out.println("Wholersaler found for deals : "+wholesaler.get().get_id());
            list = confirmedDealsRepo.findByUser__id(userId);
            return list;
        }

        // If not wholesaler, check if user is a farmer
        Farmer farmer = farmersRepo.getByUniqueId(userId);
        if (farmer != null) {
            System.out.println("Farmer found for deals : "+farmer.getUniqueId());
            list = confirmedDealsRepo.findByFarmer_UniqueId(userId);
            return list;
        }

        return list; // Empty list if user not found
    }

    public List<ConfirmedDeals> saveDeal(List<ConfirmedDeals> deals) {
        return confirmedDealsRepo.saveAll(deals);
    }


    public List<ConfirmedDeals> getDealsByFarmer(String uniqueId) {
        return confirmedDealsRepo.findByFarmer_UniqueId(uniqueId);
    }
}
