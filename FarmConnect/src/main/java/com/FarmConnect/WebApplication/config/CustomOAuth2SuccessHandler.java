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
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JWTService jwtService;
    private final MyUserDatailService userDetailsService;

    @Autowired
    private FarmersRepo farmersRepo;

    @Autowired
    private WholeSalerRepo wholeSalerRepo;

    public CustomOAuth2SuccessHandler(JWTService jwtService, MyUserDatailService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");

        // Retrieve the 'role' parameter from the session as set by the frontend.
        String role = (String) request.getSession().getAttribute("userRole");

        if (role == null || role.isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Role is missing. Login failed. backend");
            return;
        }

        // Check if the user already exists in either the Farmer or Wholesaler repository
        Optional<Farmer> existingFarmer = farmersRepo.findByEmailOrPhone(email);
        Optional<Wholesaler> existingWholesaler = wholeSalerRepo.findByEmail(email);

        if (existingFarmer.isPresent()) {
            role = "ROLE_FARMER";
            System.out.println("Existing farmer logged in.");
        } else if (existingWholesaler.isPresent()) {
            role = "ROLE_WHOLESALER";
            System.out.println("Existing wholesaler logged in.");
        } else {
            // New user; create a new entry based on the provided role
            if ("ROLE_FARMER".equals(role)) {
                Farmer newFarmer = new Farmer();
                newFarmer.setEmailOrPhone(email);

                newFarmer.setImageUrl("https://res.cloudinary.com/dbgyjjfdw/image/upload/v1/default-farmer.jpg");
                farmersRepo.save(newFarmer);
                System.out.println("New farmer created for email: " + email);
            } else if ("ROLE_WHOLESALER".equals(role)) {
                Wholesaler newWholesaler = new Wholesaler();
                newWholesaler.setEmail(email);
                wholeSalerRepo.save(newWholesaler);
                System.out.println("New wholesaler created for email: " + email);
            } else {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid role.");
                return;
            }
        }

        // Generate JWT using the determined role
        String token = jwtService.generateToken(email, role);
        String targetPath = "/profile";
        String redirectUrl = "/oauth-redirect?token="
                + URLEncoder.encode(token, StandardCharsets.UTF_8)
                + "&redirect=" + URLEncoder.encode(targetPath, StandardCharsets.UTF_8);

        System.out.println("Request received for " + email + ", token: " + token);
        response.sendRedirect(redirectUrl);
    }
}

