package com.FarmConnect.WebApplication.service;

import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.model.UserPrincipal;
import com.FarmConnect.WebApplication.model.Wholesaler;
import com.FarmConnect.WebApplication.repository.FarmersRepo;
import com.FarmConnect.WebApplication.repository.WholeSalerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
public class MyUserDatailService implements UserDetailsService {

    @Autowired
    FarmersRepo farmersRepo;

    @Autowired
    WholeSalerRepo wholesalersRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // Try finding a farmer first
        Optional<Farmer> farmer = farmersRepo.findByEmailOrPhone(username);
        if(farmer.isPresent()) {
            return UserPrincipal.fromFarmer(farmer.get());
        }

        // Try finding a wholesaler
        Optional<Wholesaler> wholesaler = wholesalersRepo.findByEmail(username);
        if(wholesaler.isPresent()) {
            return UserPrincipal.fromWholesaler(wholesaler.get());
        }

        throw new UsernameNotFoundException("User not found");
    }


    public boolean userExists(String email) {
        return farmersRepo.findByEmailOrPhone(email).isPresent() || wholesalersRepo.findByEmail(email).isPresent();
    }

    public void createOAuthUser(String email, String role) {
        if ("ROLE_WHOLESALER".equals(role)) {
            Wholesaler wholesaler = new Wholesaler();
            wholesaler.setEmail(email);
            wholesalersRepo.save(wholesaler);
        } else {
            Farmer farmer = new Farmer();
            farmer.setEmailOrPhone(email);
            farmersRepo.save(farmer);
        }
    }


}

