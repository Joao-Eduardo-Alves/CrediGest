package com.devjoao.credigest.repository;

import com.devjoao.credigest.entity.Cliente;
import com.devjoao.credigest.entity.Fiado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long>{}
