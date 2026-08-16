# ADR-001: Saifi Brands Architecture Foundation

> **Scope**: Document the foundational architecture cluster — monorepo structure, frontend/backend split, data layer, caching, and media storage.

- **Status:** Accepted
- **Date:** 2026-07-15
- **Feature:** products-categories
- **Context:** Building a production-grade eCommerce platform requires clear separation of concerns, type safety, performance optimization, and scalable media handling. The selected stack must support multi-role dashboards (admin, seller, customer) and future marketplace expansion.

## Decision

### Monorepo with Separate Frontend & Backend
- **Frontend**: Next.js 14+ (App Router) with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with TypeScript, modular route/controller/service pattern
- **Rationale**: Independent deployment, clear separation of concerns, ability to scale API independently, shared types via npm workspace or manual sync.

### Database & ORM
- **Database**: PostgreSQL
- **ORM**: Prisma (schema-first, type-safe queries, auto-generated migrations)
- **Rationale**: Prisma provides excellent TypeScript integration, migration management, and a declarative schema that serves as source of truth.

### Caching Layer
- **Cache**: Redis
- **Rationale**: Product data is read-heavy and stale-tolerant (minutes). Redis provides sub-millisecond reads, TTL-based invalidation, and is well-suited for session storage and rate limiting later.

### Media Storage
- **Provider**: Cloudinary
- **Rationale**: Built-in image optimization (format conversion, quality, resizing), CDN delivery, transformation URLs without server-side processing. Reduces backend load significantly.

### Authentication Foundation
- **Mechanism**: JWT access tokens (short-lived) + refresh tokens (rotated)
- **Storage**: HTTP-only secure cookies for refresh tokens, memory for access tokens
- **Rationale**: Stateless auth scales horizontally, cookies prevent XSS token theft, rotation limits replay window.

## Consequences

### Positive
- TypeScript across the entire stack ensures type consistency
- Prisma migrations provide reproducible database evolution
- Cloudinary eliminates need for image processing pipeline on backend
- Redis caching dramatically reduces database load for product queries
- Separate frontend/backend allows independent scaling and deployment
- JWT + refresh token pattern is industry standard and well-documented

### Negative
- Two deployments instead of one (higher CI/CD complexity)
- CORS configuration needed between frontend and backend in development
- Redis adds operational dependency (though managed services mitigate this)
- Cloudinary vendor lock-in for media transformations
- Prisma adds abstraction layer — raw SQL may be needed for complex queries
- Refresh token rotation requires additional state tracking

## Alternatives Considered

### Alternative A: Monolithic Next.js (API routes + frontend)
- Simpler deployment (single Vercel project)
- No CORS issues
- **Rejected**: API routes on serverless have cold start penalties for eCommerce; harder to separate admin API concerns; less flexible for future mobile app API

### Alternative B: MySQL + TypeORM
- More mature ORM, broader hosting options
- **Rejected**: Prisma's type safety and migration DX significantly better for TypeScript projects; PostgreSQL JSONB support useful for flexible product specifications

### Alternative C: S3 + Sharp (self-hosted image pipeline)
- No vendor lock-in, full control over transformations
- **Rejected**: Requires image processing server, CDN setup, cache invalidation logic. Cloudinary provides all of this out-of-the-box with superior DX

### Alternative D: Session-based auth (express-session + Redis)
- Traditional, battle-tested approach
- **Rejected**: Stateful auth doesn't scale horizontally without shared session store; JWT enables stateless verification across services

## References

- Feature Spec: `specs/products-categories/spec.md`
- Implementation Plan: `specs/products-categories/plan.md`
- Related ADRs: None
- Evaluator Evidence: `history/prompts/constitution/1-saifi-brands-ecommerce-master-prompt.constitution.prompt.md`
