package com.flexifaas.backend.Service.Impl;

import com.flexifaas.backend.DTO.ExecutionLogDTO;
import com.flexifaas.backend.Model.ExecutionLog;
import com.flexifaas.backend.Model.Function;
import com.flexifaas.backend.Model.User;
import com.flexifaas.backend.Service.ExecutionLogService;
import com.flexifaas.backend.exception.ResourceNotFoundException;
import com.flexifaas.backend.repository.ExecutionLogRepository;
import com.flexifaas.backend.repository.FunctionRepository;
import com.flexifaas.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ExecutionLogServiceImpl implements ExecutionLogService {

    private final ExecutionLogRepository executionLogRepository;
    private final FunctionRepository functionRepository;
    private final UserRepository userRepository;

    @Autowired
    public ExecutionLogServiceImpl(ExecutionLogRepository executionLogRepository,
                                   FunctionRepository functionRepository,
                                   UserRepository userRepository){
        this.executionLogRepository = executionLogRepository;
        this.functionRepository = functionRepository;
        this.userRepository = userRepository;
    }
    @Override
    public ExecutionLogDTO saveLog(ExecutionLogDTO logDTO) {
        Function function = functionRepository.findById(logDTO.getFunctionId())
                .orElseThrow(() -> new ResourceNotFoundException("Function not found with ID: " + logDTO.getFunctionId()));
        User user = userRepository.findById(logDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + logDTO.getUserId()));


        ExecutionLog log = new ExecutionLog();
        log.setFunction(function);
        log.setUser(user);
        log.setInputPayload(logDTO.getInputPayload());
        log.setOutput(logDTO.getOutput());
        log.setStatus(logDTO.getStatus());
        log.setErrorMessage(logDTO.getErrorMessage());
        log.setExecutionTime(logDTO.getExecutionTime() != null
                ? logDTO.getExecutionTime()
                : new Timestamp(System.currentTimeMillis()));

        executionLogRepository.save(log);

        logDTO.setId(log.getId());
        logDTO.setExecutionTime(log.getExecutionTime());
        return logDTO;
    }

    @Override
    public List<ExecutionLogDTO> getLogsByFunctionId(Long functionId) {
        Function function = functionRepository.findById(functionId)
                .orElseThrow(() -> new ResourceNotFoundException("Function not found with ID: " + functionId));

        List<ExecutionLog> logs = executionLogRepository.findByFunction(function);
        List<ExecutionLogDTO> dtos = new ArrayList<>();
        for (ExecutionLog log : logs) {
            ExecutionLogDTO dto = new ExecutionLogDTO();
            dto.setId(log.getId());
            dto.setFunctionId(functionId);
            dto.setUserId(log.getUser().getId());
            dto.setInputPayload(log.getInputPayload());
            dto.setOutput(log.getOutput());
            dto.setStatus(log.getStatus());
            dto.setErrorMessage(log.getErrorMessage());
            dto.setExecutionTime(log.getExecutionTime());
            dtos.add(dto);
        }
        return dtos;
    }

    @Override
    public List<ExecutionLogDTO> getLogsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        List<ExecutionLog> logs = executionLogRepository.findByUser(user);
        List<ExecutionLogDTO> dtos = new ArrayList<>();
        for (ExecutionLog log : logs) {
            ExecutionLogDTO dto = new ExecutionLogDTO();
            dto.setId(log.getId());
            dto.setFunctionId(log.getFunction().getId());
            dto.setUserId(userId);
            dto.setInputPayload(log.getInputPayload());
            dto.setOutput(log.getOutput());
            dto.setStatus(log.getStatus());
            dto.setErrorMessage(log.getErrorMessage());
            dto.setExecutionTime(log.getExecutionTime());
            dtos.add(dto);
        }
        return dtos;
    }

    @Override
    public List<ExecutionLogDTO> getAllLogs() {
        List<ExecutionLog> logs = executionLogRepository.findAll();
        List<ExecutionLogDTO> dtos = new ArrayList<>();
        for (ExecutionLog log : logs) {
            ExecutionLogDTO dto = new ExecutionLogDTO();
            dto.setId(log.getId());
            dto.setFunctionId(log.getFunction().getId());
            dto.setUserId(log.getUser().getId());
            dto.setInputPayload(log.getInputPayload());
            dto.setOutput(log.getOutput());
            dto.setStatus(log.getStatus());
            dto.setErrorMessage(log.getErrorMessage());
            dto.setExecutionTime(log.getExecutionTime());
            dtos.add(dto);
        }
        return dtos;
    }
}
