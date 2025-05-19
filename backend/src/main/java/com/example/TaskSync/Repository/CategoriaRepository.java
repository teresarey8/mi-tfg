package com.example.TaskSync.Repository;

import com.example.TaskSync.Entity.Categoria;
import com.example.TaskSync.Entity.Tarea;
import com.example.TaskSync.Entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByUsuario(Usuario usuario);

}
