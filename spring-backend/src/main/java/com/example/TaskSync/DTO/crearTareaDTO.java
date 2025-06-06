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

    private int duracionMinutos;

    private String tipo; // "trabajo" o "descanso"

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalDateTime horaInicio;


    private Long categoriaId;

    private Long tareaPadreId;

    private Long tareaSiguienteId;

    private boolean notificarAlTerminar;
}
