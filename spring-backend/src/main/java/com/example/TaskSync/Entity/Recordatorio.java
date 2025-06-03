package com.example.TaskSync.Entity;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.NotBlank;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "recordatorios")
public class Recordatorio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La fecha del recordatorio es obligatoria")
    @FutureOrPresent(message = "La fecha del recordatorio no puede estar en el pasado")
    private LocalDate fecha_recordatorio;

    @NotBlank(message = "El título del recordatorio es obligatorio")
    @Size(max = 200, message = "El título no debe superar los 200 caracteres")
    private String titulo;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "La frecuencia es obligatoria")
    private Frecuencia frecuencia;


    @ManyToOne
    @JoinColumn(name = "tarea_id")
    @JsonIgnoreProperties
    private Tarea tarea;


    @ManyToOne
    @JsonIgnoreProperties
    @JoinColumn(name = "usuario_id", nullable = false)
    @NotNull(message = "El recordatorio debe estar asociado a un usuario")
    private Usuario usuario;
}
