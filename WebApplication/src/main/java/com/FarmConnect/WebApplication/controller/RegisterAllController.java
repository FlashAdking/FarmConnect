package com.FarmConnect.WebApplication.controller;


import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.service.FarmerService;
import com.FarmConnect.WebApplication.service.RegistrationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
public class RegisterAllController {

    @Autowired
    RegistrationService regService;

    @Autowired
    FarmerService farmService;





}
