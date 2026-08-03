package com.project.payments_api.service;

import com.project.payments_api.dto.CreatePaymentRequest;
import com.project.payments_api.dto.UpdatePaymentStatusRequest;
import com.project.payments_api.exception.ApiException;
import com.project.payments_api.exception.ResourceNotFoundException;
import com.project.payments_api.model.Payment;
import com.project.payments_api.model.PaymentStatus;
import com.project.payments_api.model.PaymentStatusHistory;
import com.project.payments_api.repository.PaymentRepository;
import com.project.payments_api.repository.PaymentStatusHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentStatusHistoryRepository historyRepository;

    private static final Set<String> SUPPORTED_CURRENCIES = Set.of("USD", "EUR", "GBP", "INR");
    private static final Set<String> SUPPORTED_METHODS = Set.of("UPI", "CARD", "NETBANKING");

    private static final Map<PaymentStatus, Set<PaymentStatus>> ALLOWED_TRANSITIONS = Map.of(
            PaymentStatus.CREATED,   Set.of(PaymentStatus.VALIDATED, PaymentStatus.FAILED),
            PaymentStatus.VALIDATED, Set.of(PaymentStatus.SENT, PaymentStatus.FAILED),
            PaymentStatus.SENT,      Set.of(PaymentStatus.COMPLETED, PaymentStatus.FAILED),
            PaymentStatus.COMPLETED, Set.of(),
            PaymentStatus.FAILED,    Set.of()
    );

    public PaymentService(PaymentRepository paymentRepository,
                          PaymentStatusHistoryRepository historyRepository) {
        this.paymentRepository = paymentRepository;
        this.historyRepository = historyRepository;
    }

    @Transactional
    public Payment createPayment(CreatePaymentRequest req) {
        validateBusinessRules(req);

        Optional<Payment> existing = paymentRepository.findByIdempotencyKey(req.getIdempotencyKey());
        if (existing.isPresent()) {
            return existing.get();
        }

        String method = req.getPaymentMethod() == null || req.getPaymentMethod().isBlank()
                ? "UPI"
                : req.getPaymentMethod().toUpperCase();

        Payment p = new Payment();
        p.setIdempotencyKey(req.getIdempotencyKey());
        p.setPaymentMethod(method);
        p.setAmount(req.getAmount());
        p.setCurrency(req.getCurrency());
        p.setPayerUpiId(req.getPayerUpiId());
        p.setPayeeUpiId(req.getPayeeUpiId());
        p.setDescription(req.getDescription());
        p.setSourceAccount(req.getSourceAccount());
        p.setDestinationAccount(req.getDestinationAccount());
        p.setStatus(PaymentStatus.CREATED);

        long id = paymentRepository.insert(p);
        Payment created = paymentRepository.findById(id)
                .orElseThrow(() -> new ApiException("PROCESSING_ERROR", "Payment creation failed"));

        historyRepository.insert(created.getId(), null, PaymentStatus.CREATED, "SYSTEM", "Payment created");
        return created;
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));
    }

    public List<Payment> getPayments(String status) {
        if (status == null || status.isBlank()) {
            return paymentRepository.findAll();
        }
        try {
            return paymentRepository.findByStatus(PaymentStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new ApiException("VALIDATION_FAILED", "Invalid status filter: " + status);
        }
    }

    public List<PaymentStatusHistory> getHistory(Long paymentId) {
        getPaymentById(paymentId);
        return historyRepository.findByPaymentId(paymentId);
    }

    @Transactional
    public Payment updateStatus(Long paymentId, UpdatePaymentStatusRequest req) {
        Payment payment = getPaymentById(paymentId);
        PaymentStatus from = payment.getStatus();
        PaymentStatus to = req.getNewStatus();

        if (!ALLOWED_TRANSITIONS.getOrDefault(from, Set.of()).contains(to)) {
            throw new ApiException("INVALID_STATUS_TRANSITION",
                    "Cannot transition from " + from + " to " + to);
        }

        String errorCode = req.getErrorCode();
        String errorMessage = req.getErrorMessage();

        if (to != PaymentStatus.FAILED) {
            errorCode = null;
            errorMessage = null;
        } else if (errorCode == null || errorCode.isBlank()) {
            throw new ApiException("VALIDATION_FAILED", "errorCode is required when status is FAILED");
        }

        paymentRepository.updateStatus(paymentId, to, errorCode, errorMessage);
        historyRepository.insert(paymentId, from, to, "SYSTEM", req.getNote());

        return getPaymentById(paymentId);
    }

    private void validateBusinessRules(CreatePaymentRequest req) {
        if (req.getSourceAccount().equals(req.getDestinationAccount())) {
            throw new ApiException("VALIDATION_FAILED",
                    "Source and destination account must be different");
        }

        if (!SUPPORTED_CURRENCIES.contains(req.getCurrency())) {
            throw new ApiException("INVALID_CURRENCY",
                    "Unsupported currency: " + req.getCurrency());
        }

        String method = req.getPaymentMethod() == null || req.getPaymentMethod().isBlank()
                ? "UPI"
                : req.getPaymentMethod().toUpperCase();

        if (!SUPPORTED_METHODS.contains(method)) {
            throw new ApiException("VALIDATION_FAILED",
                    "Unsupported payment method: " + req.getPaymentMethod());
        }

        if ("UPI".equals(method)) {
            if (req.getPayerUpiId() == null || req.getPayerUpiId().isBlank()
                    || req.getPayeeUpiId() == null || req.getPayeeUpiId().isBlank()) {
                throw new ApiException("VALIDATION_FAILED",
                        "UPI payments require both payerUpiId and payeeUpiId");
            }
        }
    }
}