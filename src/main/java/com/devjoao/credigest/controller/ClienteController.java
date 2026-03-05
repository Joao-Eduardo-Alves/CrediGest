package com.devjoao.credigest.controller;

import com.devjoao.credigest.dto.ClienteDTO;
import com.devjoao.credigest.service.ClienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @Operation(summary = "Listar todos os clientes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de clientes retornada com sucesso")
    })
    @GetMapping
    public List<ClienteDTO> listar() {
        return clienteService.listar();
    }


    @Operation(summary = "Cadastrar um novo cliente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Cliente criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteDTO cadastrar(@RequestBody @Valid ClienteDTO dto) {
        return clienteService.cadastrar(dto);
    }


    @Operation(summary = "Editar cliente por id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cliente atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado")})
    @PatchMapping ("/{id}")
    public ClienteDTO atualizar(@PathVariable Long id, @RequestBody @Valid ClienteDTO dto) {
        return clienteService.atualizar(id, dto);
    }

    @Operation(summary = "Deletar cliente por id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Cliente deletado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Cliente não encontrado")})
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        clienteService.deletar(id);
    }

}
