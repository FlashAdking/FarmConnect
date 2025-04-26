package com.FarmConnect.WebApplication.controller;


import com.FarmConnect.WebApplication.model.Wholesaler;
import com.FarmConnect.WebApplication.service.WholesalerService;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.service.FarmerService;
import com.FarmConnect.WebApplication.service.HomeService;
import com.FarmConnect.WebApplication.service.JWTService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin
@Controller
public class HomeController {

    @Autowired
    HomeService service;

    @Autowired
    FarmerService farmerService;

    @Autowired
    WholesalerService wholesalerService;

    @Autowired
    JWTService jwtService;



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

    @GetMapping("/profile")
    public String MyProfile(Model model, HttpServletRequest request) {

        String token = request.getHeader("Authorization").substring(7);
        // Decode and extract claims from the token
        String username = jwtService.extractUserName(token);
        String role = jwtService.extractRole(token);


//        model.addAttribute("username", username);


        if ("ROLE_FARMER".equals(role)) {

            return "farmerprofile";

        } else if ("ROLE_WHOLESALER".equals(role)) {

            Wholesaler wholesaler = wholesalerService.getByEmailId(username);

            model.addAttribute("wholesaler",wholesaler);
            return "wholesalerProfile";
        } else {
            // Handle unauthorized or unknown roles
            return "underdev";
        }
    }


    @PostMapping("/storerole")
    public ResponseEntity<?> storeRoleInSession(@RequestBody Map<String, String> request, HttpServletRequest httpServletRequest) {
        System.out.println("store role is invoked");

        String role = request.get("role");
        httpServletRequest.getSession().setAttribute("userRole", role);
        return ResponseEntity.ok("Role stored in session.");
    }


    @GetMapping("/checkout")
    public String getCheckoutPage(){
        return "checkout";
    }


    @GetMapping("/order-success")
    public String orderSuccess() {
        return "order-success"; // Returns the order-success.html template
    }




}
