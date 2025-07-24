package com.flexifaas.backend.DTO;

public class FunctionUploadRequest {

    private String name;
    private String runtime;
    private String description;

    public FunctionUploadRequest() {}

    public FunctionUploadRequest(String name, String runtime, String description) {
        this.name = name;
        this.runtime = runtime;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRuntime() {
        return runtime;
    }

    public void setRuntime(String runtime) {
        this.runtime = runtime;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
