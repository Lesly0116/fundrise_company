# FundRise v2 Upgrade Guide

This document explains every change made in the v2 upgrade and how to integrate it into a fresh environment.

---

## 1. Backend: Image Upload Fix

### What was broken
When Cloudinary credentials are not configured (the default for local development), `CloudinaryService.uploadImage()` returned `null` and images were never stored or displayed.

### What was changed

**New files:**
- `service/LocalStorageService.java` — saves uploads to `./uploads/{folder}/` on disk
- `controller/UploadsController.java` — serves those files at `GET /api/uploads/{folder}/{filename}`

**Updated files:**
- `service/CloudinaryService.java` — injects `LocalStorageService`; when Cloudinary is unconfigured delegates to local storage instead of returning `null`
- `resources/application.properties` — added `app.uploads.dir` and `app.uploads.base-url`

### How images now work in development
1. User uploads an image on the Create Campaign form
2. `CampaignController` receives the `MultipartFile`
3. `CampaignService` calls `cloudinaryService.uploadImage(file, "campaigns")`
4. `CloudinaryService` detects no valid credentials → calls `localStorageService.saveImage()`
5. File is saved to `./uploads/campaigns/{uuid}.jpg`
6. URL `http://localhost:8080/api/uploads/campaigns/{uuid}.jpg` is stored in the DB
7. Frontend renders `<img src="http://localhost:8080/api/uploads/campaigns/...">` — **image displays**
8. `UploadsController` serves the file from disk with `Cache-Control: public, max-age=31536000`

### Production (with Cloudinary)
Set the three env vars; `CloudinaryService` detects real credentials and uploads to CDN exactly as before.

### New env vars (add to your `.env`):
```
UPLOADS_DIR=uploads                      # local storage directory
APP_BASE_URL=http://localhost:8080       # base URL for local image links
```

---

## 2. Frontend: New Dependencies

Run this after pulling the new code:
```bash
cd frontend
npm install
```

New packages added to `package.json`:
| Package | Version | Purpose |
|---------|---------|---------|
| `framer-motion` | ^11.0.8 | Page animations, hover effects, scroll reveals |
| `i18next` | ^23.10.0 | Core i18n engine |
| `react-i18next` | ^14.1.0 | React bindings for i18next |
| `i18next-browser-languagedetector` | ^7.2.1 | Auto-detects browser language |

---

## 3. Multi-Language Support (EN / FR / ES)

### New files:
```
src/i18n/
  index.js                    # i18next initialisation
  locales/
    en.json                   # English (default)
    fr.json                   # French
    es.json                   # Spanish
```

### How it works
- `src/index.js` imports `./i18n` before `App` so translations are ready on first render
- Language is auto-detected from the browser then persisted to `localStorage` under key `fundrise_lang`
- Switching language: user clicks the flag button in the **Footer** (bottom-right)
- The language switcher animates open with `framer-motion` `AnimatePresence`

### Adding a new language
1. Create `src/i18n/locales/de.json` (copy structure from `en.json`)
2. Import it in `src/i18n/index.js`:
   ```js
   import de from './locales/de.json';
   // add to resources:
   resources: { en: {...}, fr: {...}, es: {...}, de: { translation: de } }
   ```
3. Add to `LANGUAGES` array in `src/i18n/index.js`:
   ```js
   { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
   ```

### Translated components
Only homepage-visible components are i18n'd to avoid breaking any existing page:
- `Navbar.js` — all nav labels
- `Footer.js` — all footer text + language switcher
- `HomePage.js` — all hero/stats/sections text
- `CampaignCard.js` — "raised", "goal", "donor/donors", category labels

---

## 4. Homepage Redesign

### Changed file: `src/pages/HomePage.js`

**Design direction:** Dark luxury × clean editorial. Deep navy hero (`#0a1628`) with animated emerald gradient mesh, DM Serif Display display font for headlines, glassmorphism search bar. Light sections for content.

**Animations (Framer Motion):**
| Effect | How |
|--------|-----|
| Hero entrance | `motion.div` with `variants={stagger}` staggers all hero children in sequence |
| Parallax hero bg | `useScroll` + `useTransform` translates the background `y` as user scrolls |
| Floating orbs | `animate={{ scale: [1, 1.15, 1] }}` with `repeat: Infinity` |
| Animated underline | `motion.span` width animates `0% → 100%` after 0.8s delay |
| Stat counters | Custom `Counter` component counts up when scrolled into view via `useInView` |
| Section reveals | `useInView` with `once: true, margin: '-80px'` triggers `variants={stagger}` |
| Card hover | `whileHover={{ y: -4 }}` on featured campaign cards |
| Trust cards | `whileHover={{ scale: 1.02 }}` |
| CTA button | `whileHover={{ scale: 1.04 }}`, `whileTap={{ scale: 0.97 }}` |
| Navbar dropdown | `AnimatePresence` + `motion.div` fade+scale on open/close |
| Mobile menu | `AnimatePresence` + `height: 'auto'` slide open/close |
| Language switcher | `AnimatePresence` fade+slide up from bottom |

**Aspect ratios used:**
- Hero section: 100vh (full viewport)
- Campaign cards: `aspect-video` (16:9) for images — same as GoFundMe
- Category icons: square tiles

---

## 5. Royalty-Free Image Suggestions

All images are from Unsplash (free for commercial use: https://unsplash.com/license).

Download each, rename as shown, and place in `public/images/`:

| Usage | Download URL | Save as |
|-------|-------------|---------|
| Hero background | https://unsplash.com/photos/QwqDpRFnFss | `hero-bg.jpg` |
| How It Works — step 1 | https://unsplash.com/photos/5QgIuuBxKwM | `step-create.jpg` |
| How It Works — step 2 | https://unsplash.com/photos/CSpjU6hYo_0 | `step-share.jpg` |
| How It Works — step 3 | https://unsplash.com/photos/nApaSgkzaxg | `step-receive.jpg` |
| Medical category | https://unsplash.com/photos/L8tWZT4CcVQ | `cat-medical.jpg` |
| Community category | https://unsplash.com/photos/fnztlIb52gU | `cat-community.jpg` |
| Education category | https://unsplash.com/photos/NIJuEQw0RKg | `cat-education.jpg` |
| Emergency category | https://unsplash.com/photos/zjbDMJMQBr0 | `cat-emergency.jpg` |
| Environment category | https://unsplash.com/photos/XMFZqrGyV-Q | `cat-environment.jpg` |

### Using in React:
```jsx
// Stored locally in /public/images/
<img src="/images/hero-bg.jpg" alt="Fundraising" className="w-full h-full object-cover" />

// Or as a CSS background:
<div style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }} className="..." />
```

GoFundMe-style aspect ratios to follow:
- Hero: 16:9 wide, cropped to show faces/emotion in center
- Campaign cards: 16:9, subject centered (matches `aspect-video` in CampaignCard.js)
- Category tiles: 1:1 square, abstract/symbolic imagery

---

## 6. Step-by-Step Integration

```bash
# 1. Pull the new files into your project
cp -r fundrise_v2/backend/src fundrise/backend/src
cp -r fundrise_v2/frontend/src fundrise/frontend/src
cp    fundrise_v2/frontend/package.json fundrise/frontend/package.json
cp    fundrise_v2/frontend/tailwind.config.js fundrise/frontend/tailwind.config.js

# 2. Install new frontend dependencies
cd fundrise/frontend && npm install

# 3. (Optional) Add to backend .env or application.properties:
#    UPLOADS_DIR=uploads
#    APP_BASE_URL=http://localhost:8080

# 4. Restart the Spring Boot backend
cd ../backend && ./mvnw spring-boot:run

# 5. Start the frontend
cd ../frontend && npm start

# 6. Test image upload:
#    - Register, log in, create a campaign with an image
#    - Check that ./uploads/campaigns/ now contains the file
#    - Verify the image shows on the campaign detail page

# 7. Test language switching:
#    - Scroll to Footer, click the flag button (bottom-right)
#    - Switch to French or Spanish — homepage and navbar update immediately
#    - Refresh page — language persists (stored in localStorage as 'fundrise_lang')
```

---

## 7. Production Notes

- Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` → images go to CDN, `UploadsController` is bypassed entirely
- Set `APP_BASE_URL` to your actual domain (e.g. `https://api.fundrise.com`) for correct local image URLs in non-Cloudinary environments
- The `uploads/` directory should be on a persistent volume (not ephemeral container storage) if you use local storage in production
- For horizontal scaling with local storage, use a shared volume (NFS / EFS) or switch to Cloudinary
