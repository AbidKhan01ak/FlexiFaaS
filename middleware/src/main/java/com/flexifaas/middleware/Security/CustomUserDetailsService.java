package com.flexifaas.middleware.Security;

import com.flexifaas.middleware.Exception.ResourceNotFoundException;
import com.flexifaas.middleware.Model.User;
import com.flexifaas.middleware.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) {
        User user = userRepository.findByUsername(usernameOrEmail);
        if(user == null) {
            user = userRepository.findByEmail(usernameOrEmail);
        }
        if(user == null){
            throw new ResourceNotFoundException("User not found");
        }
        return new CustomUserDetails(user);
    }
}
