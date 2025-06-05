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
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;


import java.util.List;
import java.util.Optional;

@RestController
public class UsuarioController {
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private TareaRepository tareaRepository;

    @GetMapping("/usuarios")
    public ResponseEntity<Page<Usuario>> getListUsuarios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Usuario> usuarios = usuarioRepository.findAll(pageable);
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<Usuario> getUsuario(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> ResponseEntity.ok().body(usuario))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<Usuario> editUsuario(@RequestBody Usuario nuevoUsuario, @PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setNombre(nuevoUsuario.getNombre());
                    usuario.setEmail(nuevoUsuario.getEmail());
                    return ResponseEntity.ok(usuarioRepository.save(usuario));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        if (usuario.isPresent()) {
            usuarioRepository.delete(usuario.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/usuarios/{id}/tareas")
    public ResponseEntity<Usuario> insertTarea(@PathVariable Long id, @RequestBody Tarea tarea) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        Optional<Tarea> tareaBD = tareaRepository.findById(tarea.getId());
        if (usuario.isPresent() && tareaBD.isPresent()) {
            usuario.get().getTareas().add(tareaBD.get());
            usuarioRepository.save(usuario.get());
            return ResponseEntity.ok(usuario.get());
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/usuarios/{idUsuario}/tareas/{idTarea}")
    public ResponseEntity<Usuario> deleteTarea(@PathVariable Long idUsuario, @PathVariable Long idTarea) {
        Optional<Usuario> usuario = usuarioRepository.findById(idUsuario);
        Optional<Tarea> tarea = tareaRepository.findById(idTarea);
        if (usuario.isPresent() && tarea.isPresent()) {
            usuario.get().getTareas().remove(tarea.get());
            return ResponseEntity.ok(usuario.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/usuarios/{id}/tareas")
    public ResponseEntity<List<Tarea>> getTareas(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        if (usuario.isPresent() && !usuario.get().getTareas().isEmpty()) {
            return ResponseEntity.ok(usuario.get().getTareas());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    //para que aparezca la información del usuario, y no tener que meter todo en el token
    @GetMapping("/usuario/perfil")
    public ResponseEntity<UserResponseDTO> obtenerPerfil(Authentication authentication) {
        Usuario usuario = usuarioRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        UserResponseDTO dto = UserResponseDTO.builder()
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellidos(usuario.getApellidos())
                .build();

        return ResponseEntity.ok(dto);
    }


}
