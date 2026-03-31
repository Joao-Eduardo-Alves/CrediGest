package com.devjoao.credigest.controller;

import com.devjoao.credigest.dto.PagamentoDTO;
import com.devjoao.credigest.service.PagamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pagamentos")
public class PagamentoController {

    @Autowired
    private PagamentoService pagamentoService;

    @Operation(summary = "Registra um pagamento para um cliente específico")
    @PostMapping("/registrar/{clienteId}")
    public void registrarPagamento(
            @PathVariable Long clienteId,
            @RequestBody PagamentoDTO dto) {

        pagamentoService.registrarPagamento(clienteId, dto.getValorPago());
    }

    //endpoint para obter o histórico de pagamentos de um cliente
    @Operation(summary = "Obtém o histórico de pagamentos de um cliente")
    @GetMapping("/historico/{clienteId}")
    public List<PagamentoDTO> ListarPagamentos(@PathVariable Long clienteId) {
        return pagamentoService.listarPagamentos(clienteId);
    }

    @Operation(summary = "Remover um pagamento de um fiado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Pagamento excluido com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pagamento não encontrado")})
    @DeleteMapping("/excluir/{pagamentoId}")
    public ResponseEntity<Void> excluirPagamento(@PathVariable Long pagamentoId) {
        pagamentoService.excluirPagamento(pagamentoId);
        return ResponseEntity.noContent().build();
    }
}
