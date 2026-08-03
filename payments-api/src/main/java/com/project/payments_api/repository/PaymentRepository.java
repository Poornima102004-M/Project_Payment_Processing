package com.project.payments_api.repository;

import com.project.payments_api.model.Payment;
import com.project.payments_api.model.PaymentStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class PaymentRepository {

    private final JdbcTemplate jdbcTemplate;

    public PaymentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Payment> mapper = (rs, rowNum) -> {
        Payment p = new Payment();
        p.setId(rs.getLong("id"));
        p.setIdempotencyKey(rs.getString("idempotency_key"));
        p.setPaymentMethod(rs.getString("payment_method"));
        p.setAmount(rs.getBigDecimal("amount"));
        p.setCurrency(rs.getString("currency"));
        p.setPayerUpiId(rs.getString("payer_upi_id"));
        p.setPayeeUpiId(rs.getString("payee_upi_id"));
        p.setDescription(rs.getString("description"));
        p.setSourceAccount(rs.getString("source_account"));
        p.setDestinationAccount(rs.getString("destination_account"));
        p.setStatus(PaymentStatus.valueOf(rs.getString("status")));
        p.setErrorCode(rs.getString("error_code"));
        p.setErrorMessage(rs.getString("error_message"));
        p.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        p.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        return p;
    };

    public Optional<Payment> findById(Long id) {
        List<Payment> list = jdbcTemplate.query(
                "SELECT * FROM payments WHERE id = ?", mapper, id);
        return list.stream().findFirst();
    }

    public Optional<Payment> findByIdempotencyKey(String key) {
        List<Payment> list = jdbcTemplate.query(
                "SELECT * FROM payments WHERE idempotency_key = ?", mapper, key);
        return list.stream().findFirst();
    }

    public List<Payment> findAll() {
        return jdbcTemplate.query(
                "SELECT * FROM payments ORDER BY created_at DESC", mapper);
    }

    public List<Payment> findByStatus(PaymentStatus status) {
        return jdbcTemplate.query(
                "SELECT * FROM payments WHERE status = ? ORDER BY created_at DESC",
                mapper, status.name());
    }

    public long insert(Payment p) {
        LocalDateTime now = LocalDateTime.now();
        jdbcTemplate.update("""
            INSERT INTO payments (
                idempotency_key, payment_method, amount, currency,
                payer_upi_id, payee_upi_id, description,
                source_account, destination_account,
                status, error_code, error_message,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                p.getIdempotencyKey(),
                p.getPaymentMethod(),
                p.getAmount(),
                p.getCurrency(),
                p.getPayerUpiId(),
                p.getPayeeUpiId(),
                p.getDescription(),
                p.getSourceAccount(),
                p.getDestinationAccount(),
                p.getStatus().name(),
                p.getErrorCode(),
                p.getErrorMessage(),
                Timestamp.valueOf(now),
                Timestamp.valueOf(now)
        );

        Long id = jdbcTemplate.queryForObject(
                "SELECT id FROM payments WHERE idempotency_key = ?",
                Long.class, p.getIdempotencyKey());
        return id == null ? -1L : id;
    }

    public void updateStatus(Long id, PaymentStatus status, String errorCode, String errorMessage) {
        jdbcTemplate.update("""
            UPDATE payments
            SET status = ?, error_code = ?, error_message = ?, updated_at = ?
            WHERE id = ?
            """,
                status.name(), errorCode, errorMessage,
                Timestamp.valueOf(LocalDateTime.now()), id
        );
    }
}