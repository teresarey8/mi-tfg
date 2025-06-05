package com.example.TaskSync.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//ESTO ES LO QUE LE VAMOS A PEDIR AL USUARIO QUE SE QUIERA LOGEAR
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDTO {
    private String username;
    private String password;
}
