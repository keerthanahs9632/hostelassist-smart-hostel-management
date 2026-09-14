package com.hostelassist.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "preventive_maintenance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreventiveMaintenance {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_category", nullable = false, length = 64)
    private String targetCategory;

    @Column(name = "target_block", nullable = false, length = 32)
    private String targetBlock;

    @Column(name = "suggested_action", nullable = false, columnDefinition = "TEXT")
    private String suggestedAction;

    @Column(name = "frequency_days")
    private Integer frequencyDays = 30;

    @Column(name = "last_run_date")
    private LocalDateTime lastRunDate;

    @Column(name = "next_scheduled_date", nullable = false)
    private LocalDateTime nextScheduledDate;

    @Column(length = 32)
    private String status = "SCHEDULED"; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(name = "created_reason", length = 32)
    private String createdReason = "MANUAL"; // MANUAL, AI_FAILURE_PATTERN_ALERT

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
