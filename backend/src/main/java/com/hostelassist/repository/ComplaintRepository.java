package com.hostelassist.repository;

import com.hostelassist.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {
    Optional<Complaint> findByTicketNumber(String ticketNumber);
    List<Complaint> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<Complaint> findByAssignedTechnicianIdOrderByCreatedAtDesc(String technicianId);
    List<Complaint> findByStatus(String status);
    List<Complaint> findByPriority(String priority);

    @Query("SELECT c FROM Complaint c WHERE c.block = :block AND c.roomNumber = :room AND c.category = :category AND c.createdAt >= :cutoff ORDER BY c.createdAt ASC")
    List<Complaint> findRecurringCandidates(
        @Param("block") String block,
        @Param("room") String roomNumber,
        @Param("category") String category,
        @Param("cutoff") LocalDateTime cutoff
    );

    @Query("SELECT c FROM Complaint c WHERE c.status NOT IN ('RESOLVED', 'CLOSED') AND c.slaDeadline < :now")
    List<Complaint> findOverdueComplaints(@Param("now") LocalDateTime now);
}
