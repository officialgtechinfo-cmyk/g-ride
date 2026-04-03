# G-RIDE - Development Plan

## Design Guidelines

### Design References
- Premium ride-hailing apps (Uber, Bolt) with Nigerian cultural identity
- Style: Dark Premium + Gold Accents + Tech-forward

### Color Palette
- Primary Background: #0F1419 (Deep Charcoal)
- Secondary Background: #1A2332 (Dark Navy)
- Card Background: #1E2A3A (Elevated Navy)
- Accent Gold: #D4A843 (Premium Gold)
- Accent Gold Light: #F0D78C (Light Gold)
- Success: #22C55E (Green)
- Danger: #EF4444 (Red)
- Text Primary: #FFFFFF
- Text Secondary: #94A3B8 (Slate)
- Border: #2A3A4A

### Typography
- Headings: Inter font-weight 700
- Body: Inter font-weight 400
- Accent: Inter font-weight 600

### Key Component Styles
- Buttons: Gold gradient background, dark text, 8px rounded, hover glow
- Cards: Dark navy with subtle gold border, 12px rounded
- Inputs: Dark background with gold focus border
- Pulsing CTAs: Gold outline pulse animation on booking buttons

### Images (CDN)
1. hero-banner-lagos-ride.jpg - Hero banner with Lagos cityscape
2. courier-delivery-nigeria.jpg - Motorcycle courier delivery
3. professional-driver-portrait.jpg - Professional driver portrait
4. city-network-aerial.jpg - Aerial city network view

---

## Database Tables (Backend)

1. **kyc_profiles** - KYC verification data (NIN, selfie, document, AI score, status)
2. **rides** - Ride bookings (user, driver, mode, pickup, destination, fare, status)
3. **payments** - Payment records (ride_id, amount, admin_share, partner_share, status)
4. **admin_notifications** - Real-time notifications for admin dashboard

---

## File Structure (8 files max)

### Frontend Files
1. **src/pages/Index.tsx** - Landing page with hero, features, service modes, footer
2. **src/pages/Dashboard.tsx** - User dashboard (booking, ride history, active ride, payment flow)
3. **src/pages/KYCRegistration.tsx** - Multi-step KYC registration (name, NIN, document upload, selfie, terms)
4. **src/pages/AdminDashboard.tsx** - Pro Admin dashboard (verification hub, payments, ledger, users)
5. **src/pages/AdminLogin.tsx** - Separate admin login page
6. **src/lib/api.ts** - API client, auth helpers, web-sdk integration
7. **src/lib/nigeria-data.ts** - Nigeria states, LGAs data for cascading dropdowns
8. **src/App.tsx** - Router with all routes

### Backend Files (auto-generated from tables + custom)
- backend/routers/admin.py - Admin-specific endpoints (verify KYC, confirm payment, stats)

---

## Implementation Order

1. Create database tables (kyc_profiles, rides, payments, admin_notifications)
2. Create object storage bucket for KYC documents
3. Write nigeria-data.ts (states + LGAs)
4. Write lib/api.ts (web-sdk client, auth helpers)
5. Write Index.tsx (landing page)
6. Write KYCRegistration.tsx (multi-step KYC)
7. Write Dashboard.tsx (user booking + payment flow)
8. Write AdminLogin.tsx + AdminDashboard.tsx (admin platform)
9. Write backend admin router
10. Update App.tsx with all routes
11. Update index.html title
12. Lint, build, check