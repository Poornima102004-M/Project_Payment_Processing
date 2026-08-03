package com.project.payments_api.repository;

import com.project.payments_api.model.PaymentStatus;
import com.project.payments_api.model.PaymentStatusHistory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class PaymentStatusHistoryRepository {
    private final JdbcTemplate jdbcTemplate;

    public PaymentStatusHistoryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<PaymentStatusHistory> mapper = (rs, rowNum) -> {
        PaymentStatusHistory h = new PaymentStatusHistory();
        h.setId(rs.getLong("id"));
        h.setPaymentId(rs.getLong("payment_id"));
        String from = rs.getString("from_status");
        h.setFromStatus(from == null ? null : PaymentStatus.valueOf(from));
        h.setToStatus(PaymentStatus.valueOf(rs.getString("to_status")));
        h.setChangedAt(rs.getTimestamp("changed_at").toLocalDateTime());
        h.setChangedBy(rs.getString("changed_by"));
        h.setNote(rs.getString("note"));
        return h;
    };

    public void insert(Long paymentId, PaymentStatus fromStatus, PaymentStatus toStatus, String changedBy, String note) {
        jdbcTemplate.update("""
            INSERT INTO payment_status_history (payment_id, from_status, to_status, changed_at, changed_by, note)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
                paymentId,
                fromStatus == null ? null : fromStatus.name(),
                toStatus.name(),
                Timestamp.valueOf(LocalDateTime.now()),
                changedBy,
                note
        );
    }

    public List<PaymentStatusHistory> findByPaymentId(Long paymentId) {
        return jdbcTemplate.query("""
            SELECT * FROM payment_status_history
            WHERE payment_id = ?
            ORDER BY changed_at ASC
            """, mapper, paymentId);
    }
}