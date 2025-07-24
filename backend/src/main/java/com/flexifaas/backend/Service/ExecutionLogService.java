package com.flexifaas.backend.Service;

import com.flexifaas.backend.DTO.ExecutionLogDTO;

import java.util.List;

public interface ExecutionLogService {
    ExecutionLogDTO saveLog(ExecutionLogDTO logDTO);
    List<ExecutionLogDTO> getLogsByFunctionId(Long functionId);
    List<ExecutionLogDTO> getLogsByUserId(Long userId);
    List<ExecutionLogDTO> getAllLogs();
}
