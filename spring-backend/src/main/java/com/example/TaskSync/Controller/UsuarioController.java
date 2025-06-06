package com.example.TaskSync.Controller;

import com.example.TaskSync.DTO.UserResponseDTO;
import com.example.TaskSync.Entity.Tarea;
import com.example.TaskSync.Entity.Usuario;
import com.example.TaskSync.Repository.TareaRepository;
import com.example.TaskSync.Repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/usuario/perfil")
    public ResponseEntity<?> actualizarPerfil(
            @RequestParam("sobreMi") String sobreMi,
            @RequestParam(value = "curriculum", required = false) MultipartFile curriculum,
            Authentication auth
    ) {
        Usuario usuario = usuarioRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        usuario.setSobreMi(sobreMi);

        if (curriculum != null && !curriculum.isEmpty()) {
            try {
                String curriculumFileName = UUID.randomUUID() + "_" + curriculum.getOriginalFilename();
                Path ruta = Paths.get("uploads/" + curriculumFileName);
                Files.createDirectories(ruta.getParent());
                Files.write(ruta, curriculum.getBytes());
                usuario.setCurriculumUrl("/uploads/" + curriculumFileName);
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Error al guardar el archivo");
            }
        }

        usuarioRepository.save(usuario);
        return ResponseEntity.ok("Perfil actualizado correctamente");
    }

    @GetMapping("/usuario/perfil")
    public ResponseEntity<UserResponseDTO> obtenerPerfil(Authentication authentication) {
        Usuario usuario = usuarioRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        UserResponseDTO dto = UserResponseDTO.builder()
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellidos(usuario.getApellidos())
                .sobreMi(usuario.getSobreMi())
                .curriculumUrl(usuario.getCurriculumUrl())
                .build();

        return ResponseEntity.ok(dto);
    }
}
