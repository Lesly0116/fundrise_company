package com.fundrise.repository;

import com.fundrise.model.Campaign;
import com.fundrise.model.CampaignStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    // FIX: all list/page queries now JOIN FETCH the organizer so CampaignService.toSummary()
    // and toResponse() can call c.getOrganizer().getFullName() without N+1 lazy SELECT hits.
    // COUNT queries are kept as separate JPQL expressions (required by Spring Data pagination).

    @Query(value = "SELECT c FROM Campaign c JOIN FETCH c.organizer " +
                   "WHERE c.status = :status ORDER BY c.createdAt DESC",
           countQuery = "SELECT COUNT(c) FROM Campaign c WHERE c.status = :status")
    Page<Campaign> findByStatusOrderByCreatedAtDesc(
            @Param("status") CampaignStatus status, Pageable pageable);

    @Query(value = "SELECT c FROM Campaign c JOIN FETCH c.organizer " +
                   "WHERE c.organizer.id = :organizerId AND c.status != :status " +
                   "ORDER BY c.createdAt DESC",
           countQuery = "SELECT COUNT(c) FROM Campaign c " +
                        "WHERE c.organizer.id = :organizerId AND c.status != :status")
    Page<Campaign> findByOrganizerIdAndStatusNot(
            @Param("organizerId") Long organizerId,
            @Param("status") CampaignStatus status,
            Pageable pageable);

    @Query(value = "SELECT c FROM Campaign c JOIN FETCH c.organizer WHERE c.status = :status AND " +
                   "(LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                   "LOWER(c.category) LIKE LOWER(CONCAT('%', :query, '%')))",
           countQuery = "SELECT COUNT(c) FROM Campaign c WHERE c.status = :status AND " +
                        "(LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(c.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Campaign> searchCampaigns(@Param("query") String query,
                                   @Param("status") CampaignStatus status,
                                   Pageable pageable);

    @Query(value = "SELECT c FROM Campaign c JOIN FETCH c.organizer " +
                   "WHERE c.status = :status AND c.category = :category",
           countQuery = "SELECT COUNT(c) FROM Campaign c " +
                        "WHERE c.status = :status AND c.category = :category")
    Page<Campaign> findByCategoryAndStatus(@Param("category") String category,
                                           @Param("status") CampaignStatus status,
                                           Pageable pageable);

    // FIX: @Query ignores the "Top6" derived-name limit — use Pageable instead
    @Query("SELECT c FROM Campaign c JOIN FETCH c.organizer " +
           "WHERE c.status = :status ORDER BY c.raisedAmount DESC")
    List<Campaign> findFeaturedByStatus(@Param("status") CampaignStatus status,
                                        org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COUNT(c) FROM Campaign c " +
           "WHERE c.status != com.fundrise.model.CampaignStatus.DELETED")
    long countActiveCampaigns();
}
