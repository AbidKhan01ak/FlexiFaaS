package com.flexifaas.backend.Service;

import com.flexifaas.backend.DTO.UserDTO;

import java.util.List;

public interface UserService {

    UserDTO registerUser(UserDTO userDTO, String rawPassword);
    UserDTO getUserById(Long id);
    UserDTO getUserByUsername(String username);
    List<UserDTO> getAllUsers();
    void deleteUser(Long id);
}
