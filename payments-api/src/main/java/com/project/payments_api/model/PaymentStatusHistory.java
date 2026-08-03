package com.project.payments_api.model;

import java.time.LocalDateTime;

public class PaymentStatusHistory {
    private Long id;
    private Long paymentId;
    private PaymentStatus fromStatus;
    private PaymentStatus toStatus;
    private LocalDateTime changedAt;
    private String changedBy;
    private String note;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public PaymentStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(PaymentStatus fromStatus) { this.fromStatus = fromStatus; }

    public PaymentStatus getToStatus() { return toStatus; }
    public void setToStatus(PaymentStatus toStatus) { this.toStatus = toStatus; }

    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}