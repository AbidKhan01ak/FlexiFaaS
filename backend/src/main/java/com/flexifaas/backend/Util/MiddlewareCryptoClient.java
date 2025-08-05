package com.flexifaas.backend.Util;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;


public class MiddlewareCryptoClient {

    private static final String MIDDLEWARE_URL = "http://localhost:8081/api/crypto/encrypt";

    // Encrypt file using middleware service
    public static byte[] encryptFile(MultipartFile file) throws IOException {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
                MIDDLEWARE_URL,
                HttpMethod.POST,
                requestEntity,
                byte[].class
        );

        return response.getBody();
    }

    // Encrypt code (as text) using middleware service
    public static String encryptCode(String code) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                MIDDLEWARE_URL,
                requestEntity,
                String.class
        );

        return response.getBody();
    }

    // DECRYPTION CODE
    public static byte[] decryptFile(File encryptedFile) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartInputStreamFileResource(Files.newInputStream(encryptedFile.toPath()), encryptedFile.getName()));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
                "http://localhost:8081/api/crypto/decrypt",
                HttpMethod.POST,
                requestEntity,
                byte[].class
        );

        return response.getBody();
    }

    public static String decryptCode(String encryptedText) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("data", encryptedText);

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                "http://localhost:8081/api/crypto/decrypt",
                requestEntity,
                String.class
        );

        return response.getBody();
    }

    // Helper class for RestTemplate file upload
    public static class MultipartInputStreamFileResource extends ByteArrayResource {
        private final String filename;

        public MultipartInputStreamFileResource(InputStream inputStream, String filename) throws IOException {
            super(inputStream.readAllBytes());
            this.filename = filename;
        }

        @Override
        public String getFilename() {
            return this.filename;
        }
    }
}
