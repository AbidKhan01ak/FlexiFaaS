package com.flexifaas.backend.Controller;

import com.flexifaas.backend.DTO.ExecutionLogDTO;
import com.flexifaas.backend.Service.ExecutionLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class ExecutionLogController {

    private final ExecutionLogService executionLogService;

    @Autowired
    public ExecutionLogController(ExecutionLogService executionLogService){
        this.executionLogService = executionLogService;
    }

    // Get all logs
    @GetMapping
    public ResponseEntity<List<ExecutionLogDTO>> getAllLogs() {
        List<ExecutionLogDTO> logs = executionLogService.getAllLogs();
        return ResponseEntity.ok(logs);
    }

    // Get logs by function ID
    @GetMapping("/function/{functionId}")
    public ResponseEntity<List<ExecutionLogDTO>> getLogsByFunctionId(@PathVariable Long functionId) {
        List<ExecutionLogDTO> logs = executionLogService.getLogsByFunctionId(functionId);
        return ResponseEntity.ok(logs);
    }

    // Get logs by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ExecutionLogDTO>> getLogsByUserId(@PathVariable Long userId) {
        List<ExecutionLogDTO> logs = executionLogService.getLogsByUserId(userId);
        return ResponseEntity.ok(logs);
    }

    // Add new execution log (used internally after function execution)
    @PostMapping
    public ResponseEntity<ExecutionLogDTO> addLog(@RequestBody ExecutionLogDTO logDTO) {
        ExecutionLogDTO savedLog = executionLogService.saveLog(logDTO);
        return ResponseEntity.ok(savedLog);
    }
}
