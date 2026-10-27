import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import type { AuthUser } from '../auth/dto/auth-types';
import {
  CreateInstructorVehicleDto,
  UpdateInstructorVehicleDto,
} from './dto/instructor-vehicle.dto';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const MAX_VEHICLE_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VEHICLES_PER_INSTRUCTOR = 6;

const instructorVehicleSelect = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  tag: true,
  images: {
    select: {
      id: true,
      imageUrl: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: 'asc' },
  },
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService,
  ) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
    if (dto.fullName?.trim() || dto.instructorCategories) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.fullName?.trim() ? { fullName: dto.fullName.trim() } : {}),
          ...(dto.instructorCategories
            ? { instructorCategories: dto.instructorCategories }
            : {}),
        },
      });
    }

    return this.prisma.profile.create({
      data: {
        userId,
        bio: dto.bio,
        phone: dto.phone,
        avatarUrl: dto.avatarUrl,
        city: dto.city,
        workingHours: dto.workingHours,
      },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { instructorCategories: true },
        },
      },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const { user, ...profileData } = profile;
    return {
      ...profileData,
      instructorCategories: user.instructorCategories,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.getProfile(userId);

    if (dto.fullName?.trim() || dto.instructorCategories) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.fullName?.trim() ? { fullName: dto.fullName.trim() } : {}),
          ...(dto.instructorCategories
            ? { instructorCategories: dto.instructorCategories }
            : {}),
        },
      });
    }

    return this.prisma.profile.update({
      where: { userId },
      data: {
        bio: dto.bio,
        phone: dto.phone,
        avatarUrl: dto.avatarUrl,
        city: dto.city,
        workingHours: dto.workingHours,
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

  async listMyVehicles(user: AuthUser) {
    this.assertInstructorAccount(user);

    return this.prisma.instructorVehicle.findMany({
      where: { instructorId: user.userId },
      select: instructorVehicleSelect,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createVehicle(
    user: AuthUser,
    dto: CreateInstructorVehicleDto,
    files: UploadedImageFile[],
  ) {
    this.assertInstructorAccount(user);
    this.assertVehicleImages(files);

    const count = await this.prisma.instructorVehicle.count({
      where: { instructorId: user.userId },
    });
    if (count >= MAX_VEHICLES_PER_INSTRUCTOR) {
      throw new BadRequestException(
        `You can add up to ${MAX_VEHICLES_PER_INSTRUCTOR} vehicles`,
      );
    }

    const uploadedImages = await Promise.all(
      files.map((file) =>
        this.storage.uploadInstructorVehicleImage(user.userId, file),
      ),
    );

    return this.prisma.instructorVehicle.create({
      data: {
        instructorId: user.userId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        imageUrl: uploadedImages[0],
        images: {
          create: uploadedImages.map((imageUrl, sortOrder) => ({
            imageUrl,
            sortOrder,
          })),
        },
        tag: dto.tag?.trim() || null,
        sortOrder: count,
      },
      select: instructorVehicleSelect,
    });
  }

  async updateVehicle(
    user: AuthUser,
    vehicleId: string,
    dto: UpdateInstructorVehicleDto,
  ) {
    this.assertInstructorAccount(user);
    await this.getOwnedVehicle(user.userId, vehicleId);

    return this.prisma.instructorVehicle.update({
      where: { id: vehicleId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() || null }
          : {}),
        ...(dto.tag !== undefined ? { tag: dto.tag.trim() || null } : {}),
      },
      select: instructorVehicleSelect,
    });
  }

  async replaceVehiclePhoto(
    user: AuthUser,
    vehicleId: string,
    file: UploadedImageFile,
  ) {
    this.assertInstructorAccount(user);
    this.assertVehicleImages([file]);
    await this.getOwnedVehicle(user.userId, vehicleId);

    const imageUrl = await this.storage.uploadInstructorVehicleImage(
      user.userId,
      file,
    );

    return this.prisma.instructorVehicle.update({
      where: { id: vehicleId },
      data: { imageUrl },
      select: instructorVehicleSelect,
    });
  }

  async deleteVehicle(user: AuthUser, vehicleId: string) {
    this.assertInstructorAccount(user);
    await this.getOwnedVehicle(user.userId, vehicleId);

    await this.prisma.instructorVehicle.delete({
      where: { id: vehicleId },
    });

    return { ok: true as const };
  }

  private assertInstructorAccount(user: AuthUser) {
    if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only instructors can manage vehicles');
    }
  }

  private assertVehicleImages(files: UploadedImageFile[] | undefined) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image file is required');
    }
    if (files.length > 8) {
      throw new BadRequestException('You can upload up to 8 images');
    }
    if (files.some((file) => file.size > MAX_VEHICLE_IMAGE_BYTES)) {
      throw new BadRequestException('Image file is too large');
    }
  }

  private async getOwnedVehicle(instructorId: string, vehicleId: string) {
    const vehicle = await this.prisma.instructorVehicle.findFirst({
      where: { id: vehicleId, instructorId },
      select: { id: true },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }
}
