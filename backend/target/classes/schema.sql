-- HOSTELASSIST Production MySQL Schema
CREATE DATABASE IF NOT EXISTS hostelassist CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hostelassist;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'TECHNICIAN', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    room_number VARCHAR(32),
    block VARCHAR(32),
    phone VARCHAR(32),
    specialty VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_room (room_number)
) ENGINE=InnoDB;

-- 2. Assets table
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    asset_code VARCHAR(64) NOT NULL UNIQUE,
    category ENUM('Electrical', 'Plumbing', 'Furniture', 'Water', 'Internet', 'Cleaning', 'Bathroom', 'Room', 'Safety', 'Other') NOT NULL,
    block VARCHAR(32) NOT NULL,
    floor INT DEFAULT 1,
    room_number VARCHAR(32) NOT NULL,
    condition_status ENUM('EXCELLENT', 'GOOD', 'NEEDS_ATTENTION', 'CRITICAL') DEFAULT 'GOOD',
    purchase_date DATE,
    purchase_cost DECIMAL(10,2) DEFAULT 0.00,
    total_repair_cost DECIMAL(10,2) DEFAULT 0.00,
    last_maintenance_date TIMESTAMP NULL,
    next_maintenance_date TIMESTAMP NULL,
    warranty_expiry_date DATE,
    status ENUM('ACTIVE', 'UNDER_REPAIR', 'REPLACED', 'DECOMMISSIONED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_asset_code (asset_code),
    INDEX idx_asset_location (block, room_number)
) ENGINE=InnoDB;

-- 3. Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(64) PRIMARY KEY,
    ticket_number VARCHAR(64) NOT NULL UNIQUE,
    student_id VARCHAR(64) NOT NULL,
    student_name VARCHAR(120) NOT NULL,
    student_email VARCHAR(120) NOT NULL,
    room_number VARCHAR(32) NOT NULL,
    block VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('Electrical', 'Plumbing', 'Furniture', 'Water', 'Internet', 'Cleaning', 'Bathroom', 'Room', 'Safety', 'Other') NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('REPORTED', 'REVIEWED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED') NOT NULL DEFAULT 'REPORTED',
    image_url VARCHAR(255),
    repair_evidence_url VARCHAR(255),
    asset_id VARCHAR(64),
    assigned_technician_id VARCHAR(64),
    assigned_technician_name VARCHAR(120),
    sla_deadline TIMESTAMP NOT NULL,
    is_overdue BOOLEAN DEFAULT FALSE,
    total_repair_cost DECIMAL(10,2) DEFAULT 0.00,
    work_notes TEXT,
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_technician_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    INDEX idx_cmp_status (status),
    INDEX idx_cmp_priority (priority),
    INDEX idx_cmp_room (block, room_number),
    INDEX idx_cmp_sla (sla_deadline)
) ENGINE=InnoDB;

-- 4. Complaint History table
CREATE TABLE IF NOT EXISTS complaint_history (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    from_status VARCHAR(32),
    to_status VARCHAR(32),
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(120) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    notes TEXT,
    repair_cost DECIMAL(10,2),
    evidence_image_url VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    INDEX idx_history_cmp (complaint_id)
) ENGINE=InnoDB;

-- 5. Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL UNIQUE,
    student_id VARCHAR(64) NOT NULL,
    student_name VARCHAR(120) NOT NULL,
    technician_id VARCHAR(64),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    timeliness_score INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO', 'ASSIGNMENT', 'STATUS_CHANGE', 'SLA_BREACH', 'RECURRING_ALERT', 'FEEDBACK_REQUEST') NOT NULL,
    complaint_id VARCHAR(64),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB;

-- 7. Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    action VARCHAR(64) NOT NULL,
    performed_by VARCHAR(120) NOT NULL,
    user_role VARCHAR(32) NOT NULL,
    entity_type ENUM('USER', 'COMPLAINT', 'ASSET', 'MAINTENANCE', 'SYSTEM') NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_time (timestamp)
) ENGINE=InnoDB;

-- 8. Preventive Maintenance table
CREATE TABLE IF NOT EXISTS preventive_maintenance (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    target_category ENUM('Electrical', 'Plumbing', 'Furniture', 'Water', 'Internet', 'Cleaning', 'Bathroom', 'Room', 'Safety', 'Other') NOT NULL,
    target_block VARCHAR(32) NOT NULL,
    suggested_action TEXT NOT NULL,
    frequency_days INT DEFAULT 30,
    last_run_date TIMESTAMP NULL,
    next_scheduled_date TIMESTAMP NOT NULL,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    created_reason ENUM('MANUAL', 'AI_FAILURE_PATTERN_ALERT') DEFAULT 'MANUAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
