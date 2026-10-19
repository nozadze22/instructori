import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { S3StorageService } from '../../storage/s3-storage.service';
import type { UploadedImageFile } from '../../storage/uploaded-image.type';
import {
  CreateProfileDto,
  JoinInstructorDto,
  UpdateProfileDto,
} from './dto/profile.dto';

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
      },
    });
  }

  async getInstructorGroup(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        linkedInstructor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            instructorCode: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { instructor: user.linkedInstructor };
  }

  async joinInstructorGroup(userId: string, dto: JoinInstructorDto) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, linkedInstructorId: true },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }
    if (currentUser.role !== 'USER') {
      throw new BadRequestException(
        'Only student accounts can join an instructor group',
      );
    }
    if (currentUser.linkedInstructorId) {
      throw new ConflictException('You are already linked to an instructor');
    }

    const instructor = await this.prisma.user.findFirst({
      where: {
        instructorCode: dto.instructorCode.trim().toUpperCase(),
        role: 'INSTRUCTOR',
        accessStatus: 'ACTIVE',
      },
      select: { id: true },
    });

    if (!instructor) {
      throw new BadRequestException('Invalid instructor code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { linkedInstructorId: instructor.id },
    });

    return this.getInstructorGroup(userId);
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
