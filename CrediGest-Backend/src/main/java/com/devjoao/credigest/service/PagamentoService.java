package com.devjoao.credigest.service;

import com.devjoao.credigest.dto.ClienteDTO;
import com.devjoao.credigest.dto.FiadoDTO;
import com.devjoao.credigest.dto.PagamentoDTO;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PagamentoService {

    @Autowired
    PagamentoRepository pagamentoRepository;

    @Autowired
    FiadoRepository fiadoRepository;

    @Autowired
    ClienteRepository clienteRepository;

    public void registrarPagamento(Long clienteId, BigDecimal valor) {

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Pagamento pagamento = new Pagamento();

        pagamento.setCliente(cliente);
        pagamento.setValor(valor);
        pagamento.setData(LocalDateTime.now());

        pagamentoRepository.save(pagamento);
    }

    public BigDecimal calcularSaldoCliente(Long clienteId){

        List<Fiado> fiados = fiadoRepository.findByClienteId(clienteId);
        List<Pagamento> pagamentos = pagamentoRepository.findByClienteId(clienteId);

        BigDecimal totalFiados = fiados.stream()
                .map(Fiado::calcularValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPagamentos = pagamentos.stream()
                .map(Pagamento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalFiados.subtract(totalPagamentos);
    }

    public List<PagamentoDTO> listarPagamentos(Long clienteId) {
        List<Pagamento> pagamentos = pagamentoRepository.findByClienteId(clienteId);

        return pagamentos.stream().map(p -> {
            PagamentoDTO dto = new PagamentoDTO();
            dto.setId(p.getId());
            dto.setClienteId(p.getCliente().getId());
            dto.setValorPago(p.getValor());
            dto.setData(p.getData());
            return dto;
        }).toList();
    }

    public void excluirPagamento(Long pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pagamento não encontrado"));
        pagamentoRepository.delete(pagamento);
    }

    public PagamentoDTO editar(Long id, PagamentoDTO dto) {
        Pagamento pagamento = pagamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pagamento não encontrado"));

        if (dto.getData() != null) {
            pagamento.setData(dto.getData());
        }

        if (dto.getValorPago() != null) {
            pagamento.setValor(dto.getValorPago());
        }

        Pagamento pagamentoSalvo = pagamentoRepository.save(pagamento);

        return PagamentoToDTO(pagamentoSalvo);
    }

    //metodo conversor de entity para DTO
    private PagamentoDTO PagamentoToDTO(Pagamento pagamento) {
        PagamentoDTO dto = new PagamentoDTO();
        dto.setId(pagamento.getId());
        dto.setData(pagamento.getData());
        dto.setValorPago(pagamento.getValor());
        return dto;
    }
}
