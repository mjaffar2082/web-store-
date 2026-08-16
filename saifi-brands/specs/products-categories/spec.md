# Feature Specification: Products & Categories

**Feature Branch**: `001-products-categories`
**Created**: 2026-07-15
**Status**: Draft
**Input**: User description: Products & Categories (chosen from master prompt scope)

## User Scenarios & Testing

### User Story 1 - Browse & Filter Products (Priority: P1)

As a customer, I want to browse products by category and brand, filter by price/rating, and search by name so I can find what I'm looking for.

**Why this priority**: Core shopping experience — without product discovery, the store has no value.

**Independent Test**: Can be fully tested by loading the shop page with seeded products, applying filters, and verifying the list updates.

**Acceptance Scenarios**:

1. **Given** products exist across multiple categories, **When** I visit `/shop`, **Then** I see a product grid with pagination and facet filters
2. **Given** I select a category filter, **When** the page updates, **Then** only products in that category are shown
3. **Given** I use the search bar, **When** I type a product name, **Then** matching results appear with debounced search
4. **Given** I set a price range filter, **When** the filter applies, **Then** only products within that price range are displayed
5. **Given** no products match my filters, **When** the filter applies, **Then** I see an empty state with "No products found" message

---

### User Story 2 - View Product Details (Priority: P1)

As a customer, I want to view a product's full details including images, price, description, specs, and stock status so I can make a purchase decision.

**Why this priority**: The product detail page is the conversion point — customers need full info to buy.

**Independent Test**: Can be tested by navigating to any product URL and verifying all sections render correctly.

**Acceptance Scenarios**:

1. **Given** a product with multiple images, **When** I visit `/product/:slug`, **Then** I see a gallery with thumbnails and zoom functionality
2. **Given** a product has variants (size/color), **When** I select a variant, **Then** the price, stock, and image update accordingly
3. **Given** a product is out of stock, **When** I view the page, **Then** I see an "Out of Stock" badge and the add-to-cart button is disabled
4. **Given** a product with a discount, **When** I view the page, **Then** I see the original price crossed out and the discount percentage badge

---

### User Story 3 - Admin Product Management (Priority: P2)

As an admin, I want to create, edit, and manage products, categories, and brands so the store inventory stays up to date.

**Why this priority**: Admins need to populate the store before customers can shop — but seeded data can work temporarily.

**Independent Test**: Can be tested by logging in as admin, navigating to admin/products, and performing CRUD operations.

**Acceptance Scenarios**:

1. **Given** I am logged in as admin, **When** I navigate to `/admin/products`, **Then** I see a data table with all products, search, and pagination
2. **Given** I click "Add Product", **When** I fill the form and submit, **Then** the product is created and I see a success toast
3. **Given** I edit a product, **When** I change the price and save, **Then** the updated price appears on the shop page immediately
4. **Given** I delete a product, **When** I confirm deletion, **Then** the product is removed from the store with a soft-delete
5. **Given** I manage categories, **When** I create/edit/delete a category, **Then** changes reflect in the shop filter sidebar

---

### User Story 4 - Category & Brand Pages (Priority: P3)

As a customer, I want to browse dedicated category and brand pages so I can explore curated collections.

**Why this priority**: Enhances navigation but not critical for MVP — shop filters cover this need initially.

**Independent Test**: Navigate to `/category/:slug` or `/brand/:slug` and verify only relevant products are shown.

**Acceptance Scenarios**:

1. **Given** a category has a banner image and description, **When** I visit `/category/:slug`, **Then** I see the banner, description, and product grid
2. **Given** a brand page, **When** I visit `/brand/:slug`, **Then** I see the brand logo, description, and all their products

---

### Edge Cases

- What happens when a product slug conflicts? (slug must be unique, auto-generated from name with suffix)
- How does the system handle products with no images? (use placeholder image)
- What happens when a category is deleted with products in it? (prevent deletion or reassign to "Uncategorized")
- How are out-of-stock products displayed in search/filter results? (shown but marked, or hidden based on toggle)
- What happens when image upload fails? (return clear error, don't create product without at least one image)

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow admins to create, read, update, and delete products
- **FR-002**: System MUST allow admins to create, read, update, and delete categories
- **FR-003**: System MUST allow admins to create, read, update, and delete brands
- **FR-004**: Products MUST have a unique slug auto-generated from the name
- **FR-005**: Products MUST support multiple images with Cloudinary upload
- **FR-006**: Products MUST support variants (size, color) with per-variant price and stock
- **FR-007**: Products MUST support discount pricing with start/end dates
- **FR-008**: Shop page MUST support filtering by category, brand, price range, rating, and availability
- **FR-009**: Shop page MUST support sorting by newest, price (low-high), price (high-low), and popularity
- **FR-010**: Product detail page MUST show gallery, description, specs, stock, and related products
- **FR-011**: System MUST cache product listings in Redis for performance
- **FR-012**: System MUST return 404 for deleted/unpublished products
- **FR-013**: Category and brand deletions MUST prompt reassignment of associated products
- **FR-014**: Search MUST support debounced autocomplete with min 2 characters
- **FR-015**: Product images MUST be optimized via Cloudinary transformations

### Key Entities

- **Product**: Core entity — name, slug, description, specs, price, discount, stock, images, variants, status
- **Category**: Grouping entity — name, slug, description, image, parent (for subcategories), sort order
- **Brand**: Manufacturer/brand entity — name, slug, logo, description, website
- **ProductVariant**: Size/color combination — name, sku, price override, stock, images
- **ProductImage**: Gallery images — url, alt, order, productId

## Success Criteria

### Measurable Outcomes

- **SC-001**: Shop page loads with 50+ products in under 2s (with Redis cache)
- **SC-002**: Product detail page loads in under 1.5s with all images optimized
- **SC-003**: Filter/sort operations update results in under 500ms
- **SC-004**: Admin product creation completes in under 3 clicks after form fill
- **SC-005**: All product pages return proper SEO meta tags (OG, Twitter, canonical)
- **SC-006**: Search autocomplete returns results within 300ms of debounce
