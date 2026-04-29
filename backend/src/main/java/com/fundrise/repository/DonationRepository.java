package com.fundrise.repository;

import com.fundrise.model.Donation;
import com.fundrise.model.DonationStatus;
import com.fundrise.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    // FIX: added JOIN FETCH for campaign on the paginated query so DonationService.toResponse()
    // can access d.getCampaign().getId() / getTitle() without triggering N+1 lazy loads.
    // COUNT query kept separate (required by Spring Data for paginated @Query).
    @Query(value = "SELECT d FROM Donation d JOIN FETCH d.campaign " +
                   "WHERE d.campaign.id = :campaignId AND d.status = :status " +
                   "ORDER BY d.createdAt DESC",
           countQuery = "SELECT COUNT(d) FROM Donation d " +
                        "WHERE d.campaign.id = :campaignId AND d.status = :status")
    Page<Donation> findByCampaignIdAndStatusOrderByCreatedAtDesc(
            @Param("campaignId") Long campaignId,
            @Param("status") DonationStatus status,
            Pageable pageable);

    // FIX: added JOIN FETCH for campaign so "My Donations" dashboard never triggers
    // N+1 SELECT statements when mapping campaign title/id for each donation row.
    @Query("SELECT d FROM Donation d JOIN FETCH d.campaign " +
           "WHERE d.donor.id = :donorId ORDER BY d.createdAt DESC")
    List<Donation> findByDonorIdOrderByCreatedAtDesc(@Param("donorId") Long donorId);

    Optional<Donation> findByStripePaymentIntentId(String paymentIntentId);

    @Query("SELECT SUM(d.amount) FROM Donation d " +
           "WHERE d.campaign.id = :campaignId AND d.status = 'COMPLETED'")
    BigDecimal sumCompletedDonationsByCampaign(@Param("campaignId") Long campaignId);

    @Query("SELECT COUNT(d) FROM Donation d " +
           "WHERE d.campaign.id = :campaignId AND d.status = 'COMPLETED'")
    long countCompletedDonationsByCampaign(@Param("campaignId") Long campaignId);

    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.status = 'COMPLETED'")
    BigDecimal sumAllCompletedDonations();

    long countByStatus(DonationStatus status);

    List<Donation> findByDonorAndStatusOrderByCreatedAtDesc(User donor, DonationStatus status);
    long countByDonorAndStatus(User donor, DonationStatus status);
}
