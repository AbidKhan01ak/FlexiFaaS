package com.flexifaas.backend.Rabbitmq;

import com.flexifaas.backend.DTO.FunctionExecutionRequest;
import com.flexifaas.backend.Model.ExecutionLog;
import com.flexifaas.backend.Model.Function;
import com.flexifaas.backend.Model.User;
import com.flexifaas.backend.repository.ExecutionLogRepository;
import com.flexifaas.backend.repository.FunctionRepository;
import com.flexifaas.backend.repository.UserRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.*;
import java.sql.Timestamp;

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

        String filePath = function != null ? function.getFilePath() : null;
        String runtime = function != null ? function.getRuntime().toLowerCase() : null;
        String output = null;
        String error = null;
        String status = "SUCCESS";
        Timestamp execTime = new Timestamp(System.currentTimeMillis());

        try {
            ProcessBuilder pb;
            if ("python".equals(runtime)) {
                pb = new ProcessBuilder("python", filePath);
            } else if ("js".equals(runtime) || "javascript".equals(runtime)) {
                pb = new ProcessBuilder("node", filePath);
            } else if ("java".equals(runtime)) {
                File javaFile = new File(filePath);
                String fileDir = javaFile.getParent();
                String className = javaFile.getName().replace(".java", "");

                ProcessBuilder compilePb = new ProcessBuilder("javac", javaFile.getAbsolutePath());
                compilePb.directory(new File(fileDir));
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

                pb = new ProcessBuilder("java", "-cp", fileDir, className, inputPayload);
                pb.directory(new File(fileDir));
            } else {
                throw new IllegalArgumentException("Unsupported runtime: " + runtime);
            }

            pb.redirectErrorStream(true);
            Process process = pb.start();

            if (("python".equals(runtime) || "js".equals(runtime) || "javascript".equals(runtime))
                    && inputPayload != null && !inputPayload.trim().isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
                    writer.write(inputPayload);
                    writer.flush();
                }
            }

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream())
            );
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
        } catch (Exception e) {
            status = "ERROR";
            error = e.getMessage();
        }

        // Save execution log
        if(function != null && user != null) {
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
