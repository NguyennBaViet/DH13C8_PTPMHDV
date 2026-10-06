package dh13c8.hotelroomservice.config;

import dh13c8.hotelroomservice.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(c -> c.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Internal: booking-service gọi
                .requestMatchers("/api/rooms/internal/**").permitAll()
                // Public: xem khách sạn, phòng, tìm kiếm
                .requestMatchers(HttpMethod.GET, "/api/hotels/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/rooms/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/amenities/**").permitAll()
                // Nội bộ: lock/unlock phòng (Booking Service gọi)
                .requestMatchers("/api/rooms/*/availability/lock").authenticated()
                .requestMatchers("/api/rooms/*/availability/unlock").authenticated()
                // Quản trị: STAFF và ADMIN
                .requestMatchers(HttpMethod.POST,   "/api/hotels/**").hasAnyRole("STAFF","ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/hotels/**").hasAnyRole("STAFF","ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/hotels/**").hasAnyRole("STAFF","ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/rooms/**").hasAnyRole("STAFF","ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/rooms/**").hasAnyRole("STAFF","ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/rooms/**").hasAnyRole("STAFF","ADMIN")
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
