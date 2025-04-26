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

        Optional<Wholesaler> wholesaler = wholeSalerRepo.getBy_id(userId);
        Farmer farmer = farmersRepo.getByUniqueId(userId);

        List<ConfirmedDeals> list = new ArrayList<>();

        if ( wholesaler.isEmpty() ) {
            list = confirmedDealsRepo.findByUser__id(wholesaler.get().get_id());
        }

        else if (farmer != null) {
            list = confirmedDealsRepo.findByFarmer_UniqueId(farmer.getUniqueId());
        }

        return list;
    }

    public List<ConfirmedDeals> saveDeal(List<ConfirmedDeals> deals) {
        return confirmedDealsRepo.saveAll(deals);
    }
}
