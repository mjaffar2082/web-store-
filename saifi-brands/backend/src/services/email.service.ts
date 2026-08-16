import { config } from "../config";

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (config.email.resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.email.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.email.from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
        }),
      });
      return;
    } catch (err) {
      console.error("Email send failed:", err);
    }
  }

  if (config.nodeEnv !== "production") {
    console.log(`\n[DEV EMAIL] To: ${message.to}`);
    console.log(`Subject: ${message.subject}`);
    console.log(message.html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
    console.log("---\n");
  }
}

export function passwordResetEmail(resetUrl: string): { subject: string; html: string } {
  return {
    subject: "Reset your Saifi Brands password",
    html: `
      <h2>Password Reset</h2>
      <p>You requested to reset your password. Click the link below to choose a new one. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  };
}

export function orderConfirmationEmail(orderNumber: string, total: number): { subject: string; html: string } {
  return {
    subject: `Order ${orderNumber} confirmed`,
    html: `
      <h2>Thank you for your order</h2>
      <p>Your order <strong>${orderNumber}</strong> has been received.</p>
      <p>Total: ${total}</p>
    `,
  };
}