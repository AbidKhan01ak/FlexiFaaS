package com.flexifaas.middleware.Controller;

import com.flexifaas.middleware.Dto.JwtAuthResponse;
import com.flexifaas.middleware.Dto.UserDTO;
import com.flexifaas.middleware.Security.CustomUserDetailsService;
import com.flexifaas.middleware.Security.Util.JwtTokenUtil;
import com.flexifaas.middleware.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserService userService;

    // Registration endpoint
    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody UserDTO userDTO, @RequestParam String password) {

        UserDTO registered = userService.registerUser(userDTO, password);
        return ResponseEntity.ok(registered);
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username, @RequestParam String password) {
        // Authenticate the user using AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );
        // If successful, load details and generate JWT
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
        String jwt = jwtTokenUtil.generateToken(userDetails);

        // You can return JWT plus minimal user info
        return ResponseEntity.ok().body(new JwtAuthResponse(jwt, userDetails.getUsername(), userDetails.getAuthorities()));
    }
}
