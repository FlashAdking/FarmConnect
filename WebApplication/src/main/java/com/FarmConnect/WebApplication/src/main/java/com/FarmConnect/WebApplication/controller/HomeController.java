package com.FarmConnect.WebApplication.controller;


import com.FarmConnect.WebApplication.service.HomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;


@CrossOrigin
@Controller
public class HomeController {

    @Autowired
    HomeService service;

    @GetMapping("/")
    public String greet(){
        return "index";
    }

    @GetMapping("/Home")
    public String getHome(){
        return "index";
    }



    @GetMapping("/Signupfarmer")
    public String getFarmerLogin(){
        return "signupfarmer";
    }

    @GetMapping("/register")
    public String getSignUp(){
        return "Sign Up page";
    }

    @GetMapping("/farmers")
    public String getFarmers(){
        return "List of Farmers";
    }

    @GetMapping("/transport")
    public String getTrabsport(){
        return "List of Transporters";
    }

    @GetMapping("/about")
    public String getAbout(){
        return "our about page";
    }







}
