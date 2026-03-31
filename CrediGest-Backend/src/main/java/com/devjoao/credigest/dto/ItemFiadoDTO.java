package com.devjoao.credigest.dto;

import com.devjoao.credigest.validation.OnCreate;
import com.devjoao.credigest.validation.OnUpdate;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ItemFiadoDTO {

    private Long id;

    @NotBlank(groups = OnCreate.class, message = "Nome do produto obrigatório")
    private String nomeProduto;

    @NotNull(groups = OnCreate.class, message = "O valor do produto é obrigatório")
    private BigDecimal valorProduto;

    @NotNull(groups = OnCreate.class)
    @Min(value = 1, groups = {OnCreate.class, OnUpdate.class}, message = "Quantidade deve ser pelo menos 1")
    private Integer quantidade;

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

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }
}
