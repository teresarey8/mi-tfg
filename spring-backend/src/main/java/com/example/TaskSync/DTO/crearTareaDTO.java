package com.example.TaskSync.DTO;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class crearTareaDTO {

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 100, message = "El título no puede tener más de 100 caracteres")
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 500, message = "La descripción no puede tener más de 500 caracteres")
    private String descripcion;

    @Min(value = 1, message = "La duración debe ser al menos 1 minuto")
    private int duracionMinutos;

    @Pattern(regexp = "trabajo|descanso", message = "El tipo debe ser 'trabajo' o 'descanso'")
    private String tipo;

    private Long categoriaId;

    private Long tareaPadreId;

    private Long tareaSiguienteId;

    @Builder.Default
    private boolean notificarAlTerminar = true;

    private Boolean completada; // Añadido para manejar el estado
}