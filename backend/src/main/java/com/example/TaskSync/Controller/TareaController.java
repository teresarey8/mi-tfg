package com.example.TaskSync.Controller;

import com.example.TaskSync.Entity.Tarea;
import com.example.TaskSync.Entity.Usuario;
import com.example.TaskSync.Repository.CategoriaRepository;
import com.example.TaskSync.Repository.TareaRepository;
import com.example.TaskSync.Repository.UsuarioRepository;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
     * Obtengo todas las tareas formato json
     */

    @GetMapping("/tareas")
    public ResponseEntity<List<Tarea>> getTareas(Authentication authentication) {
        if(authentication != null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        String username = authentication.getName();//obtenemos el username

        //buscamos el usuario en la base de datos
        Usuario user = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        //buscar las tareas del usuario
        List<Tarea> tareas = tareaRepository.findByUsuario(user);

        return ResponseEntity.status(HttpStatus.OK).body(tareas);

    }

    /**
     * insertamos una tarea nueva
     */

    @PostMapping("/tareas")
    public ResponseEntity<?> crearTarea(Authentication authentication, @RequestBody Tarea crearTareaDTO) {
        // Verificar si el usuario está autenticado
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no autenticado.");
        }
        String username = authentication.getName(); // Obtener el username desde el token

        //buscamos el usuario en la base de datos
        Usuario user = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        //Crear la tarea
        Tarea tarea = Tarea.builder()
                .titulo(crearTareaDTO.getTitulo())
                .descripcion(crearTareaDTO.getDescripcion())
                .fecha_limite(crearTareaDTO.getFecha_limite())
                .prioridad(crearTareaDTO.getPrioridad())
                .estado(crearTareaDTO.getEstado())
                .fecha_creacion(crearTareaDTO.getFecha_creacion())
                .usuario(crearTareaDTO.getUsuario())
                .categoria(crearTareaDTO.getCategoria())
                .build();
        Tarea nuevaTarea = tareaRepository.save(tarea);

        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaTarea);
        
    }

    /**
     * obtenemos una tarea especifica
     */
    @GetMapping("/tareas/{id}")
    public ResponseEntity<Tarea> getTarea(@PathVariable Long id){
        return tareaRepository.findById(id)
                //Si la reserva fue encontrada (Optional no vacío), se ejecuta el bloque dentro de map.
                //ResponseEntity.ok() crea una respuesta HTTP con el código de estado 200 OK.
                //body(resreva) añade el proyecto como cuerpo de la respuesta.
                .map(tarea -> ResponseEntity.ok().body(tarea))
                .orElse(ResponseEntity.notFound().build());
    }
    /**
     * modificamos una tarea
     */
    @PutMapping("/tareas/{id}")
    public ResponseEntity <Tarea> editTarea(@PathVariable Long id, @RequestBody Tarea nuevaTarea){
        return  tareaRepository.findById(id)
                .map(tarea -> {
                    tarea.setTitulo(nuevaTarea.getTitulo());
                    tarea.setFecha_limite(nuevaTarea.getFecha_limite());
                    tarea.setPrioridad(nuevaTarea.getPrioridad());
                    tarea.setEstado(nuevaTarea.getEstado());
                    tarea.setCategoria(nuevaTarea.getCategoria());
                    tarea.setDescripcion(nuevaTarea.getDescripcion());
                    tarea.setRecordatorios(nuevaTarea.getRecordatorios());
                    return ResponseEntity.ok().body(tareaRepository.save(tarea));
                })
                .orElseGet(() ->{
                    return ResponseEntity.notFound().build();
                });
    }
    /**
     * Eliminamos tarea
     */
    @DeleteMapping("/tareas/{id}")
    public ResponseEntity<Void> deleteTarea(@PathVariable Long id){
        Optional<Tarea> tarea = tareaRepository.findById(id);
        if(tarea.isPresent()){
            tareaRepository.delete(tarea.get());
            return ResponseEntity.noContent().build();
        }
        else{
            return ResponseEntity.notFound().build();
        }
    }

    
}
