package com.devjoao.credigest.repository;

import com.devjoao.credigest.entity.Fiado;
import com.devjoao.credigest.entity.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FiadoRepository extends JpaRepository<Fiado, Long> {
    List<Fiado> findByClienteId(Long clienteId);
}

