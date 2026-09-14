package com.hostelassist.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "asset_code", nullable = false, unique = true, length = 64)
    private String assetCode;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(nullable = false, length = 32)
    private String block;

    @Column(nullable = false)
    private Integer floor = 1;

    @Column(name = "room_number", nullable = false, length = 32)
    private String roomNumber;

    @Column(name = "condition_status", length = 32)
    private String conditionStatus = "GOOD"; // EXCELLENT, GOOD, NEEDS_ATTENTION, CRITICAL

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "purchase_cost", precision = 10, scale = 2)
    private BigDecimal purchaseCost = BigDecimal.ZERO;

    @Column(name = "total_repair_cost", precision = 10, scale = 2)
    private BigDecimal totalRepairCost = BigDecimal.ZERO;

    @Column(name = "last_maintenance_date")
    private LocalDateTime lastMaintenanceDate;

    @Column(name = "next_maintenance_date")
    private LocalDateTime nextMaintenanceDate;

    @Column(name = "warranty_expiry_date")
    private LocalDate warrantyExpiryDate;

    @Column(length = 32)
    private String status = "ACTIVE"; // ACTIVE, UNDER_REPAIR, REPLACED, DECOMMISSIONED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
