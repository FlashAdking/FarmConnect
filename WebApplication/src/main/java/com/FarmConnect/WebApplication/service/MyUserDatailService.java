package com.FarmConnect.WebApplication.service;

import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.model.UserPrincipal;
import com.FarmConnect.WebApplication.repository.FarmersRepo;
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

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Optional<Farmer> farmer = farmersRepo.findByEmailOrPhone(username);

        if(farmer.isEmpty()){
            System.out.println("Farmer not found ");
            throw new UsernameNotFoundException("Farmer not Found");
        }

        return new UserPrincipal(farmer.orElse(null));
    }
}
