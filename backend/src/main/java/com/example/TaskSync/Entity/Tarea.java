package com.example.TaskSync.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table( name= "tareas")
public class Tarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titulo;
    private String descripcion;
    private LocalDate fecha_limite;
    private String prioridad;
    private String estado;
    private LocalDate fecha_creacion;

    // muchas tareas pueden pertenecer a un solo usuario
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    //muchas tareas pueden tener la misma categoría
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    //una tarea puede tener varios recordatorios
    @OneToMany(mappedBy = "tarea", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recordatorio> recordatorios;
}
