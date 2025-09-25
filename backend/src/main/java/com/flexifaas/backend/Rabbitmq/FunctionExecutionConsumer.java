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

        String encryptedFilePath  = (function != null) ? function.getFilePath() : null;
        String runtimeRaw         = (function != null && function.getRuntime() != null)
                ? function.getRuntime().toLowerCase().trim()
                : null;

        String output = null;
        String error  = null;
        String status = "SUCCESS";
        Timestamp execTime = new Timestamp(System.currentTimeMillis());

        File tempDir = null;
        File srcDir  = null;
        File outDir  = null;
        File codeFile = null;

        try {
            if (encryptedFilePath == null) {
                throw new IllegalStateException("Function file path is null");
            }
            File encryptedFile = new File(encryptedFilePath);

            // ---------- Robust decrypt: try binary, then text ----------
            byte[] decryptedBytes = robustDecrypt(encryptedFile);

            // ---------- Build arg list from payload (whitespace-separated) ----------
            List<String> argList = new ArrayList<>();
            if (inputPayload != null && !inputPayload.trim().isEmpty()) {
                String[] parts = inputPayload.trim().split("\\s+");
                for (String part : parts) {
                    if (!part.isEmpty()) argList.add(part);
                }
            }

            // ---------- Normalize runtime ----------
            String runtime = normalizeRuntime(runtimeRaw);

            if ("java".equals(runtime)) {
                // Read source as string for package/class parsing
                String javaSource = new String(decryptedBytes, StandardCharsets.UTF_8);

                // Basic sanity check
                if (!javaSource.contains("class")) {
                    throw new RuntimeException("Decryption succeeded but content doesn't look like Java source.");
                }

                JavaClassInfo info = extractJavaClassInfo(javaSource);
                if (info.className == null) {
                    throw new RuntimeException("Could not determine public class name from Java file.");
                }

                // temp structure: tempDir/src/...  & tempDir/bin
                tempDir = Files.createTempDirectory("java_exec_").toFile();
                tempDir.deleteOnExit();
                srcDir = new File(tempDir, "src");
                outDir = new File(tempDir, "bin");
                srcDir.mkdirs();
                outDir.mkdirs();
                srcDir.deleteOnExit();
                outDir.deleteOnExit();

                // If package present, mirror folders under src
                File packageDir = (info.packageName != null)
                        ? new File(srcDir, info.packageName.replace('.', File.separatorChar))
                        : srcDir;
                packageDir.mkdirs();

                codeFile = new File(packageDir, info.className + ".java");
                try (FileOutputStream fos = new FileOutputStream(codeFile)) {
                    fos.write(decryptedBytes);
                }
                codeFile.deleteOnExit();

                // Compile: javac -d bin src/<...>/<Class>.java
                ProcResult compileRes = runProcess(new ProcessBuilder(
                        "javac", "-d", outDir.getAbsolutePath(), codeFile.getAbsolutePath()
                ).directory(tempDir));
                if (compileRes.exitCode != 0) {
                    throw new RuntimeException("Java compilation failed:\n" + compileRes.output);
                }

                // Run: java -cp bin <FQCN> [args...]
                List<String> runCmd = new ArrayList<>();
                runCmd.add("java");
                runCmd.add("-cp");
                runCmd.add(outDir.getAbsolutePath());
                runCmd.add(info.fqcn());             // package.Class or Class
                runCmd.addAll(argList);

                ProcResult runRes = runProcess(new ProcessBuilder(runCmd).directory(tempDir));
                if (runRes.exitCode != 0) {
                    status = "FAILED";
                    error = runRes.output;
                } else {
                    output = runRes.output;
                }
            }
            else if ("python".equals(runtime)) {
                codeFile = File.createTempFile("flexifaas_", ".py");
                try (FileOutputStream fos = new FileOutputStream(codeFile)) {
                    fos.write(decryptedBytes);
                }
                codeFile.deleteOnExit();

                List<String> cmd = new ArrayList<>();
                cmd.add("python");
                cmd.add(codeFile.getAbsolutePath());
                cmd.addAll(argList);

                ProcResult res = runProcess(new ProcessBuilder(cmd));
                if (res.exitCode != 0) {
                    status = "FAILED";
                    error = res.output;
                } else {
                    output = res.output;
                }
            }
            else if ("javascript".equals(runtime)) {
                codeFile = File.createTempFile("flexifaas_", ".js");
                try (FileOutputStream fos = new FileOutputStream(codeFile)) {
                    fos.write(decryptedBytes);
                }
                codeFile.deleteOnExit();

                List<String> cmd = new ArrayList<>();
                cmd.add("node");
                cmd.add(codeFile.getAbsolutePath());
                cmd.addAll(argList);

                ProcResult res = runProcess(new ProcessBuilder(cmd));
                if (res.exitCode != 0) {
                    status = "FAILED";
                    error = res.output;
                } else {
                    output = res.output;
                }
            }
            else {
                throw new IllegalArgumentException("Unsupported runtime: " + runtimeRaw);
            }

        } catch (Exception e) {
            status = "ERROR";
            error = e.getMessage();
        } finally {
            // Best-effort cleanup
            safeDelete(codeFile);
            safeDeleteDir(outDir);
            safeDeleteDir(srcDir);
            safeDeleteDir(tempDir);
        }

        // ---------- Save execution log ----------
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

    // =========================================================
    // Helpers
    // =========================================================

    private static byte[] robustDecrypt(File encryptedFile) throws Exception {
        List<String> errors = new ArrayList<>();
        // 1) Try normal binary file decryption first
        try {
            return MiddlewareCryptoClient.decryptFile(encryptedFile);
        } catch (Exception e1) {
            errors.add("binary:" + e1.getMessage());
            // 2) Fallback for base64-wrapped text uploads
            try {
                return MiddlewareCryptoClient.decryptTextFileAsCode(encryptedFile);
            } catch (Exception e2) {
                errors.add("text:" + e2.getMessage());
                throw new RuntimeException("Decryption failed (tried binary then text): " + String.join(" | ", errors));
            }
        }
    }

    private static String normalizeRuntime(String runtimeRaw) {
        if (runtimeRaw == null) return "unknown";
        // Accept variants like "java17", "python3.10", "nodejs18", etc.
        if (runtimeRaw.startsWith("java")) return "java";
        if (runtimeRaw.startsWith("python")) return "python";
        if (runtimeRaw.startsWith("node") || runtimeRaw.equals("js") || runtimeRaw.equals("javascript"))
            return "javascript";
        return runtimeRaw;
    }

    private static class JavaClassInfo {
        final String packageName; // may be null
        final String className;   // never null if parsed
        JavaClassInfo(String pkg, String cls) { this.packageName = pkg; this.className = cls; }
        String fqcn() { return (packageName == null || packageName.isEmpty()) ? className : packageName + "." + className; }
    }

    private static JavaClassInfo extractJavaClassInfo(String source) {
        // package com.example.demo;
        Pattern pkgPat = Pattern.compile("\\bpackage\\s+([a-zA-Z_][\\w\\.]*);");
        Matcher pkgM = pkgPat.matcher(source);
        String pkg = null;
        if (pkgM.find()) {
            pkg = pkgM.group(1);
        }

        // public class HelloWorld { ... }
        Pattern clsPat = Pattern.compile("\\bpublic\\s+class\\s+([A-Za-z_][A-Za-z0-9_]*)\\b");
        Matcher clsM = clsPat.matcher(source);
        String cls = null;
        if (clsM.find()) {
            cls = clsM.group(1);
        }
        return new JavaClassInfo(pkg, cls);
    }

    private static class ProcResult {
        final int exitCode;
        final String output;
        ProcResult(int exitCode, String output) { this.exitCode = exitCode; this.output = output; }
    }

    private static ProcResult runProcess(ProcessBuilder pb) throws IOException, InterruptedException {
        pb.redirectErrorStream(true);
        Process p = pb.start();
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append('\n');
            }
        }
        int exit = p.waitFor();
        return new ProcResult(exit, sb.toString().trim());
    }

    private static void safeDelete(File f) {
        if (f != null) {
            try { f.delete(); } catch (Exception ignored) {}
        }
    }

    private static void safeDeleteDir(File dir) {
        if (dir != null && dir.exists()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File child : files) {
                    if (child.isDirectory()) safeDeleteDir(child);
                    else safeDelete(child);
                }
            }
            safeDelete(dir);
        }
    }
}
