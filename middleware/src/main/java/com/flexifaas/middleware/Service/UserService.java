package com.flexifaas.middleware.Service;

import com.flexifaas.middleware.Dto.UserDTO;

import java.util.List;

public interface UserService {
    UserDTO registerUser(UserDTO userDTO, String rawPassword);
    UserDTO getUserById(Long id);
    UserDTO getUserByUsername(String username);
    List<UserDTO> getAllUsers();
    void deleteUser(Long id);
}
