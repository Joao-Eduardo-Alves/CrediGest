package com.devjoao.credigest.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Fiado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "A data do fiado é obrigatória")
    @PastOrPresent(message = "A data não pode ser futura")
    private LocalDateTime data;

    @NotNull(message = "O cliente é obrigatório")
    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @NotEmpty(message = "Um fiado deve ter pelo menos um item")
    @OneToMany(mappedBy = "fiado", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemFiado> itens = new ArrayList<>();

    @Size(max = 500, message = "A observação não pode ter mais de 500 caracteres")
    private String observacao;

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

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
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