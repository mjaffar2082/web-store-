# Implementation Plan: Products & Categories

**Branch**: `001-products-categories` | **Date**: 2026-07-15 | **Spec**: `specs/products-categories/spec.md`
**Input**: Feature specification from `/specs/products-categories/spec.md`

## Summary

Build the core eCommerce product experience: admin CRUD for products/categories/brands, customer-facing shop with filtering/search, product detail pages, and category/brand landing pages. Backend REST API with Express + Prisma + PostgreSQL, frontend with Next.js App Router + Tailwind + shadcn/ui.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20.x  
**Primary Dependencies**: Next.js 14+, Express.js, Prisma ORM, react-hook-form, zod, tanstack-query, axios  
**Storage**: PostgreSQL (Prisma ORM), Redis (caching product queries)  
**Storage (Media)**: Cloudinary (product images)  
**Testing**: Vitest (unit), Playwright (e2e)  
**Target Platform**: Web (Vercel/Node server)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: Shop page <2s load with 50+ products cached, product detail <1.5s, filter/sort <500ms  
**Constraints**: Mobile-first responsive, SEO-optimized, ARIA accessible  
**Scale/Scope**: 10k+ products, multi-category, multi-brand

## Constitution Check

- Full-Stack TypeScript ✓ — TypeScript throughout, shared types
- Clean Architecture ✓ — Separated API routes, services, UI components
- Performance-Optimized ✓ — Redis caching, Next.js ISR, image optimization
- Premium UX ✓ — shadcn/ui, Framer Motion, skeleton loaders, responsive
- Security-First ✓ — Input validation (Zod), auth-protected admin routes, rate limiting

## Project Structure

```
frontend/                          # Next.js App Router
├── src/
│   ├── app/
│   │   ├── (shop)/
│   │   │   ├── shop/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── category/[slug]/
│   │   │   │   └── page.tsx
│   │   │   └── brand/[slug]/
│   │   │       └── page.tsx
│   │   ├── product/[slug]/
│   │   │   └── page.tsx
│   │   └── admin/
│   │       ├── products/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── categories/
│   │       │   └── page.tsx
│   │       └── brands/
│   │           └── page.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── products/
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── product-gallery.tsx
│   │   │   ├── quick-view.tsx
│   │   │   └── product-filter.tsx
│   │   ├── shop/
│   │   │   ├── filter-sidebar.tsx
│   │   │   ├── sort-select.tsx
│   │   │   └── search-bar.tsx
│   │   └── shared/
│   ├── hooks/
│   │   ├── use-products.ts
│   │   ├── use-categories.ts
│   │   └── use-brands.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   └── brands.ts
│   ├── types/
│   │   └── index.ts
│   └── lib/
│       └── utils.ts

backend/                           # Express.js API
├── src/
│   ├── routes/
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   └── brands.ts
│   ├── controllers/
│   │   ├── product.controller.ts
│   │   ├── category.controller.ts
│   │   └── brand.controller.ts
│   ├── services/
│   │   ├── product.service.ts
│   │   ├── category.service.ts
│   │   └── brand.service.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   └── upload.ts
│   ├── validators/
│   │   ├── product.validator.ts
│   │   ├── category.validator.ts
│   │   └── brand.validator.ts
│   ├── utils/
│   │   ├── slugify.ts
│   │   ├── cache.ts
│   │   └── errors.ts
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
└── index.ts
```

## Data Model

### Prisma Schema

```prisma
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  image       String?
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  sortOrder   Int       @default(0)
  isActive    Boolean   @default(true)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Brand {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  logo        String?
  description String?
  website     String?
  isActive    Boolean   @default(true)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id            String          @id @default(cuid())
  name          String
  slug          String          @unique
  description   String?
  specifications Json?          // Key-value pairs stored as JSON
  basePrice     Decimal         @db.Decimal(10, 2)
  discountPrice Decimal?        @db.Decimal(10, 2)
  discountStart DateTime?
  discountEnd   DateTime?
  stock         Int             @default(0)
  sku           String          @unique
  isActive      Boolean         @default(true)
  isFeatured    Boolean         @default(false)
  metaTitle     String?
  metaDesc      String?
  categoryId    String?
  category      Category?       @relation(fields: [categoryId], references: [id])
  brandId       String?
  brand         Brand?          @relation(fields: [brandId], references: [id])
  images        ProductImage[]
  variants      ProductVariant[]
  reviews       Review[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model ProductImage {
  id        String  @id @default(cuid())
  url       String
  alt       String?
  order     Int     @default(0)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model ProductVariant {
  id          String   @id @default(cuid())
  name        String   // e.g., "Large", "Red"
  type        String   // "size" | "color"
  sku         String   @unique
  price       Decimal? @db.Decimal(10, 2) // overrides product basePrice if set
  stock       Int      @default(0)
  isActive    Boolean  @default(true)
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model Review {
  id        String   @id @default(cuid())
  rating    Int      // 1-5
  title     String?
  comment   String?
  isActive  Boolean  @default(true)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId    String
  createdAt DateTime @default(now())
}
```

## API Contracts

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/products | - | List products (paginated, filtered, sorted) |
| GET | /api/products/:slug | - | Get single product by slug |
| POST | /api/products | Admin | Create product |
| PATCH | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Soft-delete product |
| GET | /api/products/search | - | Autocomplete search |

**GET /api/products** query params: `page`, `limit`, `category`, `brand`, `minPrice`, `maxPrice`, `rating`, `inStock`, `sort`, `q` (search).

Response:
```json
{
  "data": [{ "id": "str", "name": "str", "slug": "str", "basePrice": 49.99, "discountPrice": 39.99, "images": [{ "url": "str", "alt": "str" }], "category": { "name": "str", "slug": "str" }, "brand": { "name": "str", "slug": "str" }, "rating": 4.5, "reviewCount": 12, "stock": 50 }],
  "meta": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/categories | - | List active categories |
| GET | /api/categories/:slug | - | Get category with products |
| POST | /api/categories | Admin | Create category |
| PATCH | /api/categories/:id | Admin | Update category |
| DELETE | /api/categories/:id | Admin | Delete category (with reassign) |

### Brands

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/brands | - | List active brands |
| GET | /api/brands/:slug | - | Get brand with products |
| POST | /api/brands | Admin | Create brand |
| PATCH | /api/brands/:id | Admin | Update brand |
| DELETE | /api/brands/:id | Admin | Delete brand |

## Implementation Phases

### Phase 1: Project Scaffolding
- Initialize Next.js frontend with TypeScript + Tailwind + shadcn/ui
- Initialize Express backend with TypeScript
- Set up Prisma schema + seed script
- Configure Cloudinary, Redis connections

### Phase 2: Backend API
- Category CRUD routes + validators + service layer
- Brand CRUD routes + validators + service layer
- Product CRUD routes + validators + service layer
- Search/filter/pagination middleware
- Admin auth middleware (JWT verification)
- Redis caching layer for GET endpoints
- Image upload endpoint (Multer → Cloudinary)

### Phase 3: Frontend — Shop Pages
- Product card component with all states (loading, hover, sale, out-of-stock)
- Product grid with responsive layout
- Filter sidebar (categories, brands, price range, rating, stock toggle)
- Sort dropdown (newest, price, popularity)
- Search bar with autocomplete suggestions
- Empty state, error state, skeleton loading

### Phase 4: Frontend — Product Detail
- Image gallery with thumbnail navigation + zoom
- Product info (price, description, specs, stock badge)
- Variant selector (size/color)
- Related products carousel
- Breadcrumbs, SEO meta tags, Schema.org markup

### Phase 5: Frontend — Admin Pages
- Products data table with search, pagination, filters
- Product create/edit form with react-hook-form + Zod
- Image upload with preview + reorder
- Categories management page
- Brands management page

### Phase 6: Category & Brand Pages
- Category page with banner, product grid
- Brand page with logo, product grid
- SEO meta tags for each

## Complexity Tracking

No violations — structure is standard web application monorepo.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Monorepo with `frontend/` + `backend/` | Clear separation, independent deployment, shared types |
| Prisma over raw SQL | Type-safe queries, migrations, schema-first development |
| Redis for product caching | Product data is read-heavy, stale-ok within minutes |
| Slug-based URLs over ID-based | SEO-friendly, user-readable, no change if ID changes |
| Soft-delete for products | Prevents broken references in orders/reviews |
| Cloudinary for images | Built-in optimization, CDN, transformations without server load |
