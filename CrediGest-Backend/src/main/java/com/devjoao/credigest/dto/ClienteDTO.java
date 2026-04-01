package com.devjoao.credigest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ClienteDTO {

    private Long id;

    @NotBlank(message = "O nome do cliente é obrigatório")

    private String nome;

    @Pattern(regexp = "^(\\(?\\d{2}\\)?\\s?)?\\d{4,5}-?\\d{4}$|^$", message = "Telefone inválido")
    private String telefone;

    @Size(max = 500, message = "A observação não pode ter mais de 500 caracteres")
    private String observacao;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
