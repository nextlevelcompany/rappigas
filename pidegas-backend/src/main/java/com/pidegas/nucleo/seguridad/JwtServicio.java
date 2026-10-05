package com.pidegas.nucleo.seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtServicio {

    private final SecretKey key;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtServicio(
            @Value("${app.jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}") String secret,
            @Value("${app.jwt.access-expiration-ms:86400000}") long accessExpirationMs,
            @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generarAccessToken(Long userId, UUID publicId, String email, String rol, Long tenantId) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(accessExpirationMs);

        var builder = Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("publicId", publicId.toString())
                .claim("rol", rol)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key);

        if (tenantId != null) {
            builder.claim("tenantId", tenantId);
        }

        return builder.compact();
    }

    public String generarRefreshToken(String email) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(refreshExpirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("type", "REFRESH")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    public boolean esTokenValido(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Claims extraerClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extraerEmail(String token) {
        return extraerClaims(token).getSubject();
    }

    public String extraerRol(String token) {
        return extraerClaims(token).get("rol", String.class);
    }

    public Long extraerTenantId(String token) {
        Number tenantId = extraerClaims(token).get("tenantId", Number.class);
        return tenantId != null ? tenantId.longValue() : null;
    }

    public UUID extraerPublicId(String token) {
        String publicIdStr = extraerClaims(token).get("publicId", String.class);
        return publicIdStr != null ? UUID.fromString(publicIdStr) : null;
    }
}
