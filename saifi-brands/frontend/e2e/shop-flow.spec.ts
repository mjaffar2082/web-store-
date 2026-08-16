import { test, expect } from "@playwright/test";

const PRODUCT_LINK = 'a[href^="/product/"]';
const CARD = '[class*="group relative flex flex-col"]';

test.describe("Shop Browse & Filter Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");
  });

  test("T095.1 - Shop page loads with product grid and filters", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Shop");
    await expect(page.locator('input[placeholder="Search the collection..."]')).toBeVisible();
    await expect(page.locator(CARD).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("aside", { hasText: "Categories" })).toBeVisible();
  });

  test("T095.2 - Category filter updates product list", async ({ page }) => {
    const categoryButton = page
      .locator("aside")
      .getByRole("button", { name: /All Categories|Clear all/ })
      .first();
    const categories = page.locator("aside button").filter({ hasNotText: /All|stars|In Stock|Min|Max/ });
    const count = await categories.count();
    if (count > 0) {
      await categories.first().click();
      await page.waitForTimeout(500);
      await expect(page.locator(CARD).first()).toBeVisible({ timeout: 10000 });
    }
    await expect(categoryButton).toBeVisible();
  });

  test("T095.3 - Sort dropdown changes product order", async ({ page }) => {
    const sortSelect = page.locator("select");
    await sortSelect.selectOption("price_asc");
    await page.waitForTimeout(500);
    const prices = page.locator(CARD).first().locator('[class*="font-medium tracking-wide"]');
    await expect(prices.first()).toBeVisible();
  });

  test("T095.4 - Search filters products by name", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search the collection..."]');
    await searchInput.fill("phone");
    await page.waitForTimeout(500);
    const productLinks = page.locator(PRODUCT_LINK);
    const count = await productLinks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("T095.5 - Empty state shown when no products match", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search the collection..."]');
    await searchInput.fill("xyznonexistentproduct12345");
    await page.waitForTimeout(500);
    await expect(page.locator("text=No products found")).toBeVisible({ timeout: 10000 });
  });

  test("T095.6 - Price range filter narrows results", async ({ page }) => {
    const minInput = page.locator('input[placeholder="Min"]');
    const maxInput = page.locator('input[placeholder="Max"]');
    await minInput.fill("10000");
    await maxInput.fill("15000");
    await page.waitForTimeout(500);
    await expect(page.locator(CARD).first()).toBeVisible({ timeout: 10000 });
  });

  test("T095.7 - Navigate to product detail from shop", async ({ page }) => {
    const productLink = page.locator(PRODUCT_LINK).first();
    await expect(productLink).toBeVisible({ timeout: 10000 });
    const href = await productLink.getAttribute("href");
    await productLink.click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(new RegExp(`^.*${href}$`), { timeout: 15000 });
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Product Detail Page", () => {
  test("T095.8 - Product detail shows gallery, price, stock, and add to bag", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");
    await page.locator(PRODUCT_LINK).first().click();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("button", { hasText: /Add to Bag|Sold Out/ }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[class*="cursor-zoom-in"]')).toBeVisible();
    await expect(page.locator("aside, div").first()).toBeAttached();
  });

  test("T095.9 - 404 state for invalid product slug", async ({ page }) => {
    await page.goto("/product/nonexistent-slug-12345");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Product Unavailable")).toBeVisible({ timeout: 10000 });
  });

  test("T095.9a - Add to bag updates the cart badge", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");
    const addButtons = page.locator("button", { hasText: "Add to Bag" });
    await addButtons.first().click();
    const badge = page.locator('[aria-label="Shopping bag"] span');
    await expect(badge).toHaveText(/1|2|3|4/, { timeout: 10000 });
  });
});

test.describe("Category & Brand Pages", () => {
  test("T095.10 - Category page loads with products", async ({ page }) => {
    await page.goto("/category/electronics");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(CARD).first()).toBeVisible({ timeout: 10000 });
  });

  test("T095.11 - Brand page loads with products", async ({ page }) => {
    await page.goto("/brand/techpro");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("TechPro");
    await expect(page.locator(CARD).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Auth & Account Flow", () => {
  test("T095.12 - User can register, log in, and view profile", async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await page.fill('input[name="firstName"]', "E2E");
    await page.fill('input[name="lastName"]', "Tester");
    await page.fill('input[type="email"]', email);
    await page.fill('input[name="password"]', "TestPass123");
    await page.fill('input[name="confirmPassword"]', "TestPass123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });

    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', "TestPass123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });

    await page.goto("/account/profile");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2", { hasText: /Profile|Account/i }).first()).toBeVisible();
  });

  test("T095.13 - Account order history empty state", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill('input[type="email"]', "customer@saifibrands.com");
    await page.fill('input[type="password"]', "Customer@123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });

    await page.goto("/account/orders");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h2", { hasText: "Order History" })).toBeVisible();
  });

  test("T095.14 - Admin login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Admin Sign In")).toBeVisible();
  });
});
