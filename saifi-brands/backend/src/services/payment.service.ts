import Stripe from "stripe";
import prisma from "../utils/prisma";
import { NotFoundError, AppError } from "../utils/errors";
import { config } from "../config";

const isConfigured = (key: string) => key.length > 0 && !key.startsWith("your-") && !key.includes("placeholder");

function getStripe(): Stripe | null {
  if (!isConfigured(config.stripe.secretKey)) return null;
  return new Stripe(config.stripe.secretKey);
}

export class PaymentService {
  async createPaymentIntent(order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
  }) {
    const stripe = getStripe();

    if (!stripe) {
      return {
        mode: "mock" as const,
        clientSecret: `mock_secret_${order.id}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        currency: "pkr",
      };
    }

    const amount = Math.round(order.totalAmount * 100);
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "pkr",
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      automatic_payment_methods: { enabled: true },
    });

    return {
      mode: "stripe" as const,
      clientSecret: intent.client_secret,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      currency: "pkr",
    };
  }

  async createPayPalOrder(order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
  }) {
    if (!isConfigured(config.paypal.clientId) || !isConfigured(config.paypal.clientSecret)) {
      return {
        mode: "mock" as const,
        approvalUrl: null,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
      };
    }

    const base = config.paypal.mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
    const auth = Buffer.from(`${config.paypal.clientId}:${config.paypal.clientSecret}`).toString("base64");
    const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const tokenData = (await tokenRes.json()) as { access_token: string };
    if (!tokenData.access_token) throw new AppError("PayPal authentication failed", 502);

    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order.id,
            invoice_id: order.orderNumber,
            amount: {
              currency_code: "PKR",
              value: order.totalAmount.toFixed(2),
            },
          },
        ],
      }),
    });
    const data = (await res.json()) as { id: string; links?: { rel: string; href: string }[] };
    const approvalLink = data.links?.find((l) => l.rel === "approve")?.href ?? null;

    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: { provider: "paypal", reference: data.id },
    });

    return {
      mode: "paypal" as const,
      approvalUrl: approvalLink,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
    };
  }

  async verifyPayment(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundError("Order");

    if (order.paymentStatus === "PAID") {
      return this.serializeOrder(order);
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", status: "CONFIRMED" },
    });

    await prisma.payment.updateMany({
      where: { orderId, status: "PENDING" },
      data: { status: "SUCCEEDED" },
    });

    return this.serializeOrder(updated);
  }

  async handleWebhook(payload: string | Buffer, signature: string | undefined) {
    const stripe = getStripe();
    if (!stripe || !isConfigured(config.stripe.webhookSecret)) {
      throw new AppError("Stripe webhooks are not configured", 503);
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature || "",
        config.stripe.webhookSecret
      );
    } catch {
      throw new AppError("Invalid webhook signature", 400);
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = intent.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID", status: "CONFIRMED" },
        });
        await prisma.payment.updateMany({
          where: { orderId, method: "stripe" },
          data: { status: "SUCCEEDED", reference: intent.id },
        });
      }
    }

    return { received: true };
  }

  private serializeOrder(order: any) {
    return {
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shippingCost: Number(order.shippingCost),
      totalAmount: Number(order.totalAmount),
    };
  }
}

export const paymentService = new PaymentService();