package com.infosys.aibudgettracker.authservice.dto;

import com.infosys.aibudgettracker.authservice.model.User.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private Double monthlyIncome;
    private Double savings;
    private Double targetExpenses;
    private String firstName;
    private String lastName;
}