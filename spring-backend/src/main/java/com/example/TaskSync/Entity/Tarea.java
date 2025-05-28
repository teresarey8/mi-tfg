package com.example.TaskSync.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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
    private LocalDate fecha_limite;

    @NotBlank(message = "La prioridad es obligatoria")
    private String prioridad;

    private String estado;

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
    private List<Recordatorio> recordatorios;

    //Así, estado será null en el objeto, y el @PrePersist lo rellenará con "PENDIENTE" antes de guardar.
    @PrePersist
    public void prePersist() {
        if (estado == null || estado.trim().isEmpty()) {
            estado = "PENDIENTE";
        }
    }
}

