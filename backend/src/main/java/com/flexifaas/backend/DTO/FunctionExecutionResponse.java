package com.flexifaas.backend.DTO;

import java.sql.Timestamp;

public class FunctionExecutionResponse {

    private String output;
    private String status;
    private String errorMessage;
    private Timestamp executionTime;

    public FunctionExecutionResponse(){}

    public FunctionExecutionResponse(String output, String status, String errorMessage, Timestamp executionTime) {
        this.output = output;
        this.status = status;
        this.errorMessage = errorMessage;
        this.executionTime = executionTime;
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
