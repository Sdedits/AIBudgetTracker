package com.infosys.aibudgettracker.analytics.controller;

import com.infosys.aibudgettracker.analytics.dto.AnalyticsResponse;
import com.infosys.aibudgettracker.analytics.service.AnalyticsService;
import com.infosys.aibudgettracker.analytics.service.AIPredictionService;
import java.util.Map;
import com.infosys.aibudgettracker.authservice.model.User;
import com.infosys.aibudgettracker.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIPredictionService aiPredictionService;

    @GetMapping
    public ResponseEntity<?> getAnalytics(
            @RequestParam int year,
            @RequestParam int month,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AnalyticsResponse response = analyticsService.getAnalytics(user.getId(), year, month);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error fetching analytics: " + e.getMessage());
        }
    }

    @GetMapping("/predict-next-month")
    public ResponseEntity<?> predictNextMonth(
            @RequestParam(required = false, defaultValue = "12") int months,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            com.infosys.aibudgettracker.authservice.model.User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AIPredictionService.AIPredictionResult res = aiPredictionService.predictNextMonthExpenses(user.getId(), months);

            Map<String, Object> resp = new java.util.HashMap<>();
            java.util.List<String> labels = new java.util.ArrayList<>();
            for (java.time.YearMonth ym : res.getMonths()) labels.add(ym.toString());
            resp.put("historyMonths", labels);
            resp.put("historyTotals", res.getMonthlyTotals());
            resp.put("predictedAmount", res.getPredictedAmount());

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error predicting expenses: " + e.getMessage());
        }
    }
}
