package com.flexifaas.middleware;

import java.security.SecureRandom;
import java.util.Base64;

public class GenerateSecretKey {
    public static void main(String[] args) {
        byte[] key = new byte[64]; // 512 bits for HS512
        new SecureRandom().nextBytes(key);
        System.out.println(Base64.getEncoder().encodeToString(key));
        int length = Base64.getDecoder().decode("q+zADRlB3XSmNCBBRE/VoM9tc67Bex+j/EFWeeaLO/H8ODR+4ahWDH4qoAhBGr7fI51p59PCO2AAQo9ENkncAA==").length;
        System.out.println(length);
    }
}
