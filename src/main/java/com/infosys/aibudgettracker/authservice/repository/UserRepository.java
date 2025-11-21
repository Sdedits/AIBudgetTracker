package com.infosys.aibudgettracker.authservice.repository;

import com.infosys.aibudgettracker.authservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    // Find users by admin approval status
    java.util.List<User> findByAdminApprovedFalse();

    // Find user by id
    java.util.Optional<User> findById(java.lang.Long id);
}