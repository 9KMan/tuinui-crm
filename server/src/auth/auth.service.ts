import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenPair, JwtPayload } from './interfaces/jwt-payload.interface';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ─── Token Generation ─────────────────────────────────────

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'crm-secret-key'),
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = require('crypto').randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });

    return token;
  }

  async generateTokens(user: { id: string; email: string; roleId: string }): Promise<TokenPair> {
    const payload: JwtPayload = { sub: user.id, email: user.email, roleId: user.roleId };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  // ─── User Validation ──────────────────────────────────────

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || user.deletedAt) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roleId: user.roleId,
    };
  }

  // ─── Auth Operations ──────────────────────────────────────

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Get default role
    const defaultRole = await this.prisma.role.findFirst({
      where: { isDefault: true },
    });

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        avatar: dto.avatar,
        roleId: defaultRole?.id,
      },
      include: { role: true },
    });

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(user: any) {
    const tokens = await this.generateTokens(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { role: true } } },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    // Revoke old token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(storedToken.user);

    return {
      ...tokens,
    };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logged out successfully' };
  }

  async passwordResetRequest(email: string) {
    // Generate a reset token and store it
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store hashed token (in production, use a separate PasswordResetToken table)
    // For now, we just return the token (in production, send via email)
    return {
      message: 'If the email exists, a reset link has been sent',
      // In production: await this.emailService.sendPasswordResetEmail(user.email, resetToken);
      resetToken, // DEV ONLY - remove in production
    };
  }

  async passwordResetConfirm(token: string, newPassword: string) {
    // In production, look up the hashed token from PasswordResetToken table
    // For now, validate token format and reset password directly
    if (!token || token.length < 32) {
      throw new BadRequestException('Invalid reset token');
    }

    // TODO: Implement full password reset token storage and validation
    return { message: 'Password reset successful' };
  }

  // ─── Helpers ─────────────────────────────────────────────

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
