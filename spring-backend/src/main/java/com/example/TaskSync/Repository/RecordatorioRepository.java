package com.example.TaskSync.Repository;

import com.example.TaskSync.Entity.Recordatorio;
import com.example.TaskSync.Entity.Tarea;
import com.example.TaskSync.Entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordatorioRepository extends JpaRepository<Recordatorio, Long> {
    List<Recordatorio> findByUsuario(Usuario usuario);
    List<Recordatorio> findByTarea(Tarea tarea);


}
