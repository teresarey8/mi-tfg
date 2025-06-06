package com.example.TaskSync.Controller;

import com.example.TaskSync.Config.JwtTokenProvider;
import com.example.TaskSync.DTO.LoginRequestDTO;
import com.example.TaskSync.DTO.LoginResponseDTO;
import com.example.TaskSync.DTO.UserRegisterDTO;
import com.example.TaskSync.Entity.Usuario;
import com.example.TaskSync.Repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;

@RestController
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/auth/register")
    public ResponseEntity<?> save(@Valid @RequestBody UserRegisterDTO userDTO) {
        if (!userDTO.getPassword().equals(userDTO.getPassword2())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", "Las contraseñas no coinciden.")
            );
        }

        if (usuarioRepository.findByUsername(userDTO.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", "El nombre de usuario ya existe.")
            );
        }

        Usuario usuario = Usuario.builder()
                .username(userDTO.getUsername())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .email(userDTO.getEmail())
                .nombre(userDTO.getNombre())
                .apellidos(userDTO.getApellidos())
                .build();

        Usuario savedUsuario = usuarioRepository.save(usuario);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedUsuario);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginDTO) {
        try {
            UsernamePasswordAuthenticationToken userPassAuthToken =
                    new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword());

            Authentication auth = authenticationManager.authenticate(userPassAuthToken);

            Usuario user = (Usuario) auth.getPrincipal();

            String token = this.jwtTokenProvider.generateToken(auth);

            return ResponseEntity.ok(new LoginResponseDTO(user.getUsername(), token));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of(
                            "path", "/auth/login",
                            "message", "Credenciales erróneas",
                            "timestamp", new Date()
                    )
            );
        }
    }
}
