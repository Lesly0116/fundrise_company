package com.fundrise.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.Formula;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "campaigns")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 5, max = 200)
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull
    @DecimalMin(value = "1.00")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal goalAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal raisedAmount = BigDecimal.ZERO;

    @Column
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CampaignStatus status = CampaignStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    // FIX: replaced LAZY @OneToMany (triggered LazyInitializationException when
    // getDonorCount() was called outside an active Hibernate session) with a
    // @Formula subquery.  The collection is kept for cascade writes; the count
    // is read cheaply via SQL at load time without pulling every Donation row.
    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Donation> donations = new ArrayList<>();

    @Formula("(SELECT COUNT(d.id) FROM donations d " +
             "WHERE d.campaign_id = id AND d.status = 'COMPLETED')")
    private int donorCount;

    @Column(nullable = false)
    @Builder.Default
    private String category = "General";

    @Column
    private String location;

    @Column
    private LocalDateTime endDate;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // getDonorCount() is now backed by @Formula — no lazy-load needed.
    public int getDonorCount() {
        return donorCount;
    }

    public double getProgressPercentage() {
        if (goalAmount == null || goalAmount.compareTo(BigDecimal.ZERO) == 0) return 0;
        return raisedAmount.divide(goalAmount, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }
}
