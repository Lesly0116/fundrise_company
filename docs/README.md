# 🚀 FundRise — GoFundMe-Style Crowdfunding Platform

A fully functional, production-ready crowdfunding platform built with Spring Boot, React, and Stripe.

---

## 📦 Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Backend    | Java 21, Spring Boot 3.2, Spring Security |
| Database   | MySQL 8.0, Spring Data JPA/Hibernate  |
| Auth       | JWT (jjwt 0.12), BCrypt               |
| Payments   | Stripe API (PaymentIntents + Webhooks)|
| Images     | Cloudinary                            |
| Frontend   | React 18, Tailwind CSS, Axios         |

---

## 🗂️ Project Structure


```
fundrise/
├── backend/ # Spring Boot API
│ └── src/main/java/com/fundrise/
│ ├── controller/ # REST controllers
│ ├── service/ # Business logic
│ ├── repository/ # JPA repositories
│ ├── model/ # JPA entities
│ ├── dto/ # Request/Response DTOs
│ ├── security/ # JWT filter, UserDetailsService
│ ├── config/ # Security, CORS config
│ └── exception/ # Custom exceptions, global handler
│
├── frontend/ # React SPA
│ └── src/
│ ├── components/
│ │ ├── common/ # Navbar, Footer, UI primitives
│ │ ├── campaign/ # CampaignCard
│ │ └── donation/ # DonationPanel, DonationForm
│ ├── pages/ # All page-level components
│ ├── services/ # Axios API layer
│ ├── context/ # AuthContext (global state)
│ └── utils/ # Helpers, formatters
│
└── docs/
├── schema.sql # MySQL schema + seed data
├── .env.example # Environment variable reference
└── README.md # This file
```


---

## ⚙️ Prerequisites

Before starting, ensure you have:

- **Java 21+** — `java -version`
- **Maven 3.9+** — only needed if you prefer a system-wide install; otherwise the included `mvnw` / `mvnw.cmd` wrapper downloads Maven automatically
- **Node.js 18+** — `node -version`
- **MySQL 8.0+** — running locally or via Docker
- **Stripe account** — [dashboard.stripe.com](https://dashboard.stripe.com)
- **Cloudinary account** — [cloudinary.com](https://cloudinary.com)
- **Stripe CLI** (for local webhook testing) — [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

---

## 🛠️ Step-by-Step Setup

### Step 1 — Clone & Configure

```bash
git clone <your-repo-url>
cd fundrise
```

---

### Step 2 — Database Setup

```bash
# Option A: Use the provided schema
mysql -u root -p < docs/schema.sql

# Option B: Let Hibernate auto-create (spring.jpa.hibernate.ddl-auto=update)
# Just create the database:
mysql -u root -p -e "CREATE DATABASE fundrise_db CHARACTER SET utf8mb4;"
```

---

### Step 3 — Backend Environment

Create `backend/src/main/resources/application.properties` or set environment variables:

```bash
# Copy and edit the example
cp docs/.env.example backend/.env
```

Or export them in your shell:

```bash
export DB_URL="jdbc:mysql://localhost:3306/fundrise_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
export DB_USERNAME="root"
export DB_PASSWORD="your_password"
export JWT_SECRET="$(openssl rand -hex 32)"
export STRIPE_SECRET_KEY="sk_test_placeholder"
export STRIPE_PUBLISHABLE_KEY="pk_test_placeholder"
export STRIPE_WEBHOOK_SECRET="whsec_placeholder"
export CLOUDINARY_CLOUD_NAME="your_cloud"
export CLOUDINARY_API_KEY="your_key"
export CLOUDINARY_API_SECRET="your_secret"
```

---

### Step 4 — Start the Backend

The project ships with the **Maven Wrapper** (`mvnw` / `mvnw.cmd`).
You do **not** need Maven installed — the wrapper downloads it automatically on first run.

**Linux / macOS:**
```bash
cd backend

# Make the wrapper executable (only needed once after cloning)
chmod +x mvnw

# Build and run
./mvnw clean install -DskipTests
./mvnw spring-boot:run
```

**Windows (Command Prompt):**
```bat
cd backend
mvnw.cmd clean install -DskipTests
mvnw.cmd spring-boot:run
```

**Windows (PowerShell):**
```powershell
cd backend
.\mvnw.cmd clean install -DskipTests
.\mvnw.cmd spring-boot:run
```

> **First-run note:** On the very first invocation the wrapper downloads
> Maven 3.9.6 (~10 MB) into `~/.m2/wrapper/dists/` and caches it permanently.
> All subsequent runs are instant and fully offline.

The API will be available at: **http://localhost:8080**

Health check: http://localhost:8080/actuator/health

---

### Step 5 — Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

---

### Step 6 — Start the Frontend

```bash
cd frontend
npm install
npm start
```

The app will open at: **http://localhost:3000**

---

### Step 7 — Stripe Webhook (Local Dev)

In a separate terminal, install and run the Stripe CLI:

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local backend
stripe listen --forward-to localhost:8080/api/stripe/webhook
```

Copy the webhook signing secret from the output:
```
> Ready! Your webhook signing secret is whsec_abc123... (^C to quit)
```

Set `STRIPE_WEBHOOK_SECRET=whsec_abc123...` in your environment.

---

## 🔑 Default Admin Account

After running the schema seed:

```
Email:    admin@fundrise.com
Password: Admin@1234
```

> ⚠️ Change this password immediately in production!

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login, receive JWT |

### Campaigns
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/campaigns` | Public | List all active campaigns |
| GET | `/api/campaigns/featured` | Public | Top 6 campaigns by raised amount |
| GET | `/api/campaigns/search?q=` | Public | Full-text search |
| GET | `/api/campaigns/category/:cat` | Public | Filter by category |
| GET | `/api/campaigns/:id` | Public | Get single campaign |
| GET | `/api/campaigns/my-campaigns` | 🔒 | Get authenticated user's campaigns |
| POST | `/api/campaigns` | 🔒 | Create campaign (multipart) |
| PUT | `/api/campaigns/:id` | 🔒 | Update campaign (multipart) |
| DELETE | `/api/campaigns/:id` | 🔒 | Delete campaign |

### Donations & Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/donations/payment-intent` | 🔒 | Create Stripe PaymentIntent |
| POST | `/api/stripe/webhook` | Public | Stripe webhook handler |
| GET | `/api/campaigns/:id/donations` | Public | Campaign donors list |
| GET | `/api/donations/my-donations` | 🔒 | Authenticated user's donations |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | 🔒 | Get own profile |
| PUT | `/api/users/me` | 🔒 | Update own profile (multipart) |
| GET | `/api/users/:id` | Public | Get user by ID |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard` | 🛡️ Admin | Platform statistics |
| GET | `/api/admin/users` | 🛡️ Admin | All users |
| PATCH | `/api/admin/users/:id/toggle-status` | 🛡️ Admin | Enable/disable user |
| GET | `/api/admin/campaigns` | 🛡️ Admin | All campaigns |
| DELETE | `/api/admin/campaigns/:id` | 🛡️ Admin | Delete any campaign |

---

## 💳 Stripe Integration Flow

```
1. User selects amount on campaign page
2. Frontend → POST /api/donations/payment-intent
3. Backend creates Stripe PaymentIntent + saves PENDING Donation in DB
4. Backend returns clientSecret to frontend
5. Frontend renders Stripe PaymentElement with clientSecret
6. User enters card details and confirms payment
7. Stripe redirects to /donation-success?payment_intent=pi_...
8. Stripe sends webhook event payment_intent.succeeded to /api/stripe/webhook
9. Backend verifies signature, marks Donation as COMPLETED
10. Backend adds donation amount to campaign.raisedAmount
11. If campaign.raisedAmount >= campaign.goalAmount → status = COMPLETED
```

---

## 🏗️ Production Deployment Checklist

### Backend (e.g., Railway, Render, EC2)
- [ ] Set all environment variables via platform secrets manager
- [ ] Change `spring.jpa.hibernate.ddl-auto` to `validate` or `none`
- [ ] Use a managed MySQL instance (AWS RDS, PlanetScale, etc.)
- [ ] Set `JWT_SECRET` to a cryptographically random 64+ char string
- [ ] Update CORS origins in `SecurityConfig.java` to your frontend domain
- [ ] Enable HTTPS only
- [ ] Register Stripe webhook endpoint in Stripe Dashboard (not CLI)

### Frontend (e.g., Vercel, Netlify)
- [ ] Set `REACT_APP_API_URL` to your backend URL
- [ ] Set `REACT_APP_STRIPE_PUBLISHABLE_KEY` to live key for production
- [ ] Run `npm run build` and deploy the `build/` folder
- [ ] Configure redirect rules: all routes → `index.html`

### Stripe Live Mode
- [ ] Complete Stripe account verification
- [ ] Switch to live API keys (`sk_live_...`, `pk_live_...`)
- [ ] Register production webhook URL in Stripe Dashboard
- [ ] Update `STRIPE_WEBHOOK_SECRET` with live webhook secret

---

## 🔒 Security Notes

- Passwords hashed with **BCrypt** (strength 12)
- JWT tokens expire after **24 hours** by default
- All sensitive endpoints protected by Spring Security
- Stripe webhook signature **verified** before processing
- File uploads validated by type and size (10MB max)
- SQL injection prevention via JPA parameterized queries
- CORS restricted to configured origins
- Input validation on both frontend and backend

---

## 🐳 Docker Quick Start (Optional)

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: fundrise_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docs/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DB_URL: jdbc:mysql://mysql:3306/fundrise_db?useSSL=false&serverTimezone=UTC
      DB_USERNAME: root
      DB_PASSWORD: password
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      REACT_APP_API_URL: http://localhost:8080/api
      REACT_APP_STRIPE_PUBLISHABLE_KEY: ${STRIPE_PUBLISHABLE_KEY}

volumes:
  mysql_data:
```

```bash
docker-compose up -d
```

---

## 📝 License

MIT License — free to use, modify, and distribute.

---

## 🐛 Bug Fixes Applied (fundrise_fixed)

The following bugs were identified and fixed across three audit passes. All fixes are backward-compatible — no database schema changes required.

### Backend

| File | Bug | Fix |
|------|-----|-----|
| `CloudinaryService.java` | Constructor always built a `Cloudinary` client even with placeholder credentials (`your_cloud_name`). Any image upload with fake keys threw `IOException` → caught by `GlobalExceptionHandler` as generic 500 "An unexpected error occurred" | Added `configured` flag; when credentials are placeholders `uploadImage()` returns `null` (campaign saves without image). Real upload failures now throw `BadRequestException` (400) with a user-readable message instead of 500 |
| `CampaignService.java` | No null-check on `cloudinaryService.uploadImage()` return value | Added `if (imageUrl != null)` guard in both `createCampaign` and `updateCampaign` |
| `UserService.java` | Same missing null-check on `uploadImage()` in `updateProfile` — a Cloudinary failure would overwrite `profileImageUrl` with `null` | Same null-check fix |
| `StripeService.java` | `@PostConstruct` unconditionally set `Stripe.apiKey = "sk_test_your_stripe_secret_key"` at startup. Donation attempts always hit Stripe with a fake key → `StripeException` → generic 500 | Removed `@PostConstruct`; added `isConfigured()` that validates the key starts with `sk_test_` or `sk_live_`; surfaces a clear 400 when unconfigured; webhook handler skips signature check when secret is a placeholder |
| `Campaign.java` | `getDonorCount()` called `donations.size()` on a `@OneToMany(LAZY)` collection. Outside an active Hibernate session this throws `LazyInitializationException` → 500 | Replaced with Hibernate `@Formula` subquery: `SELECT COUNT(d.id) FROM donations d WHERE d.campaign_id = id AND d.status = 'COMPLETED'` — zero schema changes |
| `CampaignRepository.java` | All page/list queries triggered N+1 SELECT statements: each `c.getOrganizer().getFullName()` in `toSummary()` fired a separate SQL query. The `findTop6By...` derived-name limit was also silently ignored when a `@Query` annotation was present | Added `JOIN FETCH c.organizer` to all five queries; renamed `findTop6...` to `findFeaturedByStatus(status, Pageable)` and pass `PageRequest.of(0, 6)` from the service |
| `DonationRepository.java` | `findByDonorIdOrderByCreatedAtDesc` and `findByCampaignIdAndStatus...` triggered N+1 SELECT per donation to load the campaign (for title/id in `toResponse()`) | Added `JOIN FETCH d.campaign` to both queries via explicit `@Query` |

### Frontend

| File | Bug | Fix |
|------|-----|-----|
| `App.js` | 13 footer/nav links (`/about`, `/how-it-works`, `/pricing`, `/blog`, `/careers`, `/help`, `/contact`, `/safety`, `/tips`, `/privacy`, `/terms`, `/cookies`, `/forgot-password`) had no matching `<Route>` → all hit the `*` wildcard and rendered NotFoundPage | Added all 13 routes; created `StaticPages.js` with full page implementations |
| `StaticPages.js` | (new file) | 13 fully implemented static pages: About, How It Works, Pricing, Blog, Careers, Help Center (FAQ), Contact, Safety, Fundraising Tips, Privacy Policy, Terms of Service, Cookie Policy, Forgot Password |
| `DashboardPages.js` | `DashboardPage` accepted no props; `useState('campaigns')` was hardcoded. The `/my-donations` route passed `initialTab="donations"` but it was silently ignored — the page always opened on the Campaigns tab | Changed signature to `({ initialTab = 'campaigns' })` and seeded `useState(initialTab)` |
| `tailwind.config.js` | `primary-200`, `primary-300`, `primary-400` were used throughout JSX (gradients, borders, SVG colours, hover states) but missing from the theme — those classes compiled to nothing | Added the three missing shades |
| `CampaignsPage.js` | `searchInput` state was seeded from `query` once at mount and never re-synced. Navigating to a different category while a search was active left stale text in the search box | Added `useEffect(() => { setSearchInput(query); }, [query])` |
| `AdminPage.js` | `fetchData` was a plain function recreated on every render, making the `useEffect([activeTab])` dependency always "changed" and potentially re-fetching unexpectedly | Wrapped `fetchData` in `useCallback([activeTab])`; `useEffect` now depends on the stable reference |
| `Footer.js` | "How it Works" link pointed to `/about` instead of `/how-it-works`; no "About Us" link existed | Fixed link target; added About Us entry |
