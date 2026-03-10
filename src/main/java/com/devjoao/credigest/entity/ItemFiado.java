package com.devjoao.credigest.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
public class ItemFiado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeProduto;

    private BigDecimal valorProduto;

    private int quantidade;

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
