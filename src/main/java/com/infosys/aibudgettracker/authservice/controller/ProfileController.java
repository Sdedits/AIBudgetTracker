package com.infosys.aibudgettracker.authservice.controller;

import com.infosys.aibudgettracker.authservice.dto.UserProfileDto;
import com.infosys.aibudgettracker.authservice.model.User;
import com.infosys.aibudgettracker.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return userRepository.findByUsername(currentUsername)
                .map(user -> {
                    UserProfileDto userProfile = new UserProfileDto(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole(),
                        user.getMonthlyIncome(),
                        user.getSavings(),
                        user.getTargetExpenses(),
                        user.getFirstName(),
                        user.getLastName()
                    );
                    return ResponseEntity.ok(userProfile);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserProfileDto profileDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        return userRepository.findByUsername(currentUsername)
                .map(user -> {
                    // allow updating username if not taken
                    if (profileDto.getUsername() != null && !profileDto.getUsername().equals(currentUsername)) {
                        if (userRepository.existsByUsername(profileDto.getUsername())) {
                            return ResponseEntity.badRequest().body("Username already taken");
                        }
                        user.setUsername(profileDto.getUsername());
                    }
                    user.setMonthlyIncome(profileDto.getMonthlyIncome());
                    user.setSavings(profileDto.getSavings());
                    user.setTargetExpenses(profileDto.getTargetExpenses());
                    user.setFirstName(profileDto.getFirstName());
                    user.setLastName(profileDto.getLastName());
                    User updatedUser = userRepository.save(user);
                    
                    UserProfileDto updatedProfile = new UserProfileDto(
                        updatedUser.getId(),
                        updatedUser.getUsername(),
                        updatedUser.getEmail(),
                        updatedUser.getRole(),
                        updatedUser.getMonthlyIncome(),
                        updatedUser.getSavings(),
                        updatedUser.getTargetExpenses(),
                        updatedUser.getFirstName(),
                        updatedUser.getLastName()
                    );
                    return ResponseEntity.ok(updatedProfile);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}