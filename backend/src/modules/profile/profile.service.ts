import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';

type ProfileRecord = {
  id: string;
  userId: string;
  bio: string | null;
  phone: string | null;
  avatarUrl: string | null;
  city: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ProfileDelegate = {
  create: (args: {
    data: {
      userId: string;
      bio?: string;
      phone?: string;
      avatarUrl?: string;
      city?: string;
      country?: string;
    };
  }) => Promise<ProfileRecord>;
  findUnique: (args: {
    where: { userId: string };
  }) => Promise<ProfileRecord | null>;
  update: (args: {
    where: { userId: string };
    data: {
      bio?: string;
      phone?: string;
      avatarUrl?: string;
      city?: string;
      country?: string;
    };
  }) => Promise<ProfileRecord>;
};

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private get profile(): ProfileDelegate {
    return (this.prisma as unknown as { profile: ProfileDelegate }).profile;
  }

  createProfile(userId: string, dto: CreateProfileDto): Promise<ProfileRecord> {
    return this.profile.create({
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

  async getProfile(userId: string): Promise<ProfileRecord> {
    const profile = await this.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileRecord> {
    await this.getProfile(userId);

    return this.profile.update({
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
