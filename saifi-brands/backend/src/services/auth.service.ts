import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../utils/prisma";
import { AppError, UnauthorizedError } from "../utils/errors";
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validators/auth.validator";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateResetToken,
} from "../utils/tokens";
import { sendEmail, passwordResetEmail } from "./email.service";
import { config } from "../config";

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}

function publicUser(user: {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}

async function issueTokens(user: {
  id: string;
  role: string;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenId = crypto.randomUUID();
  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, tokenId });
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });
  return { accessToken, refreshToken };
}

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const password = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phone: data.phone || null,
        role: "CUSTOMER",
      },
    });

    const tokens = await issueTokens(user);
    return { ...tokens, user: publicUser(user) };
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = await issueTokens(user);
    return { ...tokens, user: publicUser(user) };
  }

  async refresh(refreshToken: string | undefined): Promise<AuthResult> {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token required");
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const tokens = await issueTokens(user);
    return { ...tokens, user: publicUser(user) };
  }

  async logout(userId: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  }

  async forgotPassword(data: ForgotPasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user) return;

    const token = generateResetToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: hashedToken, passwordResetExpiry: expiry },
    });

    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
    const { subject, html } = passwordResetEmail(resetUrl);
    await sendEmail({ to: user.email, subject, html });
  }

  async resetPassword(data: ResetPasswordInput): Promise<void> {
    const hashedToken = crypto.createHash("sha256").update(data.token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    const password = await bcrypt.hash(data.password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password,
        passwordResetToken: null,
        passwordResetExpiry: null,
        refreshToken: null,
      },
    });
  }
}

export const authService = new AuthService();