package com.infosys.aibudgettracker.authservice.controller;

import com.infosys.aibudgettracker.authservice.model.User;
import com.infosys.aibudgettracker.authservice.service.AdminService;
import com.infosys.aibudgettracker.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    // Owner id will be set in application properties and read as a long. The owner can manage admins.
    @org.springframework.beans.factory.annotation.Value("${app.owner.id:0}")
    private Long ownerId;

    private boolean isAdminOrOwner() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(u -> u.getRole() == User.Role.ADMIN || u.getRole() == User.Role.OWNER)
                .orElse(false);
    }

    private boolean isOwner() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;
        String username = authentication.getName();
        return userRepository.findByUsername(username)
            .map(u -> u.getId().equals(ownerId) || u.getRole() == User.Role.OWNER)
            .orElse(false);
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        if (!isAdminOrOwner()) return ResponseEntity.status(403).body("Forbidden");
        List<User> users = adminService.listAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users/{id}/ban")
    public ResponseEntity<?> banUser(@PathVariable Long id) {
        if (!isAdminOrOwner()) return ResponseEntity.status(403).body("Forbidden");
        return adminService.banUser(id)
                .map(u -> ResponseEntity.ok(u))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users/{id}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable Long id) {
        if (!isAdminOrOwner()) return ResponseEntity.status(403).body("Forbidden");
        return adminService.unbanUser(id)
                .map(u -> ResponseEntity.ok(u))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin-requests")
    public ResponseEntity<?> listAdminRequests() {
        if (!isAdminOrOwner()) return ResponseEntity.status(403).body("Forbidden");
        return ResponseEntity.ok(adminService.listPendingAdminRequests());
    }

    @PostMapping("/admin-requests/{id}/approve")
    public ResponseEntity<?> approveAdmin(@PathVariable Long id) {
        if (!isOwner()) return ResponseEntity.status(403).body("Only owner can approve admins");
        return adminService.approveAdmin(id)
                .map(u -> ResponseEntity.ok(u))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/admin-requests/{id}/revoke")
    public ResponseEntity<?> revokeAdmin(@PathVariable Long id) {
        if (!isOwner()) return ResponseEntity.status(403).body("Only owner can revoke admins");
        return adminService.revokeAdmin(id)
                .map(u -> ResponseEntity.ok(u))
                .orElse(ResponseEntity.notFound().build());
    }
}
