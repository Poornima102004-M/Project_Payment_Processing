package com.project.payments_api.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class CreatePaymentRequest {

    @NotBlank
    @Size(max = 100)
    private String idempotencyKey;

    @Size(max = 20)
    private String paymentMethod;

    @NotNull
    @DecimalMin(value = "0.01")
    @Digits(integer = 13, fraction = 2)
    private BigDecimal amount;

    @NotBlank
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be 3 uppercase letters e.g. INR")
    private String currency;

    @Size(max = 100)
    private String payerUpiId;

    @Size(max = 100)
    private String payeeUpiId;

    @Size(max = 255)
    private String description;

    @NotBlank
    @Size(max = 50)
    private String sourceAccount;

    @NotBlank
    @Size(max = 50)
    private String destinationAccount;

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPayerUpiId() { return payerUpiId; }
    public void setPayerUpiId(String payerUpiId) { this.payerUpiId = payerUpiId; }

    public String getPayeeUpiId() { return payeeUpiId; }
    public void setPayeeUpiId(String payeeUpiId) { this.payeeUpiId = payeeUpiId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSourceAccount() { return sourceAccount; }
    public void setSourceAccount(String sourceAccount) { this.sourceAccount = sourceAccount; }

    public String getDestinationAccount() { return destinationAccount; }
    public void setDestinationAccount(String destinationAccount) { this.destinationAccount = destinationAccount; }
}