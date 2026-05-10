package com.FarmConnect.WebApplication.service;

import com.FarmConnect.WebApplication.model.Wholesaler;
import com.FarmConnect.WebApplication.repository.WholeSalerRepo;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.security.Keys;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTService {

    @Autowired
    WholeSalerRepo wholeSalerRepo;

    @org.springframework.beans.factory.annotation.Value("${jwt.secret}")
    private String secretKey;

    public JWTService(){
        // Using a static key instead of dynamically generating one so that
        // tokens survive application restarts during development.
    }


// Ensure you import the necessary JJWT classes

    public String generateToken(String emailOrPhone, String role) {

        return Jwts.builder()
                .setSubject(emailOrPhone)
                .claim("role", role)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + (10 * 60 * 60 * 1000))) // 10 hours expiration
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }



    public SecretKey getKey(){
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }



    public String extractUserName(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String userName = extractUserName(token);
        return (userName.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    // Add this method to your existing JwtService class
    public String extractWholesalerId(String token) {
        String emailOrPhone = extractUserName(token);
        // Assuming your WholesalerRepository has a method to find by email or phone
        Wholesaler wholesaler = wholeSalerRepo.findByEmail(emailOrPhone)
                .orElseThrow(() -> new RuntimeException("Wholesaler not found"));
        return wholesaler.get_id(); // or _id or whatever field you use
    }
}
