package com.FarmConnect.WebApplication.config;

import com.FarmConnect.WebApplication.service.JWTService;
import com.FarmConnect.WebApplication.service.MyUserDatailService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.ApplicationContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JWTFilter extends OncePerRequestFilter {

    @Autowired
    JWTService jwtService;

    @Autowired
    ApplicationContext context;

    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
            "/",
            "/farmerlogin",
            "/Home",
            "/wholesalerlogin",
            "/Signupwholesaler",
            "/oauth-redirect",
            "/Signupfarmer",
            "/css",
            "/js",
            "/img",
            "/crops",
            "/farmers",
            "/api/farmers",
            "/about",
            "/api/crops"
    );

    private boolean isExcludedEndpoint(String path) {
        // Check if the path exactly equals any of the excluded endpoints,
        // or if it starts with one plus a "/" indicating a subpath.
        return EXCLUDED_PATHS.stream().anyMatch(excluded ->
                path.equals(excluded) || path.startsWith(excluded + "/"));
    }



    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String requestPath = request.getRequestURI();

        // Bypass token check for public endpoints.
        if (isExcludedEndpoint(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).trim();
        } else if (request.getCookies() != null) {
            token = Arrays.stream(request.getCookies())
                    .filter(cookie -> "jwtToken".equals(cookie.getName()))
                    .map(cookie -> cookie.getValue())
                    .findFirst()
                    .orElse(null);
        }

        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Validate token format: should contain exactly 2 periods for a JWS
        if (token.isEmpty() || token.chars().filter(ch -> ch == '.').count() != 2) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token format");
            return;
        }

        try {
            String emailOrPhone = jwtService.extractUserName(token);
            if (emailOrPhone != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = context.getBean(MyUserDatailService.class).loadUserByUsername(emailOrPhone);
                if (jwtService.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception ex) {
            // Optionally log the exception or handle the error (e.g., clear context, etc.)
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid/Expired JWT Token");
            return;
        }

        filterChain.doFilter(request, response);
    }

}
