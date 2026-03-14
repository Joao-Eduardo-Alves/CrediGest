package com.devjoao.credigest.service;

import com.devjoao.credigest.entity.Cliente;
import com.devjoao.credigest.entity.Fiado;
import com.devjoao.credigest.entity.Pagamento;
import com.devjoao.credigest.repository.ClienteRepository;
import com.devjoao.credigest.repository.FiadoRepository;
import com.devjoao.credigest.repository.PagamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        pagamento.setDataPagamento(LocalDateTime.now());

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
}
