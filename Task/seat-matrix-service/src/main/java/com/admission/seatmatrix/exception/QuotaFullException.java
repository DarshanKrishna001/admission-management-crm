package com.admission.seatmatrix.exception;

public class QuotaFullException extends RuntimeException {
    public QuotaFullException(String message) { super(message); }
}