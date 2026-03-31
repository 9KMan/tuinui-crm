import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';
import { LinkedEntityType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export interface SignedUrlResult {
  url: string;
  expiresAt: Date;
}

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    targetType?: LinkedEntityType;
    targetId?: string;
    mimeType?: string;
    take?: number;
    skip?: number;
  }) {
    const { targetType, targetId, mimeType, take = 50, skip = 0 } = params;

    const where: Record<string, unknown> = { deletedAt: null };
    if (targetType) where.linkedType = targetType;
    if (targetId) where.linkedId = targetId;
    if (mimeType) where.mimeType = { contains: mimeType };

    const [data, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        include: {
          uploadedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.file.count({ where }),
    ]);

    return { data, total, take, skip };
  }

  async findOne(id: string) {
    const file = await this.prisma.file.findUnique({
      where: { id, deletedAt: null },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async create(dto: CreateFileDto, userId: string) {
    const file = await this.prisma.file.create({
      data: {
        filename: dto.filename,
        mimeType: dto.mimeType,
        size: dto.size,
        url: dto.url ?? '',
        linkedType: dto.targetType ?? LinkedEntityType.NONE,
        linkedId: dto.targetId ?? null,
        uploadedById: userId,
      },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    return file;
  }

  async remove(id: string, userId: string, deletePhysicalFile = false) {
    const file = await this.prisma.file.findUnique({
      where: { id, deletedAt: null },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Soft delete
    await this.prisma.file.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Optionally delete the physical file
    if (deletePhysicalFile && file.url) {
      const localPath = file.url.startsWith('/') ? file.url : null;
      if (localPath) {
        try {
          const absolutePath = path.resolve(process.cwd(), localPath);
          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
          }
        } catch {
          // Log but don't fail — the metadata delete already succeeded
        }
      }
    }

    return { message: 'File deleted successfully' };
  }

  async generateSignedUrl(id: string, expiresInSeconds = 3600): Promise<SignedUrlResult> {
    const file = await this.prisma.file.findUnique({
      where: { id, deletedAt: null },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // For local files, generate a time-limited signed URL
    // In production, you would use a cloud storage SDK (S3, GCS, etc.)
    // For now, return the URL as-is with an expiry marker
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    const signedUrl = `${file.url}?expires=${expiresAt.toISOString()}`;

    return { url: signedUrl, expiresAt };
  }
}
