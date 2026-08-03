$content = @"
# PayFlow Payment API - Complete Testing Guide

## Overview
This document contains all APIs with methods, URLs, and JSON payloads for both **success** and **failure scenarios**.

---

## Table of Contents
1. [Create Payment APIs](#create-payment-apis)
2. [Get Payment APIs](#get-payment-apis)
3. [Update Payment Status APIs](#update-payment-status-apis)
4. [Get Payment History API](#get-payment-history-api)
5. [Quick Reference Table](#quick-reference-table)

---

## Create Payment APIs

### 1️⃣ CREATE PAYMENT - Success (UPI)

**Method:** \`POST\`  
**URL:** \`http://localhost:8080/api/payments\`

**Request:**
\`\`\`json
{
"idempotencyKey": "success-upi-001",
"paymentMethod": "UPI",
"amount": 5000,
"currency": "INR",
"payerUpiId": "user@ybl",
"payeeUpiId": "merchant@okaxis",
"description": "Successful payment",
"sourceAccount": "UPI-user@ybl",
"destinationAccount": "UPI-merchant@okaxis"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
"id": 1,
"idempotencyKey": "success-upi-001",
"paymentMethod": "UPI",
"amount": 5000,
"currency": "INR",
"payerUpiId": "user@ybl",
"payeeUpiId": "merchant@okaxis",
"description": "Successful payment",
"sourceAccount": "UPI-user@ybl",
"destinationAccount": "UPI-merchant@okaxis",
"status": "CREATED",
"errorCode": null,
"errorMessage": null,
"createdAt": "2026-08-03T14:30:15"
}
\`\`\`

---

### 2️⃣ CREATE PAYMENT - Failure (Amount > 100000)

**Method:** \`POST\`  
**URL:** \`http://localhost:8080/api/payments\`

**Request:**
\`\`\`json
{
"idempotencyKey": "fail-amount-001",
"paymentMethod": "UPI",
"amount": 150000,
"currency": "INR",
"payerUpiId": "user@ybl",
"payeeUpiId": "merchant@okaxis",
"description": "Amount exceeds limit",
"sourceAccount": "UPI-user@ybl",
"destinationAccount": "UPI-merchant@okaxis"
}
\`\`\`

**Response (200 OK with FAILED status):**
\`\`\`json
{
"id": 2,
"idempotencyKey": "fail-amount-001",
"paymentMethod": "UPI",
"amount": 150000,
"currency": "INR",
"payerUpiId": "user@ybl",
"payeeUpiId": "merchant@okaxis",
"description": "Amount exceeds limit",
"sourceAccount": "UPI-user@ybl",
"destinationAccount": "UPI-merchant@okaxis",
"status": "FAILED",
"errorCode": "AUTO_REJECTED",
"errorMessage": "Amount exceeds maximum limit of 100000",
"createdAt": "2026-08-03T14:31:00"
}
\`\`\`

---

### 3️⃣ CREATE PAYMENT - Failure (Fraud Pattern in UPI)

**Method:** \`POST\`  
**URL:** \`http://localhost:8080/api/payments\`

**Request:**
\`\`\`json
{
"idempotencyKey": "fail-fraud-001",
"paymentMethod": "UPI",
"amount": 500,
"currency": "INR",
"payerUpiId": "fraud@ybl",
"payeeUpiId": "merchant@okaxis",
"description": "Fraud test",
"sourceAccount": "UPI-fraud@ybl",
"destinationAccount": "UPI-merchant@okaxis"
}
\`\`\`

**Response (200 OK with FAILED status):**
\`\`\`json
{
"id": 3,
"idempotencyKey": "fail-fraud-001",
"paymentMethod": "UPI",
"amount": 500,
"currency": "INR",
"payerUpiId": "fraud@ybl",
"payeeUpiId": "merchant@okaxis",
"description": "Fraud test",
"sourceAccount": "UPI-fraud@ybl",
"destinationAccount": "UPI-merchant@okaxis",
"status": "FAILED",
"errorCode": "AUTO_REJECTED",
"errorMessage": "Fraudulent UPI pattern detected",
"createdAt": "2026-08-03T14:32:00"
}
\`\`\`

---

### 4️⃣ CREATE PAYMENT - Failure (Same Payer/Payee UPI)

**Method:** \`POST\`  
**URL:** \`http://localhost:8080/api/payments\`

**Request:**
\`\`\`json
{
"idempotencyKey": "fail-same-upi-001",
"paymentMethod": "UPI",
"amount": 1000,
"currency": "INR",
"payerUpiId": "same@ybl",
"payeeUpiId": "same@ybl",
"description": "Same UPI test",
"sourceAccount": "UPI-same@ybl",
"destinationAccount": "UPI-same-dest@ybl"
}
\`\`\`

**Response (200 OK with FAILED status):**
\`\`\`json
{
"id": 4,
"idempotencyKey": "fail-same-upi-001",
"paymentMethod": "UPI",
"amount": 1000,
"currency": "INR",
"payerUpiId": "same@ybl",
"payeeUpiId": "same@ybl",
"description": "Same UPI test",
"sourceAccount": "UPI-same@ybl",
"destinationAccount": "UPI-same-dest@ybl",
"status": "FAILED",
"errorCode": "AUTO_REJECTED",
"errorMessage": "Payer and payee UPI IDs must be different",
"createdAt": "2026-08-03T14:33:00"
}
\`\`\`

---

### 5️⃣ CREATE PAYMENT - Failure (NetBanking Unsupported Bank)

**Method:** \`POST\`  
**URL:** \`http://localhost:8080/api/payments\`

**Request:**
\`\`\`json
{
"idempotencyKey": "fail-netbank-001",
"paymentMethod": "NETBANKING",
"amount": 2000,
"currency": "INR",
"payerUpiId": null,
"payeeUpiId": null,
"description": "blackbank test payment",
"sourceAccount": "ACC1001",
"destinationAccount": "ACC2002"
}
\`\`\`

**Response (200 OK with FAILED status):**
\`\`\`json
{
"id": 5,
"idempotencyKey": "fail-netbank-001",
"paymentMethod": "NETBANKING",
"amount": 2000,
"currency": "INR",
"payerUpiId": null,
"payeeUpiId": null,
"description": "blackbank test payment",
"sourceAccount": "ACC1001",
"destinationAccount": "ACC2002",
"status": "FAILED",
"errorCode": "AUTO_REJECTED",
"errorMessage": "Bank is not supported",
"createdAt": "2026-08-03T14:34:00"
}
\`\`\`

---

### 6️⃣ CREATE PAYMENT - Success (CARD)

**Method:** \`POST\`  
**URL:** \`http://localhost:8080/api/payments\`

**Request:**
\`\`\`json
{
"idempotencyKey": "success-card-001",
"paymentMethod": "CARD",
"amount": 10000,
"currency": "INR",
"payerUpiId": null,
"payeeUpiId": null,
"description": "Card payment successful",
"sourceAccount": "CARD-4532",
"destinationAccount": "MERCHANT-ACC"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
"id": 6,
"idempotencyKey": "success-card-001",
"paymentMethod": "CARD",
"amount": 10000,
"currency": "INR",
"payerUpiId": null,
"payeeUpiId": null,
"description": "Card payment successful",
"sourceAccount": "CARD-4532",
"destinationAccount": "MERCHANT-ACC",
"status": "CREATED",
"errorCode": null,
"errorMessage": null,
"createdAt": "2026-08-03T14:35:00"
}
\`\`\`

---

### 7️⃣ CREATE PAYMENT - Success (NETBANKING)

**Method:** \`POST\`  
**URL:** \`http://localhost:8080/api/payments\`

**Request:**
\`\`\`json
{
"idempotencyKey": "success-netbank-001",
"paymentMethod": "NETBANKING",
"amount": 5000,
"currency": "INR",
"payerUpiId": null,
"payeeUpiId": null,
"description": "Net banking successful",
"sourceAccount": "SBI-1001",
"destinationAccount": "HDFC-2002"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
"id": 7,
"idempotencyKey": "success-netbank-001",
"paymentMethod": "NETBANKING",
"amount": 5000,
"currency": "INR",
"payerUpiId": null,
"payeeUpiId": null,
"description": "Net banking successful",
"sourceAccount": "SBI-1001",
"destinationAccount": "HDFC-2002",
"status": "CREATED",
"errorCode": null,
"errorMessage": null,
"createdAt": "2026-08-03T14:36:00"
}
\`\`\`

---

## Get Payment APIs

### 8️⃣ GET ALL PAYMENTS

**Method:** \`GET\`  
**URL:** \`http://localhost:8080/api/payments\`

**Response (200 OK):**
\`\`\`json
[
{
"id": 1,
"idempotencyKey": "success-upi-001",
"paymentMethod": "UPI",
"amount": 5000,
"currency": "INR",
"status": "CREATED",
"createdAt": "2026-08-03T14:30:15"
},
{
"id": 2,
"idempotencyKey": "fail-amount-001",
"paymentMethod": "UPI",
"amount": 150000,
"currency": "INR",
"status": "FAILED",
"errorCode": "AUTO_REJECTED",
"errorMessage": "Amount exceeds maximum limit of 100000",
"createdAt": "2026-08-03T14:31:00"
}
]
\`\`\`

---

### 9️⃣ GET PAYMENT BY ID (Success)

**Method:** \`GET\`  
**URL:** \`http://localhost:8080/api/payments/1\`

**Response (200 OK):**
\`\`\`json
{
"id": 1,
"idempotencyKey": "success-upi-001",
"paymentMethod": "UPI",
"amount": 5000,
"currency": "INR",
"payerUpiId": "user@ybl",
"payeeUpiId": "merchant@okaxis",
"description": "Successful payment",
"sourceAccount": "UPI-user@ybl",
"destinationAccount": "UPI-merchant@okaxis",
"status": "CREATED",
"errorCode": null,
"errorMessage": null,
"createdAt": "2026-08-03T14:30:15"
}
\`\`\`

---

### 1️⃣0️⃣ GET PAYMENT BY ID (Failure)

**Method:** \`GET\`  
**URL:** \`http://localhost:8080/api/payments/2\`

**Response (200 OK):**
\`\`\`json
{
"id": 2,
"idempotencyKey": "fail-amount-001",
"paymentMethod": "UPI",
"amount": 150000,
"currency": "INR",
"payerUpiId": "user@ybl",
"payeeUpiId": "merchant@okaxis",
"description": "Amount exceeds limit",
"sourceAccount": "UPI-user@ybl",
"destinationAccount": "UPI-merchant@okaxis",
"status": "FAILED",
"errorCode": "AUTO_REJECTED",
"errorMessage": "Amount exceeds maximum limit of 100000",
"createdAt": "2026-08-03T14:31:00"
}
\`\`\`

---

### 1️⃣1️⃣ GET PAYMENTS BY STATUS (Filter FAILED)

**Method:** \`GET\`  
**URL:** \`http://localhost:8080/api/payments?status=FAILED\`

**Response (200 OK):**
\`\`\`json
[
{
"id": 2,
"idempotencyKey": "fail-amount-001",
"paymentMethod": "UPI",
"amount": 150000,
"currency": "INR",
"status": "FAILED",
"errorCode": "AUTO_REJECTED",
"errorMessage": "Amount exceeds maximum limit of 100000"
},
{
"id": 3,
"idempotencyKey": "fail-fraud-001",
"paymentMethod": "UPI",
"amount": 500,
"currency": "INR",
"status": "FAILED",
"errorCode": "AUTO_REJECTED",
"errorMessage": "Fraudulent UPI pattern detected"
}
]
\`\`\`

---

### 1️⃣2️⃣ GET PAYMENTS BY STATUS (Filter CREATED)

**Method:** \`GET\`  
**URL:** \`http://localhost:8080/api/payments?status=CREATED\`

**Response (200 OK):**
\`\`\`json
[
{
"id": 1,
"idempotencyKey": "success-upi-001",
"paymentMethod": "UPI",
"amount": 5000,
"currency": "INR",
"status": "CREATED"
},
{
"id": 6,
"idempotencyKey": "success-card-001",
"paymentMethod": "CARD",
"amount": 10000,
"currency": "INR",
"status": "CREATED"
}
]
\`\`\`

---

## Update Payment Status APIs

### 1️⃣3️⃣ UPDATE STATUS - CREATED → VALIDATED (Success)

**Method:** \`PATCH\`  
**URL:** \`http://localhost:8080/api/payments/1/status\`

**Request:**
\`\`\`json
{
"newStatus": "VALIDATED",
"changedBy": "system",
"note": "Payment validated successfully"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
"id": 1,
"idempotencyKey": "success-upi-001",
"paymentMethod": "UPI",
"amount": 5000,
"currency": "INR",
"status": "VALIDATED",
"errorCode": null,
"errorMessage": null,
"updatedAt": "2026-08-03T14:40:00"
}
\`\`\`

---

### 1️⃣4️⃣ UPDATE STATUS - VALIDATED → SENT (Success)

**Method:** \`PATCH\`  
**URL:** \`http://localhost:8080/api/payments/1/status\`

**Request:**
\`\`\`json
{
"newStatus": "SENT",
"changedBy": "system",
"note": "Payment sent to gateway"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
"id": 1,
"idempotencyKey": "success-upi-001",
"paymentMethod": "UPI",
"amount": 5000,
"currency": "INR",
"status": "SENT",
"errorCode": null,
"errorMessage": null,
"updatedAt": "2026-08-03T14:41:00"
}
\`\`\`

---

### 1️⃣5️⃣ UPDATE STATUS - SENT → COMPLETED (Success)

**Method:** \`PATCH\`  
**URL:** \`http://localhost:8080/api/payments/1/status\`

**Request:**
\`\`\`json
{
"newStatus": "COMPLETED",
"changedBy": "system",
"note": "Payment completed successfully"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
"id": 1,
"idempotencyKey": "success-upi-001",
"paymentMethod": "UPI",
"amount": 5000,
"currency": "INR",
"status": "COMPLETED",
"errorCode": null,
"errorMessage": null,
"updatedAt": "2026-08-03T14:42:00"
}
\`\`\`

---

### 1️⃣6️⃣ UPDATE STATUS - CREATED → FAILED (Manual Failure)

**Method:** \`PATCH\`  
**URL:** \`http://localhost:8080/api/payments/1/status\`

**Request:**
\`\`\`json
{
"newStatus": "FAILED",
"changedBy": "system",
"note": "Payment declined by bank",
"errorCode": "INSUFFICIENT_FUNDS",
"errorMessage": "Account has insufficient balance"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
"id": 1,
"idempotencyKey": "success-upi-001",
"paymentMethod": "UPI",
"amount": 5000,
"currency": "INR",
"status": "FAILED",
"errorCode": "INSUFFICIENT_FUNDS",
"errorMessage": "Account has insufficient balance",
"updatedAt": "2026-08-03T14:43:00"
}
\`\`\`

---

### 1️⃣7️⃣ UPDATE STATUS - VALIDATED → FAILED (Manual Failure)

**Method:** \`PATCH\`  
**URL:** \`http://localhost:8080/api/payments/1/status\`

**Request:**
\`\`\`json
{
"newStatus": "FAILED",
"changedBy": "system",
"note": "Fraud check failed",
"errorCode": "FRAUD_DETECTED",
"errorMessage": "Transaction flagged by fraud engine"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
"id": 1,
"idempotencyKey": "success-upi-001",
"paymentMethod": "UPI",
"amount": 5000,
"currency": "INR",
"status": "FAILED",
"errorCode": "FRAUD_DETECTED",
"errorMessage": "Transaction flagged by fraud engine",
"updatedAt": "2026-08-03T14:44:00"
}
\`\`\`

---

### 1️⃣8️⃣ UPDATE STATUS - SENT → FAILED (Manual Failure)

**Method:** \`PATCH\`  
**URL:** \`http://localhost:8080/api/payments/1/status\`

**Request:**
\`\`\`json
{
"newStatus": "FAILED",
"changedBy": "system",
"note": "Gateway timeout",
"errorCode": "TIMEOUT",
"errorMessage": "Payment gateway did not respond in time"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
"id": 1,
"idempotencyKey": "success-upi-001",
"paymentMethod": "UPI",
"amount": 5000,
"currency": "INR",
"status": "FAILED",
"errorCode": "TIMEOUT",
"errorMessage": "Payment gateway did not respond in time",
"updatedAt": "2026-08-03T14:45:00"
}
\`\`\`

---

## Get Payment History API

### 1️⃣9️⃣ GET PAYMENT HISTORY (Success Path)

**Method:** \`GET\`  
**URL:** \`http://localhost:8080/api/payments/1/history\`

**Response (200 OK):**
\`\`\`json
[
{
"id": 1,
"paymentId": 1,
"fromStatus": null,
"toStatus": "CREATED",
"changedBy": "SYSTEM",
"note": "Payment created",
"changedAt": "2026-08-03T14:30:15"
},
{
"id": 2,
"paymentId": 1,
"fromStatus": "CREATED",
"toStatus": "VALIDATED",
"changedBy": "SYSTEM",
"note": "Payment validated successfully",
"changedAt": "2026-08-03T14:40:00"
},
{
"id": 3,
"paymentId": 1,
"fromStatus": "VALIDATED",
"toStatus": "SENT",
"changedBy": "SYSTEM",
"note": "Payment sent to gateway",
"changedAt": "2026-08-03T14:41:00"
},
{
"id": 4,
"paymentId": 1,
"fromStatus": "SENT",
"toStatus": "COMPLETED",
"changedBy": "SYSTEM",
"note": "Payment completed successfully",
"changedAt": "2026-08-03T14:42:00"
}
]
\`\`\`

---

### 2️⃣0️⃣ GET PAYMENT HISTORY (Auto-Failed)

**Method:** \`GET\`  
**URL:** \`http://localhost:8080/api/payments/2/history\`

**Response (200 OK):**
\`\`\`json
[
{
"id": 1,
"paymentId": 2,
"fromStatus": null,
"toStatus": "FAILED",
"changedBy": "SYSTEM",
"note": "Amount exceeds maximum limit of 100000",
"changedAt": "2026-08-03T14:31:00"
}
]
\`\`\`

---

### 2️⃣1️⃣ GET PAYMENT HISTORY (Manual Failure)

**Method:** \`GET\`  
**URL:** \`http://localhost:8080/api/payments/1/history\`

**Response (200 OK):**
\`\`\`json
[
{
"id": 1,
"paymentId": 1,
"fromStatus": null,
"toStatus": "CREATED",
"changedBy": "SYSTEM",
"note": "Payment created",
"changedAt": "2026-08-03T14:30:15"
},
{
"id": 2,
"paymentId": 1,
"fromStatus": "CREATED",
"toStatus": "FAILED",
"changedBy": "SYSTEM",
"note": "Payment declined by bank",
"changedAt": "2026-08-03T14:43:00"
}
]
\`\`\`

---

## Quick Reference Table

| # | Method | Endpoint | Purpose | Scenario |
|---|--------|----------|---------|----------|
| 1 | POST | \`/api/payments\` | Create Payment | Success (UPI) |
| 2 | POST | \`/api/payments\` | Create Payment | Failure (Amount > 100000) |
| 3 | POST | \`/api/payments\` | Create Payment | Failure (Fraud Pattern) |
| 4 | POST | \`/api/payments\` | Create Payment | Failure (Same Payer/Payee) |
| 5 | POST | \`/api/payments\` | Create Payment | Failure (Unsupported Bank) |
| 6 | POST | \`/api/payments\` | Create Payment | Success (CARD) |
| 7 | POST | \`/api/payments\` | Create Payment | Success (NETBANKING) |
| 8 | GET | \`/api/payments\` | Get All Payments | List all |
| 9 | GET | \`/api/payments/{id}\` | Get Single Payment | Success |
| 10 | GET | \`/api/payments/{id}\` | Get Single Payment | Failure |
| 11 | GET | \`/api/payments?status=FAILED\` | Filter by Status | Failed only |
| 12 | GET | \`/api/payments?status=CREATED\` | Filter by Status | Created only |
| 13 | PATCH | \`/api/payments/{id}/status\` | Update Status | CREATED → VALIDATED |
| 14 | PATCH | \`/api/payments/{id}/status\` | Update Status | VALIDATED → SENT |
| 15 | PATCH | \`/api/payments/{id}/status\` | Update Status | SENT → COMPLETED |
| 16 | PATCH | \`/api/payments/{id}/status\` | Update Status | CREATED → FAILED |
| 17 | PATCH | \`/api/payments/{id}/status\` | Update Status | VALIDATED → FAILED |
| 18 | PATCH | \`/api/payments/{id}/status\` | Update Status | SENT → FAILED |
| 19 | GET | \`/api/payments/{id}/history\` | Get History | Success Path |
| 20 | GET | \`/api/payments/{id}/history\` | Get History | Auto-Failed Path |
| 21 | GET | \`/api/payments/{id}/history\` | Get History | Manual Failure Path |

---

## State Transition Diagram

\`\`\`
CREATED
├─→ VALIDATED
│     ├─→ SENT
│     │     ├─→ COMPLETED (✅ Terminal)
│     │     └─→ FAILED (❌ Terminal)
│     └─→ FAILED (❌ Terminal)
└─→ FAILED (❌ Terminal) [Auto-failed on create]
\`\`\`

---

## Auto-Failure Rules

The backend automatically creates payments with \`FAILED\` status if any of these conditions are met:

| Rule | Condition | Error Message |
|------|-----------|---------------|
| 1 | Amount > 100000 | "Amount exceeds maximum limit of 100000" |
| 2 | Amount ≤ 0 | "Amount must be greater than zero" |
| 3 | UPI contains "fraud" | "Fraudulent UPI pattern detected" |
| 4 | NetBanking description contains "blackbank" | "Bank is not supported" |
| 5 | Payer UPI = Payee UPI | "Payer and payee UPI IDs must be different" |

---

## Testing Checklist

- [ ] Test UPI payment creation (success)
- [ ] Test UPI payment creation (amount > 100000)
- [ ] Test UPI payment creation (fraud pattern)
- [ ] Test UPI payment creation (same payer/payee)
- [ ] Test CARD payment creation
- [ ] Test NETBANKING payment creation
- [ ] Test NETBANKING payment creation (blackbank)
- [ ] Get all payments
- [ ] Get single payment (success)
- [ ] Get single payment (failed)
- [ ] Filter payments by status (FAILED)
- [ ] Filter payments by status (CREATED)
- [ ] Update payment status CREATED → VALIDATED
- [ ] Update payment status VALIDATED → SENT
- [ ] Update payment status SENT → COMPLETED
- [ ] Update payment status CREATED → FAILED (manual)
- [ ] Get payment history (success path)
- [ ] Get payment history (auto-failed)
- [ ] Get payment history (manual failed)

---

## Frontend Testing

**UI URL:** \`http://localhost:8080/index.html\`

### Success Payment (UPI)
- Amount: 5000
- Payer UPI: \`user@ybl\`
- Payee UPI: \`merchant@okaxis\`

**Expected:** Payment created with CREATED status ✅

### Failure Payment (Amount)
- Amount: 150000
- Payer UPI: \`user@ybl\`
- Payee UPI: \`merchant@okaxis\`

**Expected:** Payment created with FAILED status ❌

---

## Notes

- Idempotency: Same \`idempotencyKey\` returns the existing payment
- All timestamps are in India Standard Time (IST / Asia/Kolkata)
- Error codes and messages are auto-populated for auto-failures
- Manual failures require explicit \`errorCode\` in the request

---
"@

$content | Out-File -FilePath "API_TESTING_GUIDE.md" -Encoding UTF8
Write-Host "File created successfully at: $PWD\API_TESTING_GUIDE.md"