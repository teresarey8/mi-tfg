package com.example.TaskSync.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDTO {
    private String username;
    private String email;
    private String nombre;
    private String apellidos;
    private String sobreMi;
    private String curriculumUrl;


}
