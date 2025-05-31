package com.example.TaskSync.Controller;

import com.example.TaskSync.Entity.Recordatorio;
import com.example.TaskSync.Entity.Tarea;
import com.example.TaskSync.Entity.Usuario;
import com.example.TaskSync.Repository.CategoriaRepository;
import com.example.TaskSync.Repository.RecordatorioRepository;
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

public class RecordatorioController {

    @Autowired
    private TareaRepository tareaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RecordatorioRepository recordatorioRepository;

    /**
     * Obtener todos los recordatorios del usuario autenticado
     */
    @GetMapping("/recordatorios")
    public ResponseEntity<List<Recordatorio>> getRecordatorios(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        Usuario user = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Recordatorio> recordatorios = recordatorioRepository.findByUsuario(user);
        return ResponseEntity.ok(recordatorios);
    }

    /**
     * Crear un nuevo recordatorio
     */
    @PostMapping("/recordatorios")
    public ResponseEntity<?> crearRecordatorio(Authentication authentication, @RequestBody Recordatorio crearRecordatorioDTO) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado.");
        }

        String username = authentication.getName();
        Usuario user = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar que la tarea existe
        Tarea tarea = tareaRepository.findById(crearRecordatorioDTO.getTarea().getId())
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        Recordatorio recordatorio = Recordatorio.builder()
                .fecha_recordatorio(crearRecordatorioDTO.getFecha_recordatorio())
                .titulo(crearRecordatorioDTO.getTitulo())
                .frecuencia(crearRecordatorioDTO.getFrecuencia())
                .usuario(user)
                .tarea(tarea)
                .build();


        Recordatorio nuevoRecordatorio = recordatorioRepository.save(recordatorio);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRecordatorio);
    }

    /**
     * Obtener un recordatorio por ID
     */
    @GetMapping("/recordatorios/{id}")
    public ResponseEntity<Recordatorio> getRecordatorio(@PathVariable Long id) {
        return recordatorioRepository.findById(id)
                .map(recordatorio -> ResponseEntity.ok().body(recordatorio))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Editar un recordatorio existente
     */
    @PutMapping("/recordatorios/{id}")
    public ResponseEntity<Recordatorio> editRecordatorio(@PathVariable Long id, @RequestBody Recordatorio nuevoRecordatorioDTO, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return recordatorioRepository.findById(id)
                .map(recordatorio -> {
                    // Verificamos si la tarea nueva existe
                    Tarea tarea = tareaRepository.findById(nuevoRecordatorioDTO.getTarea().getId())
                            .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

                    recordatorio.setTitulo(nuevoRecordatorioDTO.getTitulo());
                    recordatorio.setTarea(tarea);
                    recordatorio.setFecha_recordatorio(nuevoRecordatorioDTO.getFecha_recordatorio());
                    recordatorio.setFrecuencia(nuevoRecordatorioDTO.getFrecuencia());

                    return ResponseEntity.ok(recordatorioRepository.save(recordatorio));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Eliminar un recordatorio
     */
    @DeleteMapping("/recordatorios/{id}")
    public ResponseEntity<Void> deleteRecordatorio(@PathVariable Long id) {
        Optional<Recordatorio> recordatorio = recordatorioRepository.findById(id);
        if (recordatorio.isPresent()) {
            recordatorioRepository.delete(recordatorio.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

