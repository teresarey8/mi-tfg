package com.example.TaskSync.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
//ESTO ES LO QUE LE VAMOS A PEDIR CUANDO UN USUARIO SE QUIERA RESGITRAR
public class UserRegisterDTO {
    private String username;
    private String email;
    private String password;
    private String password2;
    private String roles;
    private String nombre;
    private String apellidos;
    private Long telefono;
}