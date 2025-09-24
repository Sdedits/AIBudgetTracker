package com.infosys.aibudgettracker.authservice.service;

import com.infosys.aibudgettracker.authservice.dto.AuthResponse;
import com.infosys.aibudgettracker.authservice.dto.LoginRequest;
import com.infosys.aibudgettracker.authservice.dto.SignUpRequest;
import com.infosys.aibudgettracker.authservice.model.User;
import com.infosys.aibudgettracker.authservice.repository.UserRepository;
import com.infosys.aibudgettracker.authservice.util.JwtUtil; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    
    public void registerUser(SignUpRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        User newUser = new User(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                passwordEncoder.encode(signUpRequest.getPassword())
        );

        userRepository.save(newUser);
    }

    public AuthResponse loginUser(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Error: Invalid password.");
        }
        String token = jwtUtil.generateToken(user.getUsername());

        return new AuthResponse(token);
    }
}