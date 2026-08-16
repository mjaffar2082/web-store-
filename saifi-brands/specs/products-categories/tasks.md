---

description: "Task list for Products & Categories feature implementation"

---

# Tasks: Products & Categories

**Input**: Design documents from `/specs/products-categories/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and configuration

- [x] T001 Create monorepo structure with `frontend/` and `backend/` directories
- [x] T002 [P] Initialize Next.js 14+ frontend with TypeScript, Tailwind CSS, App Router
- [x] T003 [P] Initialize Express.js backend with TypeScript, ts-node-dev, folder structure
- [x] T004 [P] Install and configure shadcn/ui with custom brand theme (primary #2563EB, accent #F97316)
- [x] T005 Configure Prisma with PostgreSQL schema from plan.md data model
- [x] T006 [P] Set up Redis client connection module in `backend/src/utils/cache.ts`
- [x] T007 [P] Set up Cloudinary configuration for image uploads in `backend/src/utils/cloudinary.ts`
- [x] T008 [P] Create shared TypeScript types in `frontend/src/types/index.ts` and `backend/src/types/index.ts`
- [x] T009 [P] Configure ESLint, Prettier, and environment variable schemas (.env.example files)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

- [x] T010 Create Prisma migrations for all models (Product, Category, Brand, ProductImage, ProductVariant)
- [x] T011 [P] Implement Express error handling middleware in `backend/src/middleware/error.ts`
- [x] T012 [P] Implement admin JWT auth middleware in `backend/src/middleware/auth.ts`
- [x] T013 [P] Implement Zod validation middleware in `backend/src/middleware/validate.ts`
- [x] T014 [P] Create API client service in `frontend/src/services/api.ts` (Axios instance with interceptors)
- [x] T015 Create seed script with sample categories, brands, and products for development
- [x] T016 [P] Set up Redis caching utility for GET endpoints in `backend/src/utils/cache.ts`

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 — Browse & Filter Products (Priority: P1) 🎯 MVP

**Goal**: Customers can browse a shop page with product grid, filter by category/brand/price/rating, and search by name.

**Independent Test**: Load `/shop` with seeded products, apply filters, verify grid updates.

### Implementation for User Story 1

#### Backend — Category API
- [x] T017 [P] [US1] Create category validators in `backend/src/validators/category.validator.ts`
- [x] T018 [P] [US1] Create category service with CRUD + cache in `backend/src/services/category.service.ts`
- [x] T019 [US1] Create category controller in `backend/src/controllers/category.controller.ts`
- [x] T020 [US1] Create category routes in `backend/src/routes/categories.ts` (GET /api/categories)
- [x] T021 [US1] Register category routes in Express app

#### Backend — Brand API
- [x] T022 [P] [US1] Create brand validators in `backend/src/validators/brand.validator.ts`
- [x] T023 [P] [US1] Create brand service with CRUD + cache in `backend/src/services/brand.service.ts`
- [x] T024 [US1] Create brand controller in `backend/src/controllers/brand.controller.ts`
- [x] T025 [US1] Create brand routes in `backend/src/routes/brands.ts` (GET /api/brands)
- [x] T026 [US1] Register brand routes in Express app

#### Backend — Product API
- [x] T027 [P] [US1] Create product validators in `backend/src/validators/product.validator.ts`
- [x] T028 [P] [US1] Create slugify utility in `backend/src/utils/slugify.ts`
- [x] T029 [US1] Create product service with filtered listing + search + cache in `backend/src/services/product.service.ts`
- [x] T030 [US1] Create product controller in `backend/src/controllers/product.controller.ts`
- [x] T031 [US1] Create product routes in `backend/src/routes/products.ts` (GET /api/products, GET /api/products/search)
- [x] T032 [US1] Register product routes in Express app

#### Frontend — Shared Components
- [x] T033 [P] [US1] Create ProductCard component in `frontend/src/components/products/product-card.tsx` (image, price, badge, wishlist btn, rating)
- [x] T034 [P] [US1] Create ProductGrid component in `frontend/src/components/products/product-grid.tsx` (responsive grid, loading skeleton)
- [x] T035 [P] [US1] Create product hooks in `frontend/src/hooks/use-products.ts` (useProducts, useProduct)
- [x] T036 [P] [US1] Create category hook in `frontend/src/hooks/use-categories.ts`
- [x] T037 [P] [US1] Create brand hook in `frontend/src/hooks/use-brands.ts`
- [x] T038 [P] [US1] Create product service in `frontend/src/services/products.ts`
- [x] T039 [P] [US1] Create category service in `frontend/src/services/categories.ts`
- [x] T040 [P] [US1] Create brand service in `frontend/src/services/brands.ts`

#### Frontend — Shop Page
- [x] T041 [US1] Create FilterSidebar component in `frontend/src/components/shop/filter-sidebar.tsx` (categories, brands, price range, rating, in-stock toggle)
- [x] T042 [US1] Create SortSelect component in `frontend/src/components/shop/sort-select.tsx`
- [x] T043 [US1] Create SearchBar component in `frontend/src/components/shop/search-bar.tsx` (debounced autocomplete)
- [x] T044 [US1] Create shop page at `frontend/src/app/(shop)/shop/page.tsx` (grid + filters + search + pagination)
- [x] T045 [US1] Create shop loading skeleton at `frontend/src/app/(shop)/shop/loading.tsx`
- [x] T046 [US1] Add empty state for no results in shop page
- [x] T047 [US1] Add SEO meta tags for shop page (title, description, canonical)

**Checkpoint**: Shop page functional with filters, search, and pagination. User Story 1 complete.

---

## Phase 4: User Story 2 — View Product Details (Priority: P1)

**Goal**: Customers can view full product details with image gallery, variant selection, and related products.

**Independent Test**: Navigate to `/product/:slug` and verify all sections render.

### Implementation for User Story 2

#### Backend
- [x] T048 [US2] Add GET /api/products/:slug endpoint in product controller (full detail with images, variants)
- [x] T049 [US2] Add related products endpoint in product service (same category, exclude current)
- [x] T050 [US2] Cache product detail in Redis with 5-min TTL

#### Frontend — Product Detail
- [x] T051 [P] [US2] Create ProductGallery component in `frontend/src/components/products/product-gallery.tsx` (thumbnails, zoom, image slider)
- [x] T052 [P] [US2] Create VariantSelector component in `frontend/src/components/products/variant-selector.tsx` (size/color selection)
- [x] T053 [P] [US2] Create StockBadge component in `frontend/src/components/products/stock-badge.tsx` (in-stock, low-stock, out-of-stock)
- [x] T054 [P] [US2] Create RelatedProducts component in `frontend/src/components/products/related-products.tsx`
- [x] T055 [P] [US2] Create Breadcrumbs shared component
- [x] T056 [US2] Create product detail page at `frontend/src/app/product/[slug]/page.tsx`
- [x] T057 [US2] Add loading skeleton for product detail page
- [x] T058 [US2] Add 404 state for invalid/unpublished product slugs
- [x] T059 [US2] Add SEO meta tags (OG image, Twitter card, Schema.org Product markup) for product detail
- [x] T060 [US2] Add canonical URL and breadcrumb structured data

**Checkpoint**: Product detail page functional with gallery, variants, and SEO. User Story 2 complete.

---

## Phase 5: User Story 3 — Admin Product Management (Priority: P2)

**Goal**: Admins can create, edit, and manage products, categories, and brands.

**Independent Test**: Login as admin, navigate to `/admin/products`, perform CRUD operations.

### Implementation for User Story 3

#### Backend — Admin Product Routes
- [x] T061 [US3] Add POST /api/products admin endpoint (product creation with images)
- [x] T062 [US3] Add PATCH /api/products/:id admin endpoint (product update)
- [x] T063 [US3] Add DELETE /api/products/:id admin endpoint (soft-delete, sets isActive=false)
- [x] T064 [P] [US3] Add POST /api/categories admin endpoint
- [x] T065 [P] [US3] Add PATCH /api/categories/:id admin endpoint
- [x] T066 [P] [US3] Add DELETE /api/categories/:id admin endpoint (reassign products check)
- [x] T067 [P] [US3] Add POST /api/brands admin endpoint
- [x] T068 [P] [US3] Add PATCH /api/brands/:id admin endpoint
- [x] T069 [P] [US3] Add DELETE /api/brands/:id admin endpoint
- [x] T070 [US3] Add Multer upload middleware for product images in `backend/src/middleware/upload.ts`
- [x] T071 [US3] Add Cloudinary upload service in `backend/src/services/upload.service.ts`

#### Frontend — Admin Pages
- [x] T072 [US3] Create admin layout at `frontend/src/app/admin/layout.tsx` (sidebar nav, auth guard)
- [x] T073 [US3] Create admin products data table at `frontend/src/app/admin/products/page.tsx` (search, pagination, status toggle)
- [x] T074 [US3] Create product create/edit form at `frontend/src/app/admin/products/[id]/page.tsx` (react-hook-form, Zod, image upload with preview)
- [x] T075 [P] [US3] Create categories admin page at `frontend/src/app/admin/categories/page.tsx`
- [x] T076 [P] [US3] Create brands admin page at `frontend/src/app/admin/brands/page.tsx`
- [x] T077 [US3] Add toast notifications for create/update/delete success/error
- [x] T078 [US3] Add form validation error display with Zod schema
- [x] T079 [US3] Add loading states and error boundaries for admin pages

**Checkpoint**: Admin can fully manage products, categories, and brands. User Story 3 complete.

---

## Phase 6: User Story 4 — Category & Brand Pages (Priority: P3)

**Goal**: Customers can browse dedicated category and brand landing pages.

**Independent Test**: Navigate to `/category/:slug` or `/brand/:slug` and verify products shown.

### Implementation for User Story 4

#### Backend
- [x] T080 [US4] Add GET /api/categories/:slug endpoint (category detail + products) in category controller
- [x] T081 [US4] Add GET /api/brands/:slug endpoint (brand detail + products) in brand controller

#### Frontend
- [x] T082 [US4] Create category page at `frontend/src/app/(shop)/category/[slug]/page.tsx` (banner, description, product grid)
- [x] T083 [US4] Create brand page at `frontend/src/app/(shop)/brand/[slug]/page.tsx` (logo, description, product grid)
- [x] T084 [US4] Add SEO meta tags for category/brand pages
- [x] T085 [US4] Add loading skeletons for category/brand pages

**Checkpoint**: Category and brand landing pages functional.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Performance optimization, security hardening, and final validation

- [x] T086 [P] Add Redis cache invalidation on product/category/brand updates
- [x] T087 [P] Add rate limiting to product listing and search endpoints
- [x] T088 [P] Add input sanitization and XSS protection for product descriptions
- [x] T089 [P] Add image lazy loading and Next.js Image optimization for product cards
- [x] T090 [P] Add Framer Motion animations for product card hover and page transitions
- [x] T091 [P] Add dark mode support for shop and product pages
- [x] T092 [P] Add ARIA labels and keyboard navigation for product cards
- [x] T093 [P] Add skeleton loaders for all data-dependent components
- [x] T094 [P] Add 404 page for invalid product/category/brand slugs
- [ ] T095 [P] End-to-end test: Browse shop → filter → view product → verify all states
- [ ] T096 [P] Run Lighthouse audit and optimize for 90+ scores
- [ ] T097 Create PHR for this feature implementation

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundation — no intra-story dependencies
- **US2 (Phase 4)**: Depends on Foundation + US1 product listing endpoints
- **US3 (Phase 5)**: Depends on Foundation — admin auth middleware, product service
- **US4 (Phase 6)**: Depends on Foundation + US1 shop components
- **Polish (Phase 7)**: Depends on all user stories

### Parallel Opportunities
- All [P] tasks within a phase can run concurrently
- Phase 1 tasks T002-T009 are all parallel
- Phase 2 tasks T011-T014 and T016 are parallel
- Within each user story, backend and frontend tasks are independent
- US3 backend (T061-T063) and frontend (T072-T079) can be done in parallel

### Implementation Order (Recommended)
Complete Setup → Foundation → US1 (MVP shop) → US2 (product detail) → US3 (admin) → US4 (category/brand pages) → Polish
