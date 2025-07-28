package com.flexifaas.backend.repository;

import com.flexifaas.backend.Model.Function;
import com.flexifaas.backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FunctionRepository extends JpaRepository<Function, Long> {
    List<Function> findByOwner(User owner);
    List<Function> findByName(String name);
    List<Function> findByStatus(String status);
}
