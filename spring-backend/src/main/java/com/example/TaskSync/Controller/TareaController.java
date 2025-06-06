package com.example.TaskSync.Controller;

import com.example.TaskSync.DTO.crearTareaDTO;
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

import java.time.LocalDateTime;
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
     *
     */
    @PostMapping("/tareas")
    public ResponseEntity<?> crearTarea(@RequestBody crearTareaDTO dto, Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Categoria categoria = null;
        if (dto.getCategoriaId() != null) {
            categoria = categoriaRepository.findById(dto.getCategoriaId()).orElse(null);
        }

        LocalDateTime horaInicio = dto.getHoraInicio();
        if (horaInicio == null) {
            horaInicio = LocalDateTime.now();
        }

        Tarea tarea = Tarea.builder()
                .titulo(dto.getTitulo())
                .descripcion(dto.getDescripcion())
                .duracionMinutos(dto.getDuracionMinutos())
                .tipo(dto.getTipo())
                .horaInicio(horaInicio)
                .horaFin(horaInicio.plusMinutes(dto.getDuracionMinutos()))
                .usuario(usuario)
                .categoria(categoria)
                .notificarAlTerminar(dto.isNotificarAlTerminar())
                .build();

        if (dto.getTareaPadreId() != null) {
            tarea.setTareaPadre(tareaRepository.findById(dto.getTareaPadreId()).orElse(null));
        }

        if (dto.getTareaSiguienteId() != null) {
            tarea.setTareaSiguiente(tareaRepository.findById(dto.getTareaSiguienteId()).orElse(null));
        }

        tareaRepository.save(tarea);
        return ResponseEntity.ok(tarea);
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
    public ResponseEntity<Tarea> actualizarTarea(
            @PathVariable Long id,
            @RequestBody crearTareaDTO dto,
            Authentication authentication) {

        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        if (!tarea.getUsuario().equals(usuario)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        tarea.setTitulo(dto.getTitulo());
        tarea.setDescripcion(dto.getDescripcion());
        tarea.setDuracionMinutos(dto.getDuracionMinutos());
        tarea.setTipo(dto.getTipo());
        tarea.setHoraInicio(dto.getHoraInicio());
        tarea.setHoraFin(dto.getHoraInicio().plusMinutes(dto.getDuracionMinutos()));
        tarea.setNotificarAlTerminar(dto.isNotificarAlTerminar());

        if (dto.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.getCategoriaId()).orElse(null);
            tarea.setCategoria(categoria);
        }

        tareaRepository.save(tarea);
        return ResponseEntity.ok(tarea);
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