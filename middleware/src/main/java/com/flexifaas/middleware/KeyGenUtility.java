package com.flexifaas.middleware;

import com.flexifaas.middleware.Util.AesEncryptionUtil;

import java.util.Base64;

public class KeyGenUtility {
    public static void main(String[] args) throws Exception {
        String key = AesEncryptionUtil.generateRandomBase64Key();
        System.out.println("AES Key (Base64): " + key);
        int length = Base64.getDecoder().decode("/+ZO8xctu4YbZQIdPNT6rxFXbwTwEFvcixQ8BNyzmNQ=").length;
        System.out.println(length);
    }
}
