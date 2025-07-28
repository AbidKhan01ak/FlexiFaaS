package com.flexifaas.backend.Controller;

import com.flexifaas.backend.DTO.FunctionDTO;
import com.flexifaas.backend.DTO.FunctionExecutionRequest;
import com.flexifaas.backend.DTO.FunctionExecutionResponse;
import com.flexifaas.backend.DTO.FunctionUploadRequest;
import com.flexifaas.backend.Service.FunctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/functions")
public class FunctionController {

    private final FunctionService functionService;

    @Value("${app.uploads-dir}")
    private String uploadsDir;

    @Autowired
    public FunctionController(FunctionService functionService){
        this.functionService = functionService;
    }

    // Upload new function (metadata + file)
    @PostMapping("/upload")
    public ResponseEntity<FunctionDTO> uploadFunction(
            @RequestParam("file") MultipartFile file,
            @ModelAttribute FunctionUploadRequest request,
            @RequestParam("userId") Long userId
    ) {
        String fileName = file.getOriginalFilename();
        FunctionDTO dto = new FunctionDTO();
        dto.setName(request.getName());
        dto.setRuntime(request.getRuntime());
        dto.setDescription(request.getDescription());

        FunctionDTO saved = functionService.uploadFunction(dto, userId, fileName);
        return ResponseEntity.ok(saved);
    }

    // Get function by ID
    @GetMapping("/{id}")
    public ResponseEntity<FunctionDTO> getFunctionById(@PathVariable Long id) {
        FunctionDTO function = functionService.getFunctionById(id);
        if (function == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(function);
    }

    // Get all functions
    @GetMapping
    public ResponseEntity<List<FunctionDTO>> getAllFunctions() {
        List<FunctionDTO> functions = functionService.getAllFunctions();
        return ResponseEntity.ok(functions);
    }

    // Get all functions by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FunctionDTO>> getFunctionsByUser(@PathVariable Long userId) {
        List<FunctionDTO> functions = functionService.getFunctionsByUser(userId);
        return ResponseEntity.ok(functions);
    }

    // Update function (basic fields)
    @PutMapping("/{id}")
    public ResponseEntity<FunctionDTO> updateFunction(
            @PathVariable Long id,
            @RequestBody FunctionDTO dto
    ) {
        FunctionDTO updated = functionService.updateFunction(dto, id);
        if (updated == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    // Delete function by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFunction(@PathVariable Long id) {
        functionService.deleteFunction(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/uploadText")
    public ResponseEntity<FunctionDTO> uploadFunctionAsText(
            @RequestParam("code") String code,
            @RequestParam("name") String name,
            @RequestParam("runtime") String runtime,
            @RequestParam("description") String description,
            @RequestParam("userId") Long userId
    ) {
        try {
            // Save the pasted code as a file on the server
            String fileName = saveCodeToFileOnServer(code, name, runtime, userId);
            FunctionDTO dto = new FunctionDTO();
            dto.setName(name);
            dto.setRuntime(runtime);
            dto.setDescription(description);
            FunctionDTO saved = functionService.uploadFunction(dto, userId, fileName);
            if (saved == null) {
                return ResponseEntity.badRequest().body(null);
            }
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/execute")
    public ResponseEntity<FunctionExecutionResponse> executeFunction(@RequestBody FunctionExecutionRequest request) {
        FunctionExecutionResponse response = functionService.executeFunction(
                request.getFunctionId(),
                request.getUserId(),
                request.getInputPayload()
        );
        return ResponseEntity.ok(response);
    }


    private String saveCodeToFileOnServer(String code, String name, String runtime, Long userId) throws IOException {
        // Choose file extension based on runtime
        String ext = runtime.equalsIgnoreCase("python") ? ".py" :
                runtime.equalsIgnoreCase("js") ? ".js" :
                        runtime.equalsIgnoreCase("java") ? ".java" : ".txt";

        // Sanitize file name
        String fileName = "user" + userId + "_" + name.replaceAll("[^a-zA-Z0-9]", "_") + ext;

        java.nio.file.Files.createDirectories(java.nio.file.Paths.get(uploadsDir));
        java.nio.file.Path filePath = java.nio.file.Paths.get(uploadsDir, fileName);

        java.nio.file.Files.writeString(filePath, code);
        return fileName;
    }
}
