package com.FarmConnect.WebApplication.config;

import com.FarmConnect.WebApplication.service.CustomOAuth2UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JWTFilter jwtFilter;

    @Autowired
    private CustomOAuth2SuccessHandler customOAuth2SuccessHandler;


    @Bean
    public SecurityFilterChain getSecurityFilterchain(HttpSecurity http) throws Exception {

        return http.csrf(customizer -> customizer.disable())
                .authorizeHttpRequests(request -> request.requestMatchers("/", "/farmerlogin",
                                "/Home","/wholesalerlogin","/Signupwholesaler", "/oauth-redirect",
                                "/Signupfarmer", "/css/**", "/js/**", "/img/**"
                                )
                        .permitAll()
                        .anyRequest().authenticated())
//                .httpBasic(Customizer.withDefaults())
//                .oauth2Login(Customizer.withDefaults()) // github and google
                .oauth2Login(
                        oauth2 -> oauth2.loginPage("/farmerlogin")
                        .successHandler(customOAuth2SuccessHandler)
                        .userInfoEndpoint(userInfo -> userInfo.userService(new CustomOAuth2UserService()))
                )
                // github and google
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception ->
                    exception.authenticationEntryPoint((request, response, authException) -> {
                        // Check if it's an AJAX/fetch request
                        String xRequestedWith = request.getHeader("X-Requested-With");
                        String accept = request.getHeader("Accept");

                        if ((xRequestedWith != null && xRequestedWith.equals("XMLHttpRequest")) ||
                            (accept != null && accept.contains("application/json"))) {
                            // For API requests
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Unauthorized\"}");
                        } else {
                            // For HTML page requests
                            response.sendRedirect("/");
                        }
                    }))
                .addFilterBefore(jwtFilter , UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(new BCryptPasswordEncoder(12));
//        provider.setPasswordEncoder(NoOpPasswordEncoder.getInstance());
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

}
