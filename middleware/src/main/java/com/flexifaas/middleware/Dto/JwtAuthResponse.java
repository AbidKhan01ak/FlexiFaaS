package com.flexifaas.middleware.Dto;

public class JwtAuthResponse {

    private String token;
    private String username;
    private Object roles; // Collection<?>

    public JwtAuthResponse(String token, String username, Object roles) {
        this.token = token;
        this.username = username;
        this.roles = roles;
    }
    public String getToken() { return token; }
    public String getUsername() { return username; }
    public Object getRoles() { return roles; }
}
