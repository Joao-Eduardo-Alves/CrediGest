package com.devjoao.credigest.service;

import com.devjoao.credigest.dto.FiadoDTO;
import com.devjoao.credigest.dto.ItemFiadoDTO;
import com.devjoao.credigest.entity.Cliente;
import com.devjoao.credigest.entity.Fiado;
import com.devjoao.credigest.entity.ItemFiado;
import com.devjoao.credigest.repository.ClienteRepository;
import com.devjoao.credigest.repository.FiadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FiadoService {

    @Autowired
    private FiadoRepository fiadoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    public List<FiadoDTO> listar() {
        List<Fiado> fiados = fiadoRepository.findAll();
        return fiados.stream().map(this::FiadotoDTO).collect(Collectors.toList());
    }

    public FiadoDTO cadastrar(FiadoDTO dto) {
        Fiado fiado = new Fiado();
        fiado.setData(dto.getData() != null ? dto.getData() : LocalDate.now());

        if (dto.getClienteId() != null) {
            Cliente cliente = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
            fiado.setCliente(cliente);
        }

        if (dto.getItens() != null) {
            AddItensAoFiado(fiado, dto.getItens());
        }

        Fiado fiadoSalvo = fiadoRepository.save(fiado);
        return FiadotoDTO(fiadoSalvo);
    }

    public void deletar(Long id) {
        Fiado fiado = fiadoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fiado não encontrado"));
        fiadoRepository.delete(fiado);
    }

    public FiadoDTO adicionarItem(Long fiadoId, List<ItemFiadoDTO> itensDto) {
        Fiado fiado = fiadoRepository.findById(fiadoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fiado não encontrado"));

        AddItensAoFiado(fiado, itensDto);

        Fiado fiadoSalvo = fiadoRepository.save(fiado);
        return FiadotoDTO(fiadoSalvo);
    }

    public FiadoDTO editarItem(Long fiadoId, Long itemId, ItemFiadoDTO itemDto) {
        Fiado fiado = fiadoRepository.findById(fiadoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fiado não encontrado"));

        ItemFiado item = fiado.getItens().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item não encontrado"));

        item.setNomeProduto(itemDto.getNomeProduto());
        item.setQuantidade(itemDto.getQuantidade());

        Fiado fiadoSalvo = fiadoRepository.save(fiado);
        return FiadotoDTO(fiadoSalvo);
    }

    public FiadoDTO removerItem(Long fiadoId, Long itemId) {
        Fiado fiado = fiadoRepository.findById(fiadoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fiado não encontrado"));

        ItemFiado item = fiado.getItens().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item não encontrado"));

        fiado.getItens().remove(item);

        Fiado fiadoSalvo = fiadoRepository.save(fiado);
        return FiadotoDTO(fiadoSalvo);
    }


    //metodos auxiliares ================================================
    private FiadoDTO FiadotoDTO(Fiado fiado) {
        FiadoDTO dto = new FiadoDTO();
        dto.setId(fiado.getId());
        dto.setData(fiado.getData());
        if (fiado.getCliente() != null) {
            dto.setClienteId(fiado.getCliente().getId());
        }
        dto.setItens(fiado.getItens().stream().map(this::itemToDTO).collect(Collectors.toList()));
        return dto;
    }

    private ItemFiadoDTO itemToDTO(ItemFiado item) {
        ItemFiadoDTO dto = new ItemFiadoDTO();
        dto.setId(item.getId());
        dto.setNomeProduto(item.getNomeProduto());
        dto.setQuantidade(item.getQuantidade());
        return dto;
    }

    private void AddItensAoFiado(Fiado fiado, List<ItemFiadoDTO> itensDto) {
        for (ItemFiadoDTO itemDto : itensDto) {
            ItemFiado item = new ItemFiado();
            item.setNomeProduto(itemDto.getNomeProduto());
            item.setQuantidade(itemDto.getQuantidade());
            item.setFiado(fiado);
            fiado.getItens().add(item);
        }
    }
}
