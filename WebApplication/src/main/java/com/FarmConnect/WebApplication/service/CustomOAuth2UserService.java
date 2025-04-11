package com.FarmConnect.WebApplication.service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {
        OAuth2User user = super.loadUser(request);
        Map<String, Object> attributes = new HashMap<>(user.getAttributes());

        String registrationId = request.getClientRegistration().getRegistrationId();
        String email = (String) attributes.get("email");

        if ("github".equals(registrationId) && email == null) {
            String login = (String) attributes.get("login");
            email = login + "@githubuser.local";
            attributes.put("email", email);
        }

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "email" // the key Spring uses to get name
        );
    }
}
