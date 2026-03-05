package com.devjoao.credigest.service;

import com.devjoao.credigest.dto.ClienteDTO;
import com.devjoao.credigest.entity.Cliente;
import com.devjoao.credigest.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public List<ClienteDTO> listar() {

        List<Cliente> clientes = clienteRepository.findAll();

        return clientes.stream()
                .map(this::toDTO)
                .toList();
    }

    public ClienteDTO cadastrar(ClienteDTO dto) {

        Cliente cliente = new Cliente();
        cliente.setNome(dto.getNome());
        cliente.setTelefone(dto.getTelefone());
        cliente.setObservacao(dto.getObservacao());

        Cliente clienteSalvo = clienteRepository.save(cliente);

        return toDTO(clienteSalvo);
    }

    public ClienteDTO editar(Long id, ClienteDTO dto){

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));

        if (dto.getNome() != null) {
            cliente.setNome(dto.getNome());
        }
        if (dto.getTelefone() != null) {
            cliente.setTelefone(dto.getTelefone());
        }
        if (dto.getObservacao() != null) {
            cliente.setObservacao(dto.getObservacao());
        }

        Cliente clienteSalvo = clienteRepository.save(cliente);

        return toDTO(clienteSalvo);
    }

    public void deletar (Long id){

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
        clienteRepository.delete(cliente);
    }

    //metodo conversor de entity para DTO
    private ClienteDTO toDTO(Cliente cliente) {
        ClienteDTO dto = new ClienteDTO();
        dto.setId(cliente.getId());
        dto.setNome(cliente.getNome());
        dto.setTelefone(cliente.getTelefone());
        dto.setObservacao(cliente.getObservacao());
        return dto;
    }
}
