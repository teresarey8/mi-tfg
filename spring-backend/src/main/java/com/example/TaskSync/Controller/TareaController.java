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
import java.util.Map;
import java.util.Optional;

@RestController
public class TareaController {

    @Autowired
    private TareaRepository tareaRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

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

    @PostMapping("/tareas")
    public ResponseEntity<?> crearTarea(@RequestBody crearTareaDTO dto, Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Categoria categoria = null;
        if (dto.getCategoriaId() != null) {
            categoria = categoriaRepository.findById(dto.getCategoriaId()).orElse(null);
        }

        Tarea tarea = Tarea.builder()
                .titulo(dto.getTitulo())
                .descripcion(dto.getDescripcion())
                .duracionMinutos(dto.getDuracionMinutos())
                .tipo(dto.getTipo())
                .usuario(usuario)
                .categoria(categoria)
                .completada(false)
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

    @GetMapping("/tareas/{id}")
    public ResponseEntity<Tarea> getTarea(@PathVariable Long id) {
        return tareaRepository.findById(id)
                .map(tarea -> ResponseEntity.ok().body(tarea))
                .orElse(ResponseEntity.notFound().build());
    }

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

        // Actualización condicional de campos
        if (dto.getTitulo() != null) {
            tarea.setTitulo(dto.getTitulo());
        }
        if (dto.getDescripcion() != null) {
            tarea.setDescripcion(dto.getDescripcion());
        }
        if (dto.getDuracionMinutos() > 0) { // Usamos el valor por defecto del DTO
            tarea.setDuracionMinutos(dto.getDuracionMinutos());
        }
        if (dto.getTipo() != null) {
            tarea.setTipo(dto.getTipo());
        }

        if (dto.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.getCategoriaId()).orElse(null);
            tarea.setCategoria(categoria);
        }
        if (dto.getTareaPadreId() != null) {
            Tarea padre = tareaRepository.findById(dto.getTareaPadreId()).orElse(null);
            tarea.setTareaPadre(padre);
        }
        if (dto.getTareaSiguienteId() != null) {
            Tarea siguiente = tareaRepository.findById(dto.getTareaSiguienteId()).orElse(null);
            tarea.setTareaSiguiente(siguiente);
        }
        if (dto.getCompletada() != null) {
            tarea.setCompletada(dto.getCompletada());
        }
        tarea.setNotificarAlTerminar(dto.isNotificarAlTerminar());

        tareaRepository.save(tarea);
        return ResponseEntity.ok(tarea);
    }

    @DeleteMapping("/tareas/{id}")
    public ResponseEntity<Void> deleteTarea(@PathVariable Long id) {
        Optional<Tarea> tareaOpt = tareaRepository.findById(id);
        if (tareaOpt.isPresent()) {
            Tarea tarea = tareaOpt.get();

            // Si esta tarea es tareaSiguiente de otra, limpiar esa referencia
            List<Tarea> tareasPadres = tareaRepository.findByTareaSiguiente(tarea);
            for (Tarea padre : tareasPadres) {
                padre.setTareaSiguiente(null);
                tareaRepository.save(padre);
            }

            // Si esta tarea tiene tareaPadre, limpiar la referencia de su padre
            if (tarea.getTareaPadre() != null) {
                Tarea padre = tarea.getTareaPadre();
                padre.getSubtareas().remove(tarea);
                tarea.setTareaPadre(null);
                tareaRepository.save(padre);
            }

            // Borrar la tarea
            tareaRepository.delete(tarea);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }




    @GetMapping("/tareas/{id}/subtareas")
    public ResponseEntity<List<Tarea>> obtenerSubtareas(@PathVariable Long id) {
        Optional<Tarea> tareaPadre = tareaRepository.findById(id);
        if (tareaPadre.isPresent()) {
            return ResponseEntity.ok(tareaRepository.findByTareaPadre(tareaPadre.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/tareas/{id}/iniciar")
    public ResponseEntity<?> iniciarTareaAhora(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        if (!tarea.getUsuario().equals(usuario)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        tareaRepository.save(tarea);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/tareas/{id}/finalizar-y-empezar-siguiente")
    public ResponseEntity<Tarea> finalizarYEmpezarSiguiente(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Tarea tareaActual = tareaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        if (!tareaActual.getUsuario().equals(usuario)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Marcar tarea actual como completada
        tareaActual.setCompletada(true);
        tareaRepository.save(tareaActual);

        // Intentar obtener tarea siguiente explícita
        Tarea siguiente = tareaActual.getTareaSiguiente();

        // Si no hay tareaSiguiente explícita, intentar con subtareas
        if (siguiente == null) {
            List<Tarea> subtareas = tareaRepository.findByTareaPadre(tareaActual);
            if (!subtareas.isEmpty()) {
                // Buscar la primera no completada
                for (Tarea sub : subtareas) {
                    if (!Boolean.TRUE.equals(sub.getCompletada())) {
                        siguiente = sub;
                        break;
                    }
                }
            }
        }

        if (siguiente != null) {
            siguiente.setCompletada(false); // asegurarse
            tareaRepository.save(siguiente);

            return ResponseEntity.ok(siguiente);
        } else {
            return ResponseEntity.noContent().build();
        }
    }



}
