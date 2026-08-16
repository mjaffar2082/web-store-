import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: "file:./saifi.db" });
const prisma = new PrismaClient({ adapter });

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

async function main() {
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.address.deleteMany(),
    prisma.user.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.category.deleteMany(),
  ]);

  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const customerPassword = await bcrypt.hash("Customer@123", 12);

  const [admin, customer] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@saifibrands.com",
        password: adminPassword,
        firstName: "Saifi",
        lastName: "Admin",
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        email: "customer@saifibrands.com",
        password: customerPassword,
        firstName: "Jane",
        lastName: "Customer",
        phone: "+92 300 0000000",
        addresses: {
          create: [
            {
              fullName: "Jane Customer",
              line1: "12 Garden Road",
              city: "Lahore",
              state: "Punjab",
              postalCode: "54000",
              country: "Pakistan",
              isDefault: true,
            },
          ],
        },
      },
    }),
  ]);

  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
      slug: "electronics",
      description: "Latest gadgets and electronic devices, verified authentic",
      image: U("photo-1498049794561-7780e7231661"),
      sortOrder: 1,
    },
  });
  const clothing = await prisma.category.create({
    data: {
      name: "Clothing",
      slug: "clothing",
      description: "Premium apparel and fashion for the modern wardrobe",
      image: U("photo-1445205170230-053b83016050"),
      sortOrder: 2,
    },
  });
  const homeLiving = await prisma.category.create({
    data: {
      name: "Home & Living",
      slug: "home-living",
      description: "Home decor and living essentials, curated with care",
      image: U("photo-1554995207-c18c203602cb"),
      sortOrder: 3,
    },
  });

  const subcategories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Smartphones",
        slug: "smartphones",
        parentId: electronics.id,
        image: U("photo-1511707171634-5f897ff02aa9"),
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Laptops",
        slug: "laptops",
        parentId: electronics.id,
        image: U("photo-1496181133206-80ce9b88a853"),
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Audio",
        slug: "audio",
        parentId: electronics.id,
        image: U("photo-1505740420928-5e560c06d30e"),
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Wearables",
        slug: "wearables",
        parentId: electronics.id,
        image: U("photo-1523275335684-37898b6baf30"),
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: "Women",
        slug: "women",
        parentId: clothing.id,
        image: U("photo-1496747611176-843222e1e57c"),
        sortOrder: 1,
      },
    }),
  ]);

  const brands = await Promise.all([
    prisma.brand.create({
      data: { name: "TechPro", slug: "techpro", description: "Premium technology brand" },
    }),
    prisma.brand.create({
      data: { name: "StyleCo", slug: "styleco", description: "Contemporary fashion brand" },
    }),
    prisma.brand.create({
      data: { name: "HomeElegance", slug: "home-elegance", description: "Luxury home goods" },
    }),
    prisma.brand.create({
      data: { name: "NovaTech", slug: "novatech", description: "Innovative electronics" },
    }),
    prisma.brand.create({
      data: { name: "AuraSound", slug: "aurasound", description: "Sound engineering, refined" },
    }),
    prisma.brand.create({
      data: { name: "Loom & Co", slug: "loom-co", description: "Artisanal home textiles" },
    }),
  ]);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "TechPro X1 Smartphone",
        slug: "techpro-x1-smartphone",
        description:
          "Experience cutting-edge technology with the TechPro X1. Featuring a stunning AMOLED display, powerful processor, and all-day battery life.",
        basePrice: 279999,
        discountPrice: 249999,
        stock: 50,
        sku: "TP-X1-001",
        isFeatured: true,
        categoryId: subcategories[0].id,
        brandId: brands[0].id,
        images: {
          create: [
            { url: U("photo-1511707171634-5f897ff02aa9"), alt: "TechPro X1 Smartphone Front View", order: 1 },
            { url: U("photo-1592750475338-74b7b21085ab"), alt: "TechPro X1 Smartphone On Stand", order: 2 },
          ],
        },
        variants: {
          create: [
            { name: "128GB", type: "storage", sku: "TP-X1-128", price: 249999, stock: 25 },
            { name: "256GB", type: "storage", sku: "TP-X1-256", price: 279999, stock: 15 },
            { name: "512GB", type: "storage", sku: "TP-X1-512", price: 309999, stock: 10 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "NovaBook Pro 15",
        slug: "novabook-pro-15",
        description:
          "Professional-grade laptop with exceptional performance. Perfect for creative professionals and power users.",
        basePrice: 349999,
        stock: 30,
        sku: "NB-PRO-001",
        isFeatured: true,
        categoryId: subcategories[1].id,
        brandId: brands[3].id,
        images: {
          create: [
            { url: U("photo-1496181133206-80ce9b88a853"), alt: "NovaBook Pro 15 Laptop", order: 1 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "AuraSound ANC Wireless Headphones",
        slug: "aurasound-anc-headphones",
        description:
          "Immersive active noise cancellation with studio-grade sound. 30-hour battery and plush memory-foam ear cushions.",
        basePrice: 54999,
        discountPrice: 44999,
        stock: 80,
        sku: "AS-HP-001",
        isFeatured: true,
        categoryId: subcategories[2].id,
        brandId: brands[4].id,
        images: {
          create: [
            { url: U("photo-1505740420928-5e560c06d30e"), alt: "AuraSound ANC Headphones", order: 1 },
            { url: U("photo-1484704849700-f032a568e944"), alt: "AuraSound Headphones Detail", order: 2 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "TechPro Pulse Smartwatch",
        slug: "techpro-pulse-smartwatch",
        description:
          "Track your health and stay connected with the TechPro Pulse. AMOLED display, GPS, and 7-day battery life.",
        basePrice: 42999,
        stock: 60,
        sku: "TP-PLS-001",
        categoryId: subcategories[3].id,
        brandId: brands[0].id,
        images: {
          create: [
            { url: U("photo-1523275335684-37898b6baf30"), alt: "TechPro Pulse Smartwatch", order: 1 },
            { url: U("photo-1508685096489-7aacd43bd3b1"), alt: "TechPro Pulse On Wrist", order: 2 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "StyleCo Silk Evening Dress",
        slug: "styleco-silk-evening-dress",
        description:
          "A flowing silk evening dress in a timeless silhouette. Crafted from the finest mulberry silk for an effortless drape.",
        basePrice: 28999,
        stock: 40,
        sku: "SC-DRS-001",
        isFeatured: true,
        categoryId: subcategories[4].id,
        brandId: brands[1].id,
        images: {
          create: [
            { url: U("photo-1496747611176-843222e1e57c"), alt: "StyleCo Silk Evening Dress", order: 1 },
            { url: U("photo-1515886657613-9f3515b0c78f"), alt: "StyleCo Dress Editorial", order: 2 },
          ],
        },
        variants: {
          create: [
            { name: "S", type: "size", sku: "SC-DRS-S", stock: 12 },
            { name: "M", type: "size", sku: "SC-DRS-M", stock: 15 },
            { name: "L", type: "size", sku: "SC-DRS-L", stock: 13 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "HomeElegance Velvet Cushion Set",
        slug: "homeelegance-velvet-cushion-set",
        description:
          "Set of 2 luxurious velvet cushions. Adds a touch of elegance to any living space.",
        basePrice: 8999,
        stock: 200,
        sku: "HE-CSH-001",
        categoryId: homeLiving.id,
        brandId: brands[2].id,
        images: {
          create: [
            { url: U("photo-1616486338812-3dadae4b4ace"), alt: "HomeElegance Velvet Cushion Set", order: 1 },
            { url: U("photo-1584100936595-c0654b55a2e2"), alt: "Velvet Cushion Close-Up", order: 2 },
          ],
        },
        variants: {
          create: [
            { name: "Navy Blue", type: "color", sku: "HE-CSH-NVY", stock: 50 },
            { name: "Burgundy", type: "color", sku: "HE-CSH-BRG", stock: 50 },
            { name: "Forest Green", type: "color", sku: "HE-CSH-GRN", stock: 50 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Loom & Co Linen Throw Blanket",
        slug: "loom-linen-throw-blanket",
        description:
          "Hand-finished European flax linen throw. Breathable, heirloom-quality, and naturally elegant.",
        basePrice: 15999,
        discountPrice: 12999,
        stock: 90,
        sku: "LC-THR-001",
        categoryId: homeLiving.id,
        brandId: brands[5].id,
        images: {
          create: [
            { url: U("photo-1505693416388-ac5ce068fe85"), alt: "Loom & Co Linen Throw", order: 1 },
            { url: U("photo-1540574163026-643ea20ade25"), alt: "Linen Throw Styled", order: 2 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "HomeElegance Ceramic Table Lamp",
        slug: "homeelegance-ceramic-table-lamp",
        description:
          "A sculptural ceramic base with a warm linen shade. Soft, ambient light for calm evenings.",
        basePrice: 14499,
        stock: 45,
        sku: "HE-LMP-001",
        categoryId: homeLiving.id,
        brandId: brands[2].id,
        images: {
          create: [
            { url: U("photo-1507473885765-e6ed057f782c"), alt: "HomeElegance Ceramic Table Lamp", order: 1 },
            { url: U("photo-1513506003901-1e6a229e2d15"), alt: "Table Lamp Evening Glow", order: 2 },
          ],
        },
      },
    }),
  ]);

  await Promise.all([
    prisma.review.create({
      data: { rating: 5, title: "Amazing phone!", comment: "Best smartphone I've ever owned. The camera is incredible.", productId: products[0].id, userId: customer.id },
    }),
    prisma.review.create({
      data: { rating: 4, title: "Great value", comment: "Great phone for the price. Battery life could be better.", productId: products[0].id, userId: admin.id },
    }),
    prisma.review.create({
      data: { rating: 5, title: "Perfect laptop", comment: "Handles all my design work flawlessly. Highly recommend.", productId: products[1].id, userId: customer.id },
    }),
    prisma.review.create({
      data: { rating: 5, title: "Silence, please", comment: "The noise cancellation is unreal. Best travel companion.", productId: products[2].id, userId: customer.id },
    }),
    prisma.review.create({
      data: { rating: 4, title: "Beautiful quality", comment: "The silk is stunning in person. Runs true to size.", productId: products[4].id, userId: customer.id },
    }),
  ]);

  console.log("Seed data created successfully!");
  console.log("Admin:    admin@saifibrands.com / Admin@123");
  console.log("Customer: customer@saifibrands.com / Customer@123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });