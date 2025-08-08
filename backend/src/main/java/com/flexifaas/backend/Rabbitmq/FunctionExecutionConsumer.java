package com.flexifaas.backend.Rabbitmq;

import com.flexifaas.backend.DTO.FunctionExecutionRequest;
import com.flexifaas.backend.Model.ExecutionLog;
import com.flexifaas.backend.Model.Function;
import com.flexifaas.backend.Model.User;
import com.flexifaas.backend.Util.MiddlewareCryptoClient;
import com.flexifaas.backend.repository.ExecutionLogRepository;
import com.flexifaas.backend.repository.FunctionRepository;
import com.flexifaas.backend.repository.UserRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class FunctionExecutionConsumer {

    @Autowired
    private FunctionRepository functionRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ExecutionLogRepository executionLogRepository;

    @RabbitListener(queues = "function-execution-queue")
    public void handleFunctionExecution(FunctionExecutionRequest request) {
        Long functionId = request.getFunctionId();
        Long userId = request.getUserId();
        String inputPayload = request.getInputPayload();

        Function function = functionRepository.findById(functionId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);

        String encryptedFilePath  = function != null ? function.getFilePath() : null;
        String runtime = function != null ? function.getRuntime().toLowerCase() : null;
        String output = null;
        String error = null;
        String status = "SUCCESS";
        Timestamp execTime = new Timestamp(System.currentTimeMillis());

        File tempDir = null;
        File codeFile = null;

        try {
            // DECRYPT FILE
            assert encryptedFilePath != null;
            File encryptedFile = new File(encryptedFilePath);

            byte[] decryptedBytes;
            if (encryptedFilePath.endsWith(".py.enc") || encryptedFilePath.endsWith(".js.enc") || encryptedFilePath.endsWith(".java.enc") || encryptedFilePath.endsWith(".txt.enc")) {
                // Try base64 decode (from /uploadText)
                decryptedBytes = MiddlewareCryptoClient.decryptTextFileAsCode(encryptedFile);
            } else {
                // Normal file upload
                decryptedBytes = MiddlewareCryptoClient.decryptFile(encryptedFile);
            }

            // Prepare arg list
            List<String> argList = new ArrayList<>();
            if (inputPayload != null && !inputPayload.trim().isEmpty()) {
                String[] parts = inputPayload.trim().split("\\s+");
                for (String part : parts) {
                    argList.add(part);
                }
            }

            if ("java".equals(runtime)) {
                // Extract public class name
                String javaCode = new String(decryptedBytes, StandardCharsets.UTF_8);
                Pattern classPattern = Pattern.compile("public\\s+class\\s+(\\w+)");
                Matcher matcher = classPattern.matcher(javaCode);
                String className = null;
                if (matcher.find()) {
                    className = matcher.group(1);
                } else {
                    throw new RuntimeException("Could not determine public class name from Java file");
                }

                // Create temp dir & write file
                tempDir = Files.createTempDirectory("java_exec_").toFile();
                tempDir.deleteOnExit();
                codeFile = new File(tempDir, className + ".java");
                try (FileOutputStream fos = new FileOutputStream(codeFile)) {
                    fos.write(decryptedBytes);
                }
                codeFile.deleteOnExit();

                // Compile
                ProcessBuilder compilePb = new ProcessBuilder("javac", codeFile.getName());
                compilePb.directory(tempDir);
                Process compileProcess = compilePb.start();
                int compileResult = compileProcess.waitFor();
                if (compileResult != 0) {
                    BufferedReader compileErrorReader = new BufferedReader(new InputStreamReader(compileProcess.getErrorStream()));
                    StringBuilder compileErr = new StringBuilder();
                    String compileLine;
                    while ((compileLine = compileErrorReader.readLine()) != null) {
                        compileErr.append(compileLine).append("\n");
                    }
                    throw new RuntimeException("Java compilation failed:\n" + compileErr.toString());
                }

                // Build run command
                List<String> runCmd = new ArrayList<>();
                runCmd.add("java");
                runCmd.add("-cp");
                runCmd.add(tempDir.getAbsolutePath());
                runCmd.add(className);
                runCmd.addAll(argList);

                // Run
                ProcessBuilder runPb = new ProcessBuilder(runCmd);
                runPb.directory(tempDir);
                runPb.redirectErrorStream(true);
                Process runProcess = runPb.start();

                // No stdin payload needed for CLI arg mode

                BufferedReader reader = new BufferedReader(new InputStreamReader(runProcess.getInputStream()));
                StringBuilder outputBuilder = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    outputBuilder.append(line).append("\n");
                }
                int exitCode = runProcess.waitFor();
                output = outputBuilder.toString().trim();

                if (exitCode != 0) {
                    status = "FAILED";
                    error = output;
                    output = null;
                }
            }
            // PYTHON
            else if ("python".equals(runtime)) {
                codeFile = File.createTempFile("decrypted_", ".py");
                try (FileOutputStream fos = new FileOutputStream(codeFile)) {
                    fos.write(decryptedBytes);
                }
                codeFile.deleteOnExit();

                List<String> cmd = new ArrayList<>();
                cmd.add("python");
                cmd.add(codeFile.getAbsolutePath());
                cmd.addAll(argList);

                ProcessBuilder pb = new ProcessBuilder(cmd);
                pb.redirectErrorStream(true);
                Process process = pb.start();

                // No stdin payload needed

                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                StringBuilder outputBuilder = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    outputBuilder.append(line).append("\n");
                }
                int exitCode = process.waitFor();
                output = outputBuilder.toString().trim();

                if (exitCode != 0) {
                    status = "FAILED";
                    error = output;
                    output = null;
                }
            }
            // JS
            else if ("js".equals(runtime) || "javascript".equals(runtime)) {
                codeFile = File.createTempFile("decrypted_", ".js");
                try (FileOutputStream fos = new FileOutputStream(codeFile)) {
                    fos.write(decryptedBytes);
                }
                codeFile.deleteOnExit();

                List<String> cmd = new ArrayList<>();
                cmd.add("node");
                cmd.add(codeFile.getAbsolutePath());
                cmd.addAll(argList);

                ProcessBuilder pb = new ProcessBuilder(cmd);
                pb.redirectErrorStream(true);
                Process process = pb.start();

                // No stdin payload needed

                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                StringBuilder outputBuilder = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    outputBuilder.append(line).append("\n");
                }
                int exitCode = process.waitFor();
                output = outputBuilder.toString().trim();

                if (exitCode != 0) {
                    status = "FAILED";
                    error = output;
                    output = null;
                }
            } else {
                throw new IllegalArgumentException("Unsupported runtime: " + runtime);
            }

        } catch (Exception e) {
            status = "ERROR";
            error = e.getMessage();
        } finally {
            if (codeFile != null) codeFile.delete();
            if (tempDir != null) tempDir.delete();
        }

        // Save execution log
        if (function != null && user != null) {
            ExecutionLog log = new ExecutionLog();
            log.setFunction(function);
            log.setUser(user);
            log.setInputPayload(inputPayload);
            log.setOutput(output);
            log.setStatus(status);
            log.setErrorMessage(error);
            log.setExecutionTime(execTime);
            executionLogRepository.save(log);
        }
    }
}
