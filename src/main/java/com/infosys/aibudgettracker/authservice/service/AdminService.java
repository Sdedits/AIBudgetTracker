package com.infosys.aibudgettracker.authservice.service;

import com.infosys.aibudgettracker.authservice.model.User;
import com.infosys.aibudgettracker.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    public List<User> listAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> banUser(Long id) {
        return userRepository.findById(id).map(u -> {
            u.setBanned(true);
            return userRepository.save(u);
        });
    }

    public Optional<User> unbanUser(Long id) {
        return userRepository.findById(id).map(u -> {
            u.setBanned(false);
            return userRepository.save(u);
        });
    }

    public List<User> listPendingAdminRequests() {
        return userRepository.findByAdminApprovedFalse();
    }

    public Optional<User> approveAdmin(Long id) {
        return userRepository.findById(id).map(u -> {
            u.setAdminApproved(true);
            u.setRole(User.Role.ADMIN);
            return userRepository.save(u);
        });
    }

    public Optional<User> revokeAdmin(Long id) {
        return userRepository.findById(id).map(u -> {
            u.setAdminApproved(false);
            u.setRole(User.Role.USER);
            return userRepository.save(u);
        });
    }
}
