package com.example.TaskSync.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    private int duracionMinutos; // duración en minutos (pomodoro típico = 25)

    private boolean completada;

    private LocalDateTime horaInicio; // cuándo empieza

    private LocalDateTime horaFin; // cuándo termina

    private String tipo; // "trabajo" o "descanso"

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonBackReference
    private Usuario usuario;


    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnore
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "tarea_padre_id")
    private Tarea tareaPadre; // tarea que la activa

    @OneToOne
    @JoinColumn(name = "tarea_siguiente_id")
    private Tarea tareaSiguiente; // tarea que se activa tras esta

    private boolean notificarAlTerminar = true;



}

