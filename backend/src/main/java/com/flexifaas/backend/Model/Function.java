package com.flexifaas.backend.Model;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "functions")
public class Function {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String runtime; // java, js, python

    private Integer version;

    private String filePath; // Path to encrypted code file

    private Timestamp uploadTime;
    private Timestamp lastModified;

    private String status; // ACTIVE, DEPRECATED

    private String description;


    @OneToMany(mappedBy = "function", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExecutionLog> executionLogs;

    public Function() {}

    public Function(Long id, User owner, String name, String runtime, Integer version,
                    String filePath, Timestamp uploadTime, Timestamp lastModified,
                    String status, String description, List<ExecutionLog> executionLogs) {
        this.id = id;
        this.owner = owner;
        this.name = name;
        this.runtime = runtime;
        this.version = version;
        this.filePath = filePath;
        this.uploadTime = uploadTime;
        this.lastModified = lastModified;
        this.status = status;
        this.description = description;
        this.executionLogs = executionLogs;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
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

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<ExecutionLog> getExecutionLogs() {
        return executionLogs;
    }

    public void setExecutionLogs(List<ExecutionLog> executionLogs) {
        this.executionLogs = executionLogs;
    }

}
