import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

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
}
