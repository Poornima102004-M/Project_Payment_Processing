CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'UPI',
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    payer_upi_id VARCHAR(100) NULL,
    payee_upi_id VARCHAR(100) NULL,
    description VARCHAR(255) NULL,
    source_account VARCHAR(50) NOT NULL,
    destination_account VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_code VARCHAR(50) NULL,
    error_message VARCHAR(255) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_status_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payment_id BIGINT NOT NULL,
    from_status VARCHAR(20) NULL,
    to_status VARCHAR(20) NOT NULL,
    changed_at DATETIME NOT NULL,
    changed_by VARCHAR(50) NOT NULL,
    note VARCHAR(255) NULL,
    CONSTRAINT fk_payment_history_payment
        FOREIGN KEY (payment_id) REFERENCES payments(id)
        ON DELETE CASCADE
);