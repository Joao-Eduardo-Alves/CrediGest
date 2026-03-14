package com.devjoao.credigest.controller;

import com.devjoao.credigest.dto.PagamentoDTO;
import com.devjoao.credigest.service.PagamentoService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
}
