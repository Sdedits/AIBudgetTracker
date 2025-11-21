package com.infosys.aibudgettracker.authservice.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;
    
    @Column
    private Double monthlyIncome;
    
    @Column
    private Double savings;
    
    @Column
    private Double targetExpenses;

    @Column
    private String firstName;

    @Column
    private String lastName;
    
    @Column(nullable = false)
    private boolean banned = false;

    @Column(nullable = false)
    private boolean adminApproved = false;

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = Role.USER;
    }
    
    public enum Role {
        USER, ADMIN, OWNER
    }
}