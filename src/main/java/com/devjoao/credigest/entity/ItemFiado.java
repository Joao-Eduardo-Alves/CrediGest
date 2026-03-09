package com.devjoao.credigest.entity;

import jakarta.persistence.*;

@Entity
public class ItemFiado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeProduto;
    private int quantidade;

    @ManyToOne
    @JoinColumn(name = "fiado_id")
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
