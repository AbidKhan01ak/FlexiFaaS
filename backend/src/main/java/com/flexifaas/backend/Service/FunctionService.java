package com.flexifaas.backend.Service;

import com.flexifaas.backend.DTO.FunctionDTO;
import com.flexifaas.backend.DTO.FunctionExecutionResponse;
import com.flexifaas.backend.Model.Function;

import java.util.List;

public interface FunctionService {
    FunctionDTO uploadFunction(FunctionDTO functionDTO, Long userId, String filePath);
    FunctionDTO getFunctionById(Long id);
    List<FunctionDTO> getFunctionsByUser(Long userId);
    List<FunctionDTO> getAllFunctions();
    FunctionDTO updateFunction(FunctionDTO functionDTO, Long functionId);
    void deleteFunction(Long functionId);
    FunctionExecutionResponse executeFunction(Long functionId, Long userId, String inputPayload);

}
