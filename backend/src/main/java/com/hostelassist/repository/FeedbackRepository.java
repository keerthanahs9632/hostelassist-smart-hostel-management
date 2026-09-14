package com.hostelassist.repository;

import com.hostelassist.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, String> {
    Optional<Feedback> findByComplaintId(String complaintId);
    List<Feedback> findByTechnicianIdOrderByCreatedAtDesc(String technicianId);
    List<Feedback> findByStudentIdOrderByCreatedAtDesc(String studentId);
}
