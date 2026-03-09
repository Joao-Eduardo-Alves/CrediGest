package com.devjoao.credigest.repository;

import com.devjoao.credigest.entity.Fiado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FiadoRepository extends JpaRepository<Fiado, Long> {}

