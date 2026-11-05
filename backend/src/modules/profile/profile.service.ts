import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationClientService } from '../notification-client/notification-client.service';
import { findInstructorByCodeForStudentLink } from './instructor-code.util';
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
import {
  CreateInstructorTrainingStepDto,
  UpdateInstructorTrainingStepDto,
} from './dto/instructor-training-step.dto';
import {
  CreateInstructorCertificateDto,
  UpdateInstructorCertificateDto,
} from './dto/instructor-certificate.dto';

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

const instructorTrainingStepSelect = {
  id: true,
  title: true,
  description: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

const instructorCertificateSelect = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService,
    private readonly notificationClient: NotificationClientService,
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

    await this.prisma.profile.create({
      data: {
        userId,
        bio: dto.bio,
        phone: dto.phone,
        city: dto.city,
        workingHours: dto.workingHours,
        hourlyRate: dto.hourlyRate ?? null,
        packageDeal: dto.packageDeal?.trim() || null,
      },
    });

    return this.getProfile(userId);
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            instructorCategories: true,
            instructorCode: true,
          },
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
      instructorCode: user.instructorCode,
    };
  }

  async createInstructorCode(userId: string, rotate = false) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, instructorCode: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Only instructors can create a code');
    }
    if (user.instructorCode && !rotate) {
      return { instructorCode: user.instructorCode };
    }

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const instructorCode = randomBytes(4).toString('hex').toUpperCase();
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: { instructorCode },
        });
        return { instructorCode };
      } catch {
        // A rare unique collision is retried with a new code.
      }
    }

    throw new BadRequestException('Could not create instructor code');
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

    await this.prisma.profile.update({
      where: { userId },
      data: {
        bio: dto.bio,
        phone: dto.phone,
        city: dto.city,
        workingHours: dto.workingHours,
        ...(dto.hourlyRate !== undefined
          ? { hourlyRate: dto.hourlyRate }
          : {}),
        ...(dto.packageDeal !== undefined
          ? { packageDeal: dto.packageDeal?.trim() || null }
          : {}),
      },
    });

    return this.getProfile(userId);
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

  async getStudents(userId: string) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        students: {
          where: { role: 'USER' },
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
            profile: {
              select: {
                phone: true,
                city: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                drivingSessionsAsStudent: {
                  where: { endedAt: { not: null } },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!instructor) {
      throw new NotFoundException('User not found');
    }
    if (instructor.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Only instructors can view students');
    }

    return instructor.students.map((student) => ({
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      createdAt: student.createdAt,
      phone: student.profile?.phone ?? null,
      city: student.profile?.city ?? null,
      avatarUrl: student.profile?.avatarUrl ?? null,
      practiceCount: student._count.drivingSessionsAsStudent,
    }));
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
        'ინსტრუქტორის ჯგუფს მხოლოდ სტუდენტის ანგარიშით შეგიძლია შეუერთდე',
      );
    }
    if (currentUser.linkedInstructorId) {
      throw new ConflictException('You are already linked to an instructor');
    }

    const instructor = await findInstructorByCodeForStudentLink(
      this.prisma,
      dto.instructorCode,
    );

    if (instructor.id === userId) {
      throw new BadRequestException(
        'საკუთარი ინსტრუქტორის კოდით ვერ შეუერთდები',
      );
    }

    const student = await this.prisma.user.update({
      where: { id: userId },
      data: { linkedInstructorId: instructor.id },
      select: { id: true, fullName: true },
    });

    this.notificationClient.publishStudentLinked({
      instructorId: instructor.id,
      studentId: student.id,
      studentFullName: student.fullName,
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

  async listMyTrainingSteps(user: AuthUser) {
    this.assertInstructorAccount(user);

    return this.prisma.instructorTrainingStep.findMany({
      where: { instructorId: user.userId },
      select: instructorTrainingStepSelect,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createTrainingStep(
    user: AuthUser,
    dto: CreateInstructorTrainingStepDto,
  ) {
    this.assertInstructorAccount(user);

    const count = await this.prisma.instructorTrainingStep.count({
      where: { instructorId: user.userId },
    });

    return this.prisma.instructorTrainingStep.create({
      data: {
        instructorId: user.userId,
        title: dto.title.trim(),
        description: dto.description.trim(),
        sortOrder: dto.sortOrder ?? count,
      },
      select: instructorTrainingStepSelect,
    });
  }

  async updateTrainingStep(
    user: AuthUser,
    stepId: string,
    dto: UpdateInstructorTrainingStepDto,
  ) {
    this.assertInstructorAccount(user);
    await this.getOwnedTrainingStep(user.userId, stepId);

    return this.prisma.instructorTrainingStep.update({
      where: { id: stepId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() }
          : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
      select: instructorTrainingStepSelect,
    });
  }

  async deleteTrainingStep(user: AuthUser, stepId: string) {
    this.assertInstructorAccount(user);
    await this.getOwnedTrainingStep(user.userId, stepId);

    await this.prisma.instructorTrainingStep.delete({
      where: { id: stepId },
    });

    return { ok: true as const };
  }

  async listMyCertificates(user: AuthUser) {
    this.assertInstructorAccount(user);
    return this.prisma.instructorCertificate.findMany({
      where: { instructorId: user.userId },
      select: instructorCertificateSelect,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createCertificate(
    user: AuthUser,
    dto: CreateInstructorCertificateDto,
    file: UploadedImageFile,
  ) {
    this.assertInstructorAccount(user);
    this.assertVehicleImages([file]);
    const count = await this.prisma.instructorCertificate.count({
      where: { instructorId: user.userId },
    });
    const imageUrl = await this.storage.uploadInstructorCertificateImage(
      user.userId,
      file,
    );

    return this.prisma.instructorCertificate.create({
      data: {
        instructorId: user.userId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        imageUrl,
        sortOrder: count,
      },
      select: instructorCertificateSelect,
    });
  }

  async updateCertificate(
    user: AuthUser,
    certificateId: string,
    dto: UpdateInstructorCertificateDto,
  ) {
    this.assertInstructorAccount(user);
    await this.getOwnedCertificate(user.userId, certificateId);
    return this.prisma.instructorCertificate.update({
      where: { id: certificateId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() || null }
          : {}),
      },
      select: instructorCertificateSelect,
    });
  }

  async replaceCertificatePhoto(
    user: AuthUser,
    certificateId: string,
    file: UploadedImageFile,
  ) {
    this.assertInstructorAccount(user);
    this.assertVehicleImages([file]);
    await this.getOwnedCertificate(user.userId, certificateId);

    const imageUrl = await this.storage.uploadInstructorCertificateImage(
      user.userId,
      file,
    );

    return this.prisma.instructorCertificate.update({
      where: { id: certificateId },
      data: { imageUrl },
      select: instructorCertificateSelect,
    });
  }

  async deleteCertificate(user: AuthUser, certificateId: string) {
    this.assertInstructorAccount(user);
    await this.getOwnedCertificate(user.userId, certificateId);
    await this.prisma.instructorCertificate.delete({
      where: { id: certificateId },
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

  private async getOwnedTrainingStep(instructorId: string, stepId: string) {
    const step = await this.prisma.instructorTrainingStep.findFirst({
      where: { id: stepId, instructorId },
      select: { id: true },
    });
    if (!step) {
      throw new NotFoundException('Training step not found');
    }
    return step;
  }

  private async getOwnedCertificate(
    instructorId: string,
    certificateId: string,
  ) {
    const certificate = await this.prisma.instructorCertificate.findFirst({
      where: { id: certificateId, instructorId },
      select: { id: true },
    });
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    return certificate;
  }
}
