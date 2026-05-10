package com.FarmConnect.WebApplication.model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.PrivateKey;
import java.util.Collection;
import java.util.Collections;
import java.util.List;


public class UserPrincipal implements UserDetails {

    private String username;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(String username, String password, Collection<? extends GrantedAuthority> authorities) {
        this.username = username;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserPrincipal fromFarmer(Farmer farmer) {
        return new UserPrincipal(farmer.getEmailOrPhone(), farmer.getPassword(),
                Collections.singleton(new SimpleGrantedAuthority("ROLE_FARMER")));
    }

    public static UserPrincipal fromWholesaler(Wholesaler wholesaler) {
        return new UserPrincipal(wholesaler.getEmail(), wholesaler.getPassword(),
                Collections.singleton(new SimpleGrantedAuthority("ROLE_WHOLESALER")));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}

