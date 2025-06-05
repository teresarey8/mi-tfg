package com.example.TaskSync.Controller;

import com.example.TaskSync.DTO.crearTareaDTO;
import com.example.TaskSync.Entity.Categoria;
import com.example.TaskSync.Entity.Tarea;
import com.example.TaskSync.Entity.Usuario;
import com.example.TaskSync.Repository.CategoriaRepository;
import com.example.TaskSync.Repository.TareaRepository;
import com.example.TaskSync.Repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class TareaController {

    @Autowired
    private TareaRepository tareaRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Obtener todas las tareas del usuario autenticado
     */
    @GetMapping("/tareas")
    public ResponseEntity<List<Tarea>> getTareas(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        Usuario user = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Tarea> tareas = tareaRepository.findByUsuario(user);
        return ResponseEntity.ok(tareas);
    }

    /**
     * Crear una nueva tarea
     */
    @PostMapping("/tareas")
    public ResponseEntity<?> crearTarea(Authentication authentication, @RequestBody @Valid crearTareaDTO dto) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado.");
        }

        String username = authentication.getName();
        Usuario user = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Cargar categoría si viene especificada
        Categoria categoria = null;
        if (dto.getCategoriaId() != null) {
            categoria = categoriaRepository.findById(dto.getCategoriaId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        }

        // Crear entidad Tarea desde el DTO
        Tarea tarea = Tarea.builder()
                .titulo(dto.getTitulo())
                .descripcion(dto.getDescripcion())
                .fecha_limite(dto.getFecha_limite())
                .prioridad(dto.getPrioridad())
                .usuario(user)
                .categoria(categoria)
                .build();



        Tarea nuevaTarea = tareaRepository.save(tarea);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaTarea);
    }


    /**
     * Obtener una tarea por ID
     */
    @GetMapping("/tareas/{id}")
    public ResponseEntity<Tarea> getTarea(@PathVariable Long id) {
        return tareaRepository.findById(id)
                .map(tarea -> ResponseEntity.ok().body(tarea))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Modificar una tarea
     */
    @PutMapping("/tareas/{id}")
    public ResponseEntity<Tarea> editTarea(@PathVariable Long id, @RequestBody crearTareaDTO nuevaTareaDTO) {
        return tareaRepository.findById(id).map(tarea -> {
            tarea.setTitulo(nuevaTareaDTO.getTitulo());
            tarea.setDescripcion(nuevaTareaDTO.getDescripcion());
            tarea.setFecha_limite(nuevaTareaDTO.getFecha_limite());
            tarea.setPrioridad(nuevaTareaDTO.getPrioridad());

            if (nuevaTareaDTO.getCategoriaId() != null) {
                Categoria cat = categoriaRepository.findById(nuevaTareaDTO.getCategoriaId())
                        .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
                tarea.setCategoria(cat);
            } else {
                tarea.setCategoria(null);
            }

            Tarea tareaActualizada = tareaRepository.save(tarea);
            return ResponseEntity.ok(tareaActualizada);
        }).orElse(ResponseEntity.notFound().build());
    }


    /**
     * Eliminar una tarea
     */
    @DeleteMapping("/tareas/{id}")
    public ResponseEntity<Void> deleteTarea(@PathVariable Long id) {
        Optional<Tarea> tarea = tareaRepository.findById(id);
        if (tarea.isPresent()) {
            tareaRepository.delete(tarea.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Obtener tareas por categoría (filtrar)
     */
    @GetMapping("/tareas/categoria/{categoriaId}")
    public ResponseEntity<List<Tarea>> getTareasPorCategoria(
            @PathVariable Long categoriaId,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Verificar si la categoría existe y pertenece al usuario
        Usuario user = usuarioRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        // Validar que la categoría pertenezca al usuario
        if (!categoria.getUsuario().equals(user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Tarea> tareas = tareaRepository.findByUsuarioAndCategoria(user, categoria);
        return ResponseEntity.ok(tareas);
    }
}