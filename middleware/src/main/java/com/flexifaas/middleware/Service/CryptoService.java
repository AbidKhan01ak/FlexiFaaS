package com.flexifaas.middleware.Service;

public interface CryptoService {
    byte[] encryptFile(byte[] inputFileBytes) throws Exception;
    byte[] decryptFile(byte[] encryptedBytes) throws Exception;

    String encryptText(String plainText) throws Exception;
    String decryptText(String encryptedText) throws Exception;
}
