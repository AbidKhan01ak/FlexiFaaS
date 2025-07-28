package com.flexifaas.backend.Service.Impl;

import com.flexifaas.backend.DTO.FunctionDTO;
import com.flexifaas.backend.DTO.FunctionExecutionRequest;
import com.flexifaas.backend.DTO.FunctionExecutionResponse;
import com.flexifaas.backend.Model.Function;
import com.flexifaas.backend.Model.User;
import com.flexifaas.backend.Service.FunctionService;
import com.flexifaas.backend.exception.ResourceNotFoundException;
import com.flexifaas.backend.repository.FunctionRepository;
import com.flexifaas.backend.repository.UserRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Service
public class FunctionServiceImpl implements FunctionService {

    private final FunctionRepository functionRepository;
    private final UserRepository userRepository;

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.queue.name:function-execution-queue}")
    private String functionQueueName;
    @Value("${app.uploads-dir}")
    private String uploadsDir;

    @Autowired
    public FunctionServiceImpl(FunctionRepository functionRepository, UserRepository userRepository,
                               RabbitTemplate rabbitTemplate){
        this.functionRepository = functionRepository;
        this.userRepository = userRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public FunctionDTO uploadFunction(FunctionDTO functionDTO, Long userId, String fileName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        File uploadFolder = new File(uploadsDir);

        // If fileName is only the file name (not absolute), construct absolute path:
        File file = new File(fileName);
        String actualFilePath = file.isAbsolute() ? fileName : uploadsDir + File.separator + fileName;

        Function function = new Function();
        function.setOwner(user);
        function.setName(functionDTO.getName());
        function.setRuntime(functionDTO.getRuntime());
        function.setFilePath(actualFilePath);
        function.setVersion(functionDTO.getVersion());
        function.setUploadTime(new Timestamp(System.currentTimeMillis()));
        function.setLastModified(new Timestamp(System.currentTimeMillis()));
        function.setStatus("ACTIVE");
        function.setDescription(functionDTO.getDescription());

        functionRepository.save(function);

        functionDTO.setId(function.getId());
        functionDTO.setOwnerId(userId);
        functionDTO.setVersion(function.getVersion());
        functionDTO.setUploadTime(function.getUploadTime());
        functionDTO.setLastModified(function.getLastModified());
        functionDTO.setStatus(function.getStatus());

        return functionDTO;
    }


    @Override
    public FunctionDTO getFunctionById(Long id) {
        Function function = functionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Function not found with ID: " + id));

        FunctionDTO dto = new FunctionDTO();
        dto.setId(function.getId());
        dto.setName(function.getName());
        dto.setRuntime(function.getRuntime());
        dto.setVersion(function.getVersion());
        dto.setDescription(function.getDescription());
        dto.setStatus(function.getStatus());
        dto.setUploadTime(function.getUploadTime());
        dto.setLastModified(function.getLastModified());
        dto.setOwnerId(function.getOwner().getId());
        return dto;
    }

    @Override
    public List<FunctionDTO> getFunctionsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        List<Function> functions = functionRepository.findByOwner(user);
        List<FunctionDTO> dtos = new ArrayList<>();
        for (Function function : functions) {
            FunctionDTO dto = new FunctionDTO();
            dto.setId(function.getId());
            dto.setName(function.getName());
            dto.setRuntime(function.getRuntime());
            dto.setVersion(function.getVersion());
            dto.setDescription(function.getDescription());
            dto.setStatus(function.getStatus());
            dto.setUploadTime(function.getUploadTime());
            dto.setLastModified(function.getLastModified());
            dto.setOwnerId(userId);
            dtos.add(dto);
        }
        return dtos;
    }

    @Override
    public List<FunctionDTO> getAllFunctions() {
        List<Function> functions = functionRepository.findAll();
        List<FunctionDTO> dtos = new ArrayList<>();
        for (Function function : functions) {
            FunctionDTO dto = new FunctionDTO();
            dto.setId(function.getId());
            dto.setName(function.getName());
            dto.setRuntime(function.getRuntime());
            dto.setVersion(function.getVersion());
            dto.setDescription(function.getDescription());
            dto.setStatus(function.getStatus());
            dto.setUploadTime(function.getUploadTime());
            dto.setLastModified(function.getLastModified());
            dto.setOwnerId(function.getOwner().getId());
            dtos.add(dto);
        }
        return dtos;
    }

    @Override
    public FunctionDTO updateFunction(FunctionDTO functionDTO, Long functionId) {
        Function function = functionRepository.findById(functionId)
                .orElseThrow(() -> new ResourceNotFoundException("Function not found with ID: " + functionId));

        function.setName(functionDTO.getName());
        function.setDescription(functionDTO.getDescription());
        function.setLastModified(new Timestamp(System.currentTimeMillis()));
        functionRepository.save(function);

        functionDTO.setId(function.getId());
        functionDTO.setVersion(function.getVersion());
        functionDTO.setUploadTime(function.getUploadTime());
        functionDTO.setLastModified(function.getLastModified());
        functionDTO.setStatus(function.getStatus());
        functionDTO.setOwnerId(function.getOwner().getId());

        return functionDTO;
    }

    @Override
    public void deleteFunction(Long functionId) {
        if (!functionRepository.existsById(functionId)) {
            throw new ResourceNotFoundException("Function not found with ID: " + functionId);
        }
        functionRepository.deleteById(functionId);
    }

    @Override
    public FunctionExecutionResponse executeFunction(Long functionId, Long userId, String inputPayload){
        FunctionExecutionRequest request = new FunctionExecutionRequest();
        request.setFunctionId(functionId);
        request.setUserId(userId);
        request.setInputPayload(inputPayload);

        // Send to RabbitMQ queue for async execution
        rabbitTemplate.convertAndSend(functionQueueName, request);

        // Build and return immediate response (job is QUEUED)
        FunctionExecutionResponse response = new FunctionExecutionResponse();
        response.setStatus("QUEUED");
        response.setOutput(null);
        response.setErrorMessage(null);
        response.setExecutionTime(new java.sql.Timestamp(System.currentTimeMillis()));

        return response;
    }
}
