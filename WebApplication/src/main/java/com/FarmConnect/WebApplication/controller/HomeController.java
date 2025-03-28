package com.FarmConnect.WebApplication.controller;


import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.service.FarmerService;
import com.FarmConnect.WebApplication.service.HomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@CrossOrigin
@Controller
public class HomeController {

    @Autowired
    HomeService service;

    @Autowired
    FarmerService farmerService;

    @GetMapping("/")
    public String greet(){
        return "index";
    }

    @GetMapping("/Home")
    public String getHome(){
        return "index";
    }



    @GetMapping("/register")
    public String getSignUp(){
        return "Sign Up page";
    }


    @GetMapping({"/transport","/about","/login"})
    public String getDedaultPage(){
        return "underdev";
    }

    @GetMapping("/Signupfarmer")
    public String getFarmerSignUp(){
        return "signupfarmer";
    }



//    @GetMapping("/transport")
//    public String getTransportPage(){
//        return "transport";
//    }






}
