package com.devjoao.credigest.controller;

import com.devjoao.credigest.dto.FiadoDTO;
import com.devjoao.credigest.dto.ItemFiadoDTO;
import com.devjoao.credigest.service.FiadoService;
import com.devjoao.credigest.validation.OnCreate;
import com.devjoao.credigest.validation.OnUpdate;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fiados")
public class FiadoController {

    @Autowired
    private FiadoService fiadoService;

    @Operation(summary = "Listar todos os fiados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de fiados retornada com sucesso")
    })
    @GetMapping
    public List<FiadoDTO> listar() {
        return fiadoService.listar();
    }

    @Operation(summary = "Obter fiado por id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Fiado retornado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Fiado não encontrado")
    })
    @GetMapping("/{id}")
    public FiadoDTO obterPorId(@PathVariable Long id) {
        return fiadoService.obterPorId(id);
    }

    @Operation(summary = "Adicionar um novo fiado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Fiado criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FiadoDTO cadastrar(@RequestBody @Validated(OnCreate.class) FiadoDTO dto) {
        return fiadoService.cadastrar(dto);
    }

    @Operation(summary = "Deletar fiado por id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Fiado deletado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Fiado não encontrado")})
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        fiadoService.deletar(id);
    }

    @Operation(summary = "Adicionar item a um fiado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item adicionado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Fiado não encontrado")})
    @PostMapping("/{fiadoId}/itens")
    public FiadoDTO adicionarItens(@PathVariable Long fiadoId, @RequestBody @Valid List<ItemFiadoDTO> itensDto) {
        return fiadoService.adicionarItens(fiadoId, itensDto);
    }

    @Operation(summary = "Editar item de um fiado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item editado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Fiado ou item não encontrado")})
    @PatchMapping("/{fiadoId}/itens/{itemId}")
    public FiadoDTO editarItem(@PathVariable Long fiadoId, @PathVariable Long itemId, @RequestBody @Validated(OnUpdate.class)ItemFiadoDTO itemDto) {
        return fiadoService.editarItem(fiadoId, itemId, itemDto);
    }

    @Operation(summary = "Remover item de um fiado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item removido com sucesso"),
            @ApiResponse(responseCode = "404", description = "Fiado ou item não encontrado")})
    @DeleteMapping("/{fiadoId}/itens/{itemId}")
    public FiadoDTO removerItem(@PathVariable Long fiadoId, @PathVariable Long itemId) {
        return fiadoService.removerItem(fiadoId, itemId);
    }
}
