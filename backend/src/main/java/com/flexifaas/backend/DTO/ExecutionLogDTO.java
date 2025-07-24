package com.flexifaas.backend.DTO;

import java.sql.Timestamp;

public class ExecutionLogDTO {

    private Long id;
    private Long functionId;
    private Long userId;
    private String inputPayload;
    private String output;
    private String status;
    private String errorMessage;
    private Timestamp executionTime;

    public ExecutionLogDTO() {}

    public ExecutionLogDTO(Long id, Long functionId, Long userId, String inputPayload, String output, String status, String errorMessage, Timestamp executionTime) {
        this.id = id;
        this.functionId = functionId;
        this.userId = userId;
        this.inputPayload = inputPayload;
        this.output = output;
        this.status = status;
        this.errorMessage = errorMessage;
        this.executionTime = executionTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFunctionId() {
        return functionId;
    }

    public void setFunctionId(Long functionId) {
        this.functionId = functionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getInputPayload() {
        return inputPayload;
    }

    public void setInputPayload(String inputPayload) {
        this.inputPayload = inputPayload;
    }

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Timestamp getExecutionTime() {
        return executionTime;
    }

    public void setExecutionTime(Timestamp executionTime) {
        this.executionTime = executionTime;
    }
}
