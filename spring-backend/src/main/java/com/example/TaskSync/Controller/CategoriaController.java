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
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;
    /**
     * Obtener todas las categorías del usuario autenticado
     */
    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> getCategorias(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        Usuario user = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Categoria> categorias = categoriaRepository.findByUsuario(user);
        return ResponseEntity.ok(categorias);
    }

    /**
     * Crear una nueva categoría
     */
    @PostMapping("/categorias")
    public ResponseEntity<Categoria> crearCategoria(Authentication authentication, @RequestBody Categoria nuevaCategoria) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = authentication.getName();
        Usuario user = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        nuevaCategoria.setUsuario(user);
        Categoria categoriaGuardada = categoriaRepository.save(nuevaCategoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaGuardada);
    }

    /**
     * Obtener una categoría por su ID
     */
    @GetMapping("/categorias/{id}")
    public ResponseEntity<Categoria> getCategoria(@PathVariable Long id) {
        return categoriaRepository.findById(id)
                .map(categoria -> ResponseEntity.ok().body(categoria))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Modificar una categoría
     */
    @PutMapping("/categorias/{id}")
    public ResponseEntity<Categoria> editCategoria(@PathVariable Long id, @RequestBody Categoria nuevaCategoria) {
        return categoriaRepository.findById(id)
                .map(categoria -> {
                    categoria.setNombre(nuevaCategoria.getNombre());
                    categoria.setColor(nuevaCategoria.getColor());
                    return ResponseEntity.ok().body(categoriaRepository.save(categoria));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Eliminar una categoría, teniendo en cuenta si tiene tareas asociadas
     */
    @DeleteMapping("/categorias/{id}")
    public ResponseEntity<Void> deleteCategoria(@PathVariable Long id) {
        Optional<Categoria> categoria = categoriaRepository.findById(id);
        if (categoria.isPresent()) {
            if (!categoria.get().getTareas().isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build(); // o 400
            }
            categoriaRepository.delete(categoria.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
