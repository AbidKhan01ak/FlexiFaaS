package com.flexifaas.backend.DTO;

public class FunctionExecutionRequest {

    private Long functionId;
    private Long userId;
    private String inputPayload;

    public FunctionExecutionRequest(){}

    public FunctionExecutionRequest(Long functionId, Long userId, String inputPayload) {
        this.functionId = functionId;
        this.userId = userId;
        this.inputPayload = inputPayload;
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
}
