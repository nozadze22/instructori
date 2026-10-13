import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { S3StorageService } from '../../storage/s3-storage.service';
import type { UploadedImageFile } from '../../storage/uploaded-image.type';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService,
  ) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
    if (dto.fullName?.trim()) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { fullName: dto.fullName.trim() },
      });
    }

    return this.prisma.profile.create({
      data: {
        userId,
        bio: dto.bio,
        phone: dto.phone,
        avatarUrl: dto.avatarUrl,
        city: dto.city,
        country: dto.country,
      },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.getProfile(userId);

    if (dto.fullName?.trim()) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { fullName: dto.fullName.trim() },
      });
    }

    return this.prisma.profile.update({
      where: { userId },
      data: {
        bio: dto.bio,
        phone: dto.phone,
        avatarUrl: dto.avatarUrl,
        city: dto.city,
        country: dto.country,
      },
    });
  }

  async uploadAvatar(userId: string, file: UploadedImageFile) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    if (file.size > MAX_AVATAR_BYTES) {
      throw new BadRequestException('Image file is too large');
    }

    const avatarUrl = await this.storage.uploadAvatar(userId, file);

    const existing = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!existing) {
      return this.prisma.profile.create({
        data: { userId, avatarUrl },
      });
    }

    return this.prisma.profile.update({
      where: { userId },
      data: { avatarUrl },
    });
  }

  async removeAvatar(userId: string) {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { userId },
      data: { avatarUrl: null },
    });
  }
}
