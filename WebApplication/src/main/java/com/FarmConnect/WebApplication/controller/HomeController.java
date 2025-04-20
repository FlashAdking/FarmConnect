package com.FarmConnect.WebApplication.controller;


import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.service.FarmerService;
import com.FarmConnect.WebApplication.service.HomeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@Controller
public class HomeController {

    @Autowired
    HomeService service;

    @Autowired
    FarmerService farmerService;

    @GetMapping("/")
    public String landingPage(){
        return "index";
    }

    @GetMapping("/Home")
    public String getHome(){
        return "index";
    }


   @GetMapping({"/transport","/about"})
    public String getDedaultPage(){
        return "underdev";
    }

    @GetMapping("/farmerlogin")
    public String getFarmerLogin(){
        return "farmerlogin";
    }

    @GetMapping("/Signupfarmer")
    public String getFarmerSignUp(){
        return "signupfarmer";
    }

    @GetMapping("/Signuptransporter")
    public String getTransportSignUp(){
        return "transportsignup";
    }

    @GetMapping("/profile")
    public String getProfilePage(){
        return "farmerprofile";
    }

    @GetMapping("/wholesalerlogin")
    public String getLoginforWholesaler(){
        return "WholeSalerLogin";
    }

    @GetMapping("/Signupwholesaler")
    public String getSignUpforWholesaler(){
        return "WholeSalerSignUp";
    }


    @Controller
    public class RedirectController {

        @GetMapping("/oauth-redirect")
        public String oauthRedirectPage() {
            return "oauth-redirect"; // Thymeleaf will render templates/oauth-redirect.html
        }
    }





}
