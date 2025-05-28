package com.example.TaskSync.DTO;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class crearTareaDTO {
    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 100, message = "El título no puede tener más de 100 caracteres")
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 500, message = "La descripción no puede tener más de 500 caracteres")
    private String descripcion;

    @NotNull(message = "La fecha límite es obligatoria")
    @FutureOrPresent(message = "La fecha límite debe ser hoy o una fecha futura")
    private LocalDate fecha_limite;

    @NotBlank(message = "La prioridad es obligatoria")
    @Pattern(regexp = "^(Baja|Media|Alta)$", message = "La prioridad debe ser Baja, Media o Alta")
    private String prioridad;

    @Pattern(regexp = "^(Pendiente|En progreso|Completada)$", message = "El estado debe ser Pendiente, En progreso o Completada")
    @Null(message = "El estado se genera automáticamente y no debe enviarse")
    private String estado;

    private LocalDate fecha_creacion;

    private Long usuario;

    private Long categoria;

}
