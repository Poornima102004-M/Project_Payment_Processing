package com.project.payments_api.dto;

import com.project.payments_api.model.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdatePaymentStatusRequest {
    @NotNull
    private PaymentStatus newStatus;

    @Size(max = 50)
    private String errorCode;

    @Size(max = 255)
    private String errorMessage;

    @Size(max = 255)
    private String note;

    public PaymentStatus getNewStatus() { return newStatus; }
    public void setNewStatus(PaymentStatus newStatus) { this.newStatus = newStatus; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}