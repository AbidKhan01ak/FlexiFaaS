package com.flexifaas.middleware.Service.Impl;

import com.flexifaas.middleware.Service.CryptoService;
import com.flexifaas.middleware.Util.AesEncryptionUtil;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Service
public class CryptoServiceImpl implements CryptoService {
    @Value("${encryption.aes-key}")
    private String base64SecretKey; // Can use separate property, eg. crypto.secret

    private SecretKey secretKey;

    @PostConstruct
    public void initKey() {
        this.secretKey = AesEncryptionUtil.getSecretKeyFromBase64(base64SecretKey);
    }

    @Override
    public byte[] encryptFile(byte[] inputFileBytes) throws Exception {
        return AesEncryptionUtil.encrypt(inputFileBytes, secretKey);
    }

    @Override
    public byte[] decryptFile(byte[] encryptedBytes) throws Exception {
        return AesEncryptionUtil.decrypt(encryptedBytes, secretKey);
    }

    @Override
    public String encryptText(String plainText) throws Exception {
        byte[] encryptedBytes = AesEncryptionUtil.encrypt(plainText.getBytes(StandardCharsets.UTF_8), secretKey);
        return java.util.Base64.getEncoder().encodeToString(encryptedBytes);
    }

    @Override
    public String decryptText(String encryptedText) throws Exception {
        byte[] encryptedBytes = java.util.Base64.getDecoder().decode(encryptedText);
        byte[] decrypted = AesEncryptionUtil.decrypt(encryptedBytes, secretKey);
        return new String(decrypted, StandardCharsets.UTF_8);
    }
}
