package com.FarmConnect.WebApplication.service;


import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.repository.FarmersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Optional;


@Service
public class HomeService {

    @Autowired
    FarmersRepo farmRepo;






}
