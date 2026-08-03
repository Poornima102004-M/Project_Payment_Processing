package com.project.payments_api.controller;

import com.project.payments_api.dto.CreatePaymentRequest;
import com.project.payments_api.dto.UpdatePaymentStatusRequest;
import com.project.payments_api.model.Payment;
import com.project.payments_api.model.PaymentStatusHistory;
import com.project.payments_api.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<Payment> create(@Valid @RequestBody CreatePaymentRequest request) {
        Payment payment = paymentService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping
    public ResponseEntity<List<Payment>> list(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(paymentService.getPayments(status));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<PaymentStatusHistory>> history(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getHistory(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Payment> updateStatus(@PathVariable Long id, @Valid @RequestBody UpdatePaymentStatusRequest request) {
        return ResponseEntity.ok(paymentService.updateStatus(id, request));
    }
}