package com.project.payments_api.exception;

public class ResourceNotFoundException extends ApiException {
    public ResourceNotFoundException(String message) {
        super("PAYMENT_NOT_FOUND", message);
    }
}