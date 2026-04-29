-- ============================================================
-- FundRise Database Schema - Version TiBD (sans FULLTEXT)
-- ============================================================

-- Désactivation des contraintes
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- Supprimer et recréer la base
DROP DATABASE IF EXISTS fundrise_db;
CREATE DATABASE fundrise_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fundrise_db;

-- ============================================================
-- NIVEAU 1: Tables sans dépendances étrangères
-- ============================================================

-- TABLE: users
CREATE TABLE users (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password        VARCHAR(255)    NOT NULL,
    bio             TEXT,
    profile_image_url VARCHAR(500),
    role            ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    enabled         TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME(6),
    updated_at      DATETIME(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_enabled (enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NIVEAU 2: campaigns (SANS FULLTEXT INDEX)
-- ============================================================
CREATE TABLE campaigns (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT            NOT NULL,
    goal_amount     DECIMAL(10,2)   NOT NULL,
    raised_amount   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    image_url       VARCHAR(500),
    status          ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    category        VARCHAR(50)     NOT NULL DEFAULT 'General',
    location        VARCHAR(200),
    end_date        DATETIME(6),
    organizer_id    BIGINT          NOT NULL,
    created_at      DATETIME(6),
    updated_at      DATETIME(6),
    PRIMARY KEY (id),
    INDEX idx_campaigns_status (status),
    INDEX idx_campaigns_organizer (organizer_id),
    INDEX idx_campaigns_category (category),
    INDEX idx_campaigns_raised (raised_amount DESC),
    INDEX idx_campaigns_created (created_at DESC),
    -- FULLTEXT INDEX supprimé car non supporté sur TiBD
    CONSTRAINT fk_campaigns_organizer FOREIGN KEY (organizer_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NIVEAU 3: donations
-- ============================================================
CREATE TABLE donations (
    id                          BIGINT          NOT NULL AUTO_INCREMENT,
    amount                      DECIMAL(10,2)   NOT NULL,
    message                     TEXT,
    anonymous                   TINYINT(1)      NOT NULL DEFAULT 0,
    campaign_id                 BIGINT          NOT NULL,
    donor_id                    BIGINT,
    stripe_payment_intent_id    VARCHAR(255),
    status                      ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    donor_name                  VARCHAR(200),
    donor_email                 VARCHAR(255),
    created_at                  DATETIME(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_donations_stripe_id (stripe_payment_intent_id),
    INDEX idx_donations_campaign (campaign_id),
    INDEX idx_donations_donor (donor_id),
    INDEX idx_donations_status (status),
    INDEX idx_donations_created (created_at DESC),
    CONSTRAINT fk_donations_campaign FOREIGN KEY (campaign_id)
        REFERENCES campaigns (id) ON DELETE CASCADE,
    CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id)
        REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NIVEAU 4: campaign_groups
-- ============================================================
CREATE TABLE campaign_groups (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT,
    target_amount   DECIMAL(10,2)   NULL,
    start_date      DATETIME(6),
    end_date        DATETIME(6),
    campaign_id     BIGINT,
    created_at      DATETIME(6),
    PRIMARY KEY (id),
    INDEX idx_campaign_groups_campaign (campaign_id),
    CONSTRAINT fk_campaign_groups_campaign FOREIGN KEY (campaign_id)
        REFERENCES campaigns (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- 1. Insérer les users
INSERT INTO users (first_name, last_name, email, password, role, enabled, created_at, updated_at)
VALUES 
('Admin', 'User', 'admin@fundrise.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LqGEtVDfUEhBJ1W3y', 'ADMIN', 1, NOW(), NOW()),
('Jane', 'Smith', 'jane@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LqGEtVDfUEhBJ1W3y', 'USER', 1, NOW(), NOW()),
('John', 'Doe', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LqGEtVDfUEhBJ1W3y', 'USER', 1, NOW(), NOW());

-- 2. Insérer les campaigns
INSERT INTO campaigns (title, description, goal_amount, raised_amount, image_url, status, category, location, end_date, organizer_id, created_at, updated_at)
VALUES 
('Clean Water Initiative', 'Providing clean water to communities in need', 50000.00, 12500.00, 'https://example.com/clean-water.jpg', 'ACTIVE', 'Environment', 'Global', DATE_ADD(NOW(), INTERVAL 30 DAY), (SELECT id FROM users WHERE email = 'jane@example.com'), NOW(), NOW()),
('Education for All', 'Building schools in rural areas', 75000.00, 45000.00, 'https://example.com/education.jpg', 'ACTIVE', 'Education', 'Africa', DATE_ADD(NOW(), INTERVAL 45 DAY), (SELECT id FROM users WHERE email = 'john@example.com'), NOW(), NOW());

-- 3. Insérer les donations
INSERT INTO donations (amount, message, anonymous, campaign_id, donor_id, status, donor_name, donor_email, created_at)
VALUES 
(100.00, 'Great initiative!', 0, (SELECT id FROM campaigns WHERE title = 'Clean Water Initiative' LIMIT 1), (SELECT id FROM users WHERE email = 'jane@example.com'), 'COMPLETED', 'Jane Smith', 'jane@example.com', NOW()),
(250.00, 'Keep up the good work!', 0, (SELECT id FROM campaigns WHERE title = 'Education for All' LIMIT 1), (SELECT id FROM users WHERE email = 'john@example.com'), 'COMPLETED', 'John Doe', 'john@example.com', NOW());

-- ============================================================
-- RÉACTIVATION DES CONTRAINTES
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;
SET AUTOCOMMIT = 1;

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT ' Base de données créée avec succès !' AS Statut;
SELECT COUNT(*) AS Utilisateurs FROM users;
SELECT COUNT(*) AS Campagnes FROM campaigns;
SELECT COUNT(*) AS Dons FROM donations;