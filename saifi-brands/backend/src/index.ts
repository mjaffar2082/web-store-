import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { errorHandler } from "./middleware/error";
import productRoutes from "./routes/products";
import categoryRoutes from "./routes/categories";
import brandRoutes from "./routes/brands";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/orders";
import paymentRoutes from "./routes/payments";
import wishlistRoutes from "./routes/wishlist";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors(config.corsOptions));
app.use(compression());
app.use(morgan("dev"));
app.use(cookieParser());

app.use((req, _res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.startsWith("application/json")) {
    (req as any).rawBody = "";
    req.on("data", (chunk: Buffer) => {
      (req as any).rawBody += chunk;
    });
  }
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.get("/", (_req, res) => {
  res.json({ name: "Saifi Brands API", status: "ok", docs: "/api/health" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export default app;