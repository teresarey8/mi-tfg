package com.example.TaskSync.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
//ESTO ES LO QUE LE VAMOS A ENVIAR AL USUARIO LOGEADO, y cada vez que haga un apetion el token se vuelve a enviar para saber que es tal usuario autorizado
public class LoginResponseDTO {
    private String username;
    //cuando recibas este token tienes que ir a Authorization a bearer token y lo pegas para hacer peticiones
    private String token;
}