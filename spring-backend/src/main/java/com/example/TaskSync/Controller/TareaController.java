package com.example.TaskSync.Controller;

import com.example.TaskSync.Entity.Categoria;
import com.example.TaskSync.Entity.Tarea;
import com.example.TaskSync.Entity.Usuario;
import com.example.TaskSync.Repository.CategoriaRepository;
import com.example.TaskSync.Repository.TareaRepository;
import com.example.TaskSync.Repository.UsuarioRepository;
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
    public ResponseEntity<?> crearTarea(Authentication authentication, @RequestBody Tarea crearTareaDTO) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado.");
        }

        String username = authentication.getName();
        Usuario user = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar si la categoría existe y pertenece al usuario
        Categoria categoria = null;
        if (crearTareaDTO.getCategoria() != null) {
            categoria = categoriaRepository.findById(crearTareaDTO.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        }

        Tarea tarea = Tarea.builder()
                .titulo(crearTareaDTO.getTitulo())
                .descripcion(crearTareaDTO.getDescripcion())
                .fecha_limite(crearTareaDTO.getFecha_limite())
                .prioridad(crearTareaDTO.getPrioridad())
                .estado(crearTareaDTO.getEstado())
                .fecha_creacion(crearTareaDTO.getFecha_creacion())
                .usuario(user)
                .categoria(categoria)
                .recordatorios(crearTareaDTO.getRecordatorios())
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
    public ResponseEntity<Tarea> editTarea(@PathVariable Long id, @RequestBody Tarea nuevaTarea) {
        return tareaRepository.findById(id)
                .map(tarea -> {
                    tarea.setTitulo(nuevaTarea.getTitulo());
                    tarea.setFecha_limite(nuevaTarea.getFecha_limite());
                    tarea.setPrioridad(nuevaTarea.getPrioridad());
                    tarea.setEstado(nuevaTarea.getEstado());
                    tarea.setCategoria(nuevaTarea.getCategoria());
                    tarea.setDescripcion(nuevaTarea.getDescripcion());
                    tarea.setRecordatorios(nuevaTarea.getRecordatorios());
                    return ResponseEntity.ok(tareaRepository.save(tarea));
                })
                .orElse(ResponseEntity.notFound().build());
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
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<Tarea>> getTareasPorCategoria(@PathVariable Long categoriaId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        Usuario user = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        List<Tarea> tareas = tareaRepository.findByUsuarioAndCategoria(user, categoria);
        return ResponseEntity.ok(tareas);
    }
}