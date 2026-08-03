package com.project.payments_api.exception;

public class ConflictException extends ApiException {
    public ConflictException(String errorCode, String message) {
        super(errorCode, message);
    }
}