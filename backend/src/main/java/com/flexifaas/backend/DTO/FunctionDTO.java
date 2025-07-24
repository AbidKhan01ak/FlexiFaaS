package com.flexifaas.backend.DTO;

import com.flexifaas.backend.Model.Function;

import java.sql.Timestamp;

public class FunctionDTO {

    private Long id;
    private String name;
    private String runtime;
    private Integer version;
    private String description;
    private String status;
    private Timestamp uploadTime;
    private Timestamp lastModified;
    private Long ownerId; // To reference User (if needed)



    public FunctionDTO() {}

    public FunctionDTO(Long id, String name, String runtime, Integer version,
                       String description, String status, Timestamp uploadTime, Timestamp lastModified,
                       Long ownerId) {
        this.id = id;
        this.name = name;
        this.runtime = runtime;
        this.version = version;
        this.description = description;
        this.status = status;
        this.uploadTime = uploadTime;
        this.lastModified = lastModified;
        this.ownerId = ownerId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getUploadTime() {
        return uploadTime;
    }

    public void setUploadTime(Timestamp uploadTime) {
        this.uploadTime = uploadTime;
    }

    public Timestamp getLastModified() {
        return lastModified;
    }

    public void setLastModified(Timestamp lastModified) {
        this.lastModified = lastModified;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}
