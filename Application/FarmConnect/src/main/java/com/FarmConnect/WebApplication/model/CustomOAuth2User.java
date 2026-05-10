package com.FarmConnect.WebApplication.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {

    private final OAuth2User delegate;
    private final Map<String, Object> customAttributes;

    public CustomOAuth2User(OAuth2User delegate, Map<String, Object> customAttributes) {
        this.delegate = delegate;
        this.customAttributes = customAttributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return customAttributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return delegate.getAuthorities();
    }

    @Override
    public String getName() {
        return delegate.getName(); // or customAttributes.get("login") if you prefer
    }
}
