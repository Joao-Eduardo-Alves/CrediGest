package com.devjoao.credigest.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

@Entity
public class ItemFiado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome do produto é obrigatório")
    private String nomeProduto;

    @NotNull(message = "O valor do produto é obrigatório")
    @DecimalMin(value = "0.01", inclusive = true, message = "O valor do produto deve ser maior que zero")
    private BigDecimal valorProduto;

    @Min(value = 1, message = "A quantidade deve ser no mínimo 1")
    private int quantidade;

    @NotNull(message = "O fiado é obrigatório")
    @ManyToOne (optional = false)
    @JoinColumn(name = "fiado_id", nullable = false)
    private Fiado fiado;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeProduto() {
        return nomeProduto;
    }

    public void setNomeProduto(String nomeProduto) {
        this.nomeProduto = nomeProduto;
    }

    public BigDecimal getValorProduto() {
        return valorProduto;
    }

    public void setValorProduto(BigDecimal valorProduto) {
        this.valorProduto = valorProduto;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public Fiado getFiado() {
        return fiado;
    }

    public void setFiado(Fiado fiado) {
        this.fiado = fiado;
    }


}
