package com.devjoao.credigest.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Fiado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate data;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @OneToMany(mappedBy = "fiado", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemFiado> itens = new ArrayList<>();

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

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public List<ItemFiado> getItens() {
        return itens;
    }

    public void setItens(List<ItemFiado> itens) {
        this.itens = itens;
    }

    @Transient // metodo para nao salvar no BD
    public BigDecimal calcularValorTotal(){
        BigDecimal total = BigDecimal.ZERO;

        for (ItemFiado item : itens) {
            total = total.add(item.getValorProduto().multiply(BigDecimal.valueOf(item.getQuantidade())));
        }
        return total;
    }
}