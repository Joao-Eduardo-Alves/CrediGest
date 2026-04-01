package com.devjoao.credigest.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PagamentoDTO {

    private Long id;

    @NotNull(message = "O cliente é obrigatório")
    private Long clienteId;

    @NotNull(message = "A data do pagamento é obrigatória")
    @PastOrPresent(message = "A data não pode ser futura")
    private LocalDateTime data;

    @NotNull(message = "O valor do pagamento é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor do pagamento deve ser maior que zero")
    private BigDecimal valorPago;

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

    public LocalDateTime getData() {
        return data;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }

}
