import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUser: any) {
    if (currentUser.role.name !== 'ADMIN') {
      throw new ForbiddenException('Only admins can list all users');
    }

    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => {
      const { passwordHash, ...sanitized } = u;
      return sanitized;
    });
  }

  async findOne(id: string, currentUser: any) {
    // Users can view their own profile, admins can view any
    if (currentUser.id !== id && currentUser.role.name !== 'ADMIN') {
      throw new ForbiddenException('You can only view your own profile');
    }

    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async update(id: string, dto: UpdateUserDto, currentUser: any) {
    if (currentUser.id !== id && currentUser.role.name !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Check email uniqueness if changing
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, id: { not: id }, deletedAt: null },
      });
      if (existing) {
        throw new BadRequestException('Email already in use');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      include: { role: true },
    });

    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async changePassword(id: string, dto: ChangePasswordDto, currentUser: any) {
    if (currentUser.id !== id && currentUser.role.name !== 'ADMIN') {
      throw new ForbiddenException('You can only change your own password');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all refresh tokens for this user (force re-login)
    await this.prisma.refreshToken.updateMany({
      where: { userId: id },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password changed successfully' };
  }

  async getProfile(currentUser: any) {
    return this.findOne(currentUser.id, currentUser);
  }
}
