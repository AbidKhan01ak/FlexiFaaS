package com.flexifaas.middleware.Util;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.file.Files;
import java.security.SecureRandom;
import java.util.Base64;

public class AesEncryptionUtil {

    // 256-bit AES, GCM mode for modern security
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 16;
    private static final int IV_LENGTH = 12; // 96 bits is recommended for GCM

    // Use this to decode your base64 key from application.yml
    public static SecretKey getSecretKeyFromBase64(String base64Key) {
        byte[] decoded = Base64.getDecoder().decode(base64Key);
        return new SecretKeySpec(decoded, 0, decoded.length, ALGORITHM);
    }

    // Generate a secure random key (use once to generate, then store in config)
    public static String generateRandomBase64Key() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance(ALGORITHM);
        keyGen.init(256);
        SecretKey secretKey = keyGen.generateKey();
        return Base64.getEncoder().encodeToString(secretKey.getEncoded());
    }

    // Encrypt file and overwrite/save as new file
    public static void encryptFile(File inputFile, File outputFile, SecretKey key) throws Exception {
        byte[] fileBytes = Files.readAllBytes(inputFile.toPath());
        byte[] encryptedBytes = encrypt(fileBytes, key);
        Files.write(outputFile.toPath(), encryptedBytes);
    }

    // Decrypt file and write to output (usually temp file)
    public static void decryptFile(File inputFile, File outputFile, SecretKey key) throws Exception {
        byte[] fileBytes = Files.readAllBytes(inputFile.toPath());
        byte[] decryptedBytes = decrypt(fileBytes, key);
        Files.write(outputFile.toPath(), decryptedBytes);
    }

    // Encrypt bytes
    public static byte[] encrypt(byte[] data, SecretKey key) throws Exception {
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        byte[] iv = new byte[IV_LENGTH];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);

        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);
        byte[] encrypted = cipher.doFinal(data);

        // Prepend IV for later use in decryption
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        outputStream.write(iv);
        outputStream.write(encrypted);
        return outputStream.toByteArray();
    }

    // Decrypt bytes
    public static byte[] decrypt(byte[] encryptedData, SecretKey key) throws Exception {
        byte[] iv = new byte[IV_LENGTH];
        System.arraycopy(encryptedData, 0, iv, 0, IV_LENGTH);

        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, key, spec);
        return cipher.doFinal(encryptedData, IV_LENGTH, encryptedData.length - IV_LENGTH);
    }
}
