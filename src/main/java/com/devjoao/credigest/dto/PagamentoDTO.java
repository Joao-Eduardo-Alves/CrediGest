package com.devjoao.credigest.dto;

import com.devjoao.credigest.entity.Cliente;


import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PagamentoDTO {

    private Long id;

    private Long clienteId;

    private BigDecimal valorPago;

    private LocalDateTime dataPagamento;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClienteId() {
        return clienteId;
    }
    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public BigDecimal getValorPago() {
        return valorPago;
    }

    public void setValorPago(BigDecimal valorPago) {
        this.valorPago = valorPago;
    }

    public LocalDateTime getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(LocalDateTime dataPagamento) {
        this.dataPagamento = dataPagamento;
    }

}
