package dh13c8.userservice.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        try {
            String token = extractToken(request);
            if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsername(token);
                String role     = jwtTokenProvider.getRole(token);
                Long   userId   = jwtTokenProvider.getUserId(token);

                var auth = new UsernamePasswordAuthenticationToken(
                        username, userId,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            log.error("JWT filter error: {}", e.getMessage());
        }
        chain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        return (StringUtils.hasText(header) && header.startsWith("Bearer "))
                ? header.substring(7) : null;
    }
}
