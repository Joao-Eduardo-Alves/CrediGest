package com.devjoao.credigest.dto;

import com.devjoao.credigest.validation.OnCreate;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class FiadoDTO {

    private Long id;

    @NotNull(groups = OnCreate.class, message = "A data é obrigatória")
    @PastOrPresent(groups = OnCreate.class, message = "A data não pode ser futura")
    private LocalDateTime data;

    @NotNull(groups = OnCreate.class, message = "Id do cliente é obrigatório")
    private Long clienteId;

    private String nomeCliente;

    @Valid
    @NotEmpty(groups = OnCreate.class, message = "O fiado deve ter pelo menos um item")
    private List<ItemFiadoDTO> itens;

    @Size(max = 500, message = "A observação não pode ter mais de 500 caracteres")
    private String observacao;

    private BigDecimal valorTotal;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getData() {
        return data;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public List<ItemFiadoDTO> getItens() {
        return itens;
    }

    public void setItens(List<ItemFiadoDTO> itens) {
        this.itens = itens;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

}
