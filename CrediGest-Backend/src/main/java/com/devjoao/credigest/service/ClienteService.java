package com.devjoao.credigest.service;

import com.devjoao.credigest.dto.ClienteDTO;
import com.devjoao.credigest.entity.Cliente;
import com.devjoao.credigest.entity.Fiado;
import com.devjoao.credigest.entity.Pagamento;
import com.devjoao.credigest.repository.ClienteRepository;
import com.devjoao.credigest.repository.FiadoRepository;
import com.devjoao.credigest.repository.PagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private FiadoRepository fiadoRepository;

    @Autowired
    private PagamentoRepository pagamentoRepository;

    public List<ClienteDTO> listar() {

        List<Cliente> clientes = clienteRepository.findAll();

        return clientes.stream()
                .map(this::ClienteToDTO)
                .toList();
    }

    public ClienteDTO obterPorId(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
        return ClienteToDTO(cliente);
    }

    public ClienteDTO cadastrar(ClienteDTO dto) {

        Cliente cliente = new Cliente();
        cliente.setNome(dto.getNome());
        cliente.setTelefone(dto.getTelefone());
        cliente.setObservacao(dto.getObservacao());

        Cliente clienteSalvo = clienteRepository.save(cliente);

        return ClienteToDTO(clienteSalvo);
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

        return ClienteToDTO(clienteSalvo);
    }

    public void deletar (Long id){

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));

        // Verifica se existem fiados relacionados
        List<Fiado> fiados = fiadoRepository.findByClienteId(cliente.getId());
        if (!fiados.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível deletar o cliente pois existem fiados relacionados");
        }

        // Verifica se existem pagamentos relacionados
        List<Pagamento> pagamentos = pagamentoRepository.findByClienteId(cliente.getId());
        if (!pagamentos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível deletar o cliente pois existem pagamentos relacionados");
        }

        clienteRepository.delete(cliente);
    }

    //metodo conversor de entity para DTO
    private ClienteDTO ClienteToDTO(Cliente cliente) {
        ClienteDTO dto = new ClienteDTO();
        dto.setId(cliente.getId());
        dto.setNome(cliente.getNome());
        dto.setTelefone(cliente.getTelefone());
        dto.setObservacao(cliente.getObservacao());
        return dto;
    }
}
