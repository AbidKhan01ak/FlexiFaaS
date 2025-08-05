package com.flexifaas.middleware.Controller;

import com.flexifaas.middleware.Service.CryptoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/crypto")
public class CryptoController {

    @Autowired
    private CryptoService cryptoService;

    // Encrypts file or code text
    @PostMapping("/encrypt")
    public ResponseEntity<?> encryptFile(@RequestParam(value = "file", required = false) MultipartFile file,
                                         @RequestParam(value = "code", required = false) String code) {
        try {
            // Option 1: File upload
            if (file != null) {
                byte[] encrypted = cryptoService.encryptFile(file.getBytes());
                return ResponseEntity.ok()
                        .header("Content-Disposition", "attachment; filename=\"" + file.getOriginalFilename() + ".enc\"")
                        .body(encrypted);
            }
            // Option 2: Code as text
            if (code != null) {
                String encrypted = cryptoService.encryptText(code);
                return ResponseEntity.ok(encrypted);
            }
            return ResponseEntity.badRequest().body("No input file or code provided.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Encryption failed: " + e.getMessage());
        }
    }

    // Decrypts file or encrypted text
    @PostMapping("/decrypt")
    public ResponseEntity<?> decryptFile(@RequestParam(value = "file", required = false) MultipartFile file,
                                         @RequestParam(value = "data", required = false) String encryptedData) {
        try {
            // Option 1: File upload
            if (file != null) {
                byte[] decrypted = cryptoService.decryptFile(file.getBytes());
                // Remove .enc if present
                String originalName = file.getOriginalFilename();
                if (originalName != null && originalName.endsWith(".enc"))
                    originalName = originalName.substring(0, originalName.length() - 4);
                return ResponseEntity.ok()
                        .header("Content-Disposition", "attachment; filename=\"" + (originalName == null ? "decrypted_file" : originalName) + "\"")
                        .body(decrypted);
            }
            // Option 2: Encrypted data as string
            if (encryptedData != null) {
                String decrypted = cryptoService.decryptText(encryptedData);
                return ResponseEntity.ok(decrypted);
            }
            return ResponseEntity.badRequest().body("No input file or encrypted data provided.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Decryption failed: " + e.getMessage());
        }
    }
}
