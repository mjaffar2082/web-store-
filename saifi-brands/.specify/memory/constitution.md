# Saifi Brands Constitution

## Core Principles

### I. Full-Stack TypeScript
Every feature spans frontend (Next.js/React/TypeScript) and backend (Node.js/Express/TypeScript). Shared types across the stack. Prisma for type-safe database access.

### II. Clean Architecture & SOLID
Components, services, and APIs follow Single Responsibility, Dependency Injection, and Interface Segregation. Separation of concerns between UI, business logic, and data access.

### III. Security-First
JWT + refresh tokens, bcrypt, rate limiting, Helmet, CORS, XSS/CSRF protection, input validation (Zod), secure cookies, environment variable isolation. Every endpoint validates and sanitizes.

### IV. Performance-Optimized
SSR/SSG via Next.js, image optimization, lazy loading, code splitting, Redis caching, compression, bundle optimization. Target Lighthouse scores >90.

### V. Premium UX
Mobile-first responsive design (320px–4K), glassmorphism, Framer Motion animations, skeleton loaders, toast notifications, dark/light mode, ARIA accessibility.

### VI. SEO & Discoverability
Dynamic meta tags, Open Graph, Twitter Cards, canonical URLs, sitemap.xml, robots.txt, Schema.org markup, breadcrumbs, optimized URLs.

### VII. Testable & Maintainable
TypeScript throughout, reusable components, custom hooks, proper error handling, loading/empty/error states, modular code, ESLint + Prettier standards.

## Brand Identity
- **Store**: Saifi Brands — Premium Multi-Category eCommerce
- **Style**: Premium, Luxury, Minimal, Modern, Fast, Responsive
- **Primary**: #2563EB | **Secondary**: #FFFFFF | **Accent**: #F97316
- **Text**: #111827 | **Border**: #E5E7EB | **Success**: #22C55E | **Warning**: #F59E0B | **Danger**: #EF4444
- **Typography**: Inter | **Icons**: Lucide React | **Animations**: Framer Motion

## Tech Stack

### Frontend
Next.js (Latest) · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion · React Hook Form · Zod · Redux Toolkit · TanStack Query · Axios · Lucide Icons · Swiper.js · Chart.js

### Backend
Node.js · Express.js · REST API · JWT · RBAC · Bcrypt · Multer · Cloudinary

### Database & Infra
PostgreSQL · Prisma ORM · Redis · Stripe · PayPal · Resend · Nodemailer

## Architecture
- **Frontend**: Next.js App Router with server/client component separation
- **Backend**: Express.js modular routes with middleware pipeline
- **Auth**: JWT access + refresh token rotation, OTP, Google OAuth
- **Payments**: Stripe + PayPal + COD with coupon/gift card/reward system
- **Multi-role**: Admin, Seller, Customer dashboards with RBAC

## Governance
- Constitution supersedes all other practices
- Every feature follows: Spec → Plan → Tasks → Red → Green → Refactor
- PRs must verify compliance with this constitution
- Complexity must be justified; prefer YAGNI
- Amendments require documented approval

**Version**: 1.0.0 | **Ratified**: 2026-07-15 | **Last Amended**: 2026-07-15
