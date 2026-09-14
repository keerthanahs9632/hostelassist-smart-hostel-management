package com.hostelassist.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "ticket_number", nullable = false, unique = true, length = 64)
    private String ticketNumber;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    @Column(name = "student_name", nullable = false, length = 120)
    private String studentName;

    @Column(name = "student_email", nullable = false, length = 120)
    private String studentEmail;

    @Column(name = "room_number", nullable = false, length = 32)
    private String roomNumber;

    @Column(nullable = false, length = 32)
    private String block;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(nullable = false, length = 32)
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false, length = 32)
    private String status; // REPORTED, REVIEWED, ASSIGNED, ACCEPTED, IN_PROGRESS, RESOLVED, VERIFIED, CLOSED

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "repair_evidence_url")
    private String repairEvidenceUrl;

    @Column(name = "asset_id", length = 64)
    private String assetId;

    @Column(name = "assigned_technician_id", length = 64)
    private String assignedTechnicianId;

    @Column(name = "assigned_technician_name", length = 120)
    private String assignedTechnicianName;

    @Column(name = "sla_deadline", nullable = false)
    private LocalDateTime slaDeadline;

    @Column(name = "is_overdue")
    private Boolean isOverdue = false;

    @Column(name = "total_repair_cost", precision = 10, scale = 2)
    private BigDecimal totalRepairCost = BigDecimal.ZERO;

    @Column(name = "work_notes", columnDefinition = "TEXT")
    private String workNotes;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
