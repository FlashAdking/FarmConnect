package com.FarmConnect.WebApplication.config;

import com.FarmConnect.WebApplication.model.Farmer;
import com.FarmConnect.WebApplication.model.Wholesaler;
import com.FarmConnect.WebApplication.repository.FarmersRepo;
import com.FarmConnect.WebApplication.repository.WholeSalerRepo;
import com.FarmConnect.WebApplication.service.JWTService;
import com.FarmConnect.WebApplication.service.MyUserDatailService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JWTService jwtService;
    private final MyUserDatailService userDetailsService;

    @Autowired
    FarmersRepo farmersRepo;

    @Autowired
    WholeSalerRepo wholeSalerRepo;

    public CustomOAuth2SuccessHandler(JWTService jwtService, MyUserDatailService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");

        // Check if user already exists
        Optional<Farmer> existingFarmer = farmersRepo.findByEmailOrPhone(email);
        Optional<Wholesaler> existingWholesaler = wholeSalerRepo.findByEmail(email);

        String role;

        if (existingFarmer.isPresent()) {
            role = "ROLE_FARMER";
        } else if (existingWholesaler.isPresent()) {
            role = "ROLE_WHOLESALER";
        } else {
            // Create a new Farmer by default
            Farmer newFarmer = new Farmer();
            newFarmer.setEmailOrPhone(email);
            // Set any other default fields here
            farmersRepo.save(newFarmer);
            role = "ROLE_FARMER";
        }

        // Generate JWT
        String token = jwtService.genrateToken(email);

        // Set redirect path based on role
        String targetPath = switch (role) {
            case "ROLE_WHOLESALER" -> "/";
            case "ROLE_FARMER" -> "/";
            default -> "/";
        };

        System.out.println("req received for " + email + " token: " + token);

        String redirectUrl = "/oauth-redirect?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                + "&redirect=" + URLEncoder.encode(targetPath, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }




}
