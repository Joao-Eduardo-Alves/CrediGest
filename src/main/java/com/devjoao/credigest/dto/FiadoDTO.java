package com.devjoao.credigest.dto;

import com.devjoao.credigest.validation.OnCreate;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class FiadoDTO {

    private Long id;

    private LocalDate data;

    @NotNull(groups = OnCreate.class, message = "Id do cliente é obrigatório ao criar um fiado")
    private Long clienteId;

    @Valid
    @NotEmpty(groups = OnCreate.class, message = "O fiado deve ter pelo menos um item")
    private List<ItemFiadoDTO> itens;

    private BigDecimal valorTotal;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public List<ItemFiadoDTO> getItens() {
        return itens;
    }

    public void setItens(List<ItemFiadoDTO> itens) {
        this.itens = itens;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

}
