package com.hostelassist.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 64)
    private String action;

    @Column(name = "performed_by", nullable = false, length = 120)
    private String performedBy;

    @Column(name = "user_role", nullable = false, length = 32)
    private String userRole;

    @Column(name = "entity_type", nullable = false, length = 32)
    private String entityType; // USER, COMPLAINT, ASSET, MAINTENANCE, SYSTEM

    @Column(name = "entity_id", nullable = false, length = 64)
    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @CreationTimestamp
    @Column(name = "timestamp", updatable = false)
    private LocalDateTime timestamp;
}
