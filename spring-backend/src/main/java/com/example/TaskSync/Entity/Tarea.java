package com.example.TaskSync.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "tareas")
public class Tarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título de la tarea es obligatorio")
    @Size(max = 200, message = "El título no debe superar los 200 caracteres")
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @FutureOrPresent(message = "La fecha límite debe ser hoy o una futura")
    private LocalDateTime fecha_limite;

    @NotBlank(message = "La prioridad es obligatoria")
    private String prioridad;

    @Column(nullable = false)
    private String estado;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    @PastOrPresent(message = "La fecha de creación no puede ser futura")
    private LocalDate fecha_creacion;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    @NotNull(message = "La tarea debe estar asociada a un usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @OneToMany(mappedBy = "tarea", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Recordatorio> recordatorios;

    //Esto asegura que cuando se persista una nueva tarea, el estado y la fecha de creación se asignen automáticamente, incluso si no se lo pusieras desde el controlador.

    @PrePersist
    public void prePersist() {
        if (this.estado == null) {
            this.estado = "pendiente";
        }
        if (this.fecha_creacion == null) {
            this.fecha_creacion = LocalDate.now();
        }
    }


}

