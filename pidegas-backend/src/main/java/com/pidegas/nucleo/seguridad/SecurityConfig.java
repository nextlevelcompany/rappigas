package com.pidegas.nucleo.seguridad;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final FiltroAutenticacionJwt filtroAutenticacionJwt;
    private final FiltroRateLimit filtroRateLimit;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource,
                          FiltroAutenticacionJwt filtroAutenticacionJwt,
                          FiltroRateLimit filtroRateLimit) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.filtroAutenticacionJwt = filtroAutenticacionJwt;
        this.filtroRateLimit = filtroRateLimit;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                        .contentTypeOptions(contentType -> {})
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
                )
                .authorizeHttpRequests(auth -> auth
                        // Rutas públicas de infraestructura y documentación
                        .requestMatchers(
                                "/actuator/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api/v1/auth/**",
                                "/api/v1/publico/**",
                                "/api/v1/empresas/registro",
                                "/api/v1/archivos/ver/**",
                                "/ws/**"
                        ).permitAll()
                        // Rutas protegidas por defecto
                        .anyRequest().authenticated()
                )
                .addFilterBefore(filtroRateLimit, org.springframework.security.web.authentication.logout.LogoutFilter.class)
                .addFilterBefore(filtroAutenticacionJwt, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
