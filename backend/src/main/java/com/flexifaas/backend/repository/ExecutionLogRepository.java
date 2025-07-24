package com.flexifaas.backend.repository;

import com.flexifaas.backend.Model.ExecutionLog;
import com.flexifaas.backend.Model.Function;
import com.flexifaas.backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExecutionLogRepository extends JpaRepository<ExecutionLog, Long> {
    List<ExecutionLog> findByFunction(Function function);
    List<ExecutionLog> findByUser(User user);
    List<ExecutionLog> findByStatus(String status);
}
