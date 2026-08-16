import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    url: process.env.DATABASE_URL || "file:./saifi.db",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret-min-32-characters-long!!",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-min-32-characters-long!!",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || "",
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    mode: process.env.PAYPAL_MODE || "sandbox",
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || "",
    from: process.env.EMAIL_FROM || "Saifi Brands <noreply@saifibrands.com>",
  },
  taxRate: parseFloat(process.env.TAX_RATE || "0"),
  freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD || "50000"),
  flatShippingCost: parseFloat(process.env.FLAT_SHIPPING_COST || "1500"),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  corsOptions: {
    origin: (process.env.FRONTEND_URL || "http://localhost:3000").split(",").map((o) => o.trim()),
    credentials: true,
  },
};