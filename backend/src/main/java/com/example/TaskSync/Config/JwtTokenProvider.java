package com.example.TaskSync.Config;

import com.example.TaskSync.Entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {
    //solo a traves de este clave secreta podemos saber si un token es valido o no
    private static final String SECRET_KEY = "SuperClaveSecretaParaElJwtCon32CaracteresMin";
    private static final long EXPIRATION_TIME = 86400000; // 1 día


    public String  generateToken(Authentication authentication) {

        Usuario user = (Usuario) authentication.getPrincipal();
        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

        return Jwts.builder()
                .subject(Long.toString(user.getId()))
                .claim("username", user.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key) // Firma con el algoritmo por defecto
                .compact();
    }

    //Validar firma del token
    public boolean isValidToken(String token) {
        if(StringUtils.isBlank(token)){
            return false;
        }

        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

        try {
            JwtParser validator = Jwts.parser()
                    .verifyWith(key)
                    .build();
            validator.parse(token);
            return true;
        }catch (Exception e){
            //Aquí entraría si el token no fuera correcto o estuviera caducado.
            // Podríamos hacer un log de los fallos
            System.err.println("Error al validar el token: " + e.getMessage());
            return false;
        }

    }

    public String getUsernameFromToken(String token) {
        JwtParser parser = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build();
        Claims claims = parser.parseClaimsJws(token).getBody();
        return claims.get("username").toString();
    }
}