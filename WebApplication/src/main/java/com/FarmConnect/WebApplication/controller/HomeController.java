package com.FarmConnect.WebApplication.controller;

import com.FarmConnect.WebApplication.model.Crops;
import com.FarmConnect.WebApplication.service.CropService;
import com.FarmConnect.WebApplication.service.HomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;


@RestController
public class HomeController {

    @Autowired
    HomeService service;

    @GetMapping("/")
    public String greet(){
        return "Welcome to FarmConnect";
    }

    @GetMapping("/about")
    public String getAbout(){
        return "our about page";
    }

    @GetMapping("/Home")
    public String getHome(){
        return "our home page";
    }

    @SessionAttribute



}
