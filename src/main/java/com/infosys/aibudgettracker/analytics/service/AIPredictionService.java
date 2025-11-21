package com.infosys.aibudgettracker.analytics.service;

import com.infosys.aibudgettracker.transaction.model.Transaction;
import com.infosys.aibudgettracker.transaction.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIPredictionService {

    @Autowired
    private TransactionRepository transactionRepository;

    /**
     * Predict next month expenses using a simple linear regression on monthly totals.
     * This is intentionally lightweight and dependency-free so it can run without ML libs.
     *
     * @param userId the user's id
     * @param months number of past months to use for training (e.g. 6 or 12)
     * @return predicted expense amount for the next month
     */
    public AIPredictionResult predictNextMonthExpenses(Long userId, int months) {
        // gather transactions for the past `months` months
        YearMonth now = YearMonth.now();
        YearMonth start = now.minusMonths(months - 1);

        LocalDateTime startDate = start.atDay(1).atStartOfDay();
        LocalDateTime endDate = now.atEndOfMonth().atTime(23,59,59);

        List<Transaction> transactions = transactionRepository.findByUserIdAndTransactionDateBetween(userId, startDate, endDate);

        // aggregate expenses per month
        Map<YearMonth, Double> totals = new HashMap<>();
        for (Transaction t : transactions) {
            if (t.getType() != Transaction.TransactionType.EXPENSE) continue;
            YearMonth ym = YearMonth.from(t.getTransactionDate());
            totals.put(ym, totals.getOrDefault(ym, 0.0) + (t.getAmount() == null ? 0.0 : t.getAmount()));
        }

        // Build ordered list of months and values
        List<YearMonth> monthsList = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            monthsList.add(start.plusMonths(i));
        }

        List<Double> y = new ArrayList<>();
        for (YearMonth ym : monthsList) {
            y.add(totals.getOrDefault(ym, 0.0));
        }

        // If insufficient variation, return simple average
        double sum = 0.0;
        for (Double v : y) sum += v;
        double avg = y.isEmpty() ? 0.0 : sum / y.size();

        // perform linear regression y = a + b*x where x = 0..n-1
        int n = y.size();
        if (n == 0) {
            return new AIPredictionResult(0.0, monthsList, y);
        }

        double sx = 0.0, sy = 0.0, sxx = 0.0, sxy = 0.0;
        for (int i = 0; i < n; i++) {
            double xi = i;
            double yi = y.get(i);
            sx += xi;
            sy += yi;
            sxx += xi * xi;
            sxy += xi * yi;
        }

        double denom = n * sxx - sx * sx;
        double slope = 0.0;
        double intercept = 0.0;
        if (Math.abs(denom) > 1e-9) {
            slope = (n * sxy - sx * sy) / denom;
            intercept = (sy - slope * sx) / n;
        } else {
            // fallback to average
            slope = 0.0;
            intercept = avg;
        }

        double nextX = n;
        double prediction = intercept + slope * nextX;
        if (prediction < 0) prediction = 0.0;

        return new AIPredictionResult(prediction, monthsList, y);
    }

    public static class AIPredictionResult {
        private double predictedAmount;
        private List<YearMonth> months;
        private List<Double> monthlyTotals;

        public AIPredictionResult(double predictedAmount, List<YearMonth> months, List<Double> monthlyTotals) {
            this.predictedAmount = predictedAmount;
            this.months = months;
            this.monthlyTotals = monthlyTotals;
        }

        public double getPredictedAmount() { return predictedAmount; }
        public List<YearMonth> getMonths() { return months; }
        public List<Double> getMonthlyTotals() { return monthlyTotals; }
    }
}
