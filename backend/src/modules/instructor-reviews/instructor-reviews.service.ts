import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationClientService } from '../notification-client/notification-client.service';
import type { AuthUser } from '../auth/dto/auth-types';
import {
  CreateInstructorReviewDto,
  UpdateInstructorReviewDto,
} from './dto/instructor-review.dto';

const reviewSelect = {
  id: true,
  instructorId: true,
  studentId: true,
  rating: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
  student: {
    select: {
      id: true,
      fullName: true,
      profile: {
        select: { avatarUrl: true },
      },
    },
  },
} satisfies Prisma.InstructorReviewSelect;

type ReviewRow = Prisma.InstructorReviewGetPayload<{
  select: typeof reviewSelect;
}>;

@Injectable()
export class InstructorReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationClient: NotificationClientService,
  ) {}

  async create(user: AuthUser, dto: CreateInstructorReviewDto) {
    this.assertStudentRole(user);
    await this.assertInstructorIsActive(dto.instructorId);
    await this.assertStudentMayReview(user.userId, dto.instructorId);

    const existing = await this.prisma.instructorReview.findUnique({
      where: {
        instructorId_studentId: {
          instructorId: dto.instructorId,
          studentId: user.userId,
        },
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        'You already reviewed this instructor. Update your existing review instead.',
      );
    }

    const comment = this.normalizeComment(dto.comment);
    const row = await this.prisma.instructorReview.create({
      data: {
        instructorId: dto.instructorId,
        studentId: user.userId,
        rating: dto.rating,
        comment,
      },
      select: reviewSelect,
    });

    void this.notificationClient.publishInstructorReviewCreated({
      reviewId: row.id,
      instructorId: row.instructorId,
      studentId: row.studentId,
      studentFullName: row.student.fullName,
      rating: row.rating,
      comment: row.comment,
    });

    return this.toReviewDto(row);
  }

  async update(user: AuthUser, id: string, dto: UpdateInstructorReviewDto) {
    this.assertStudentRole(user);
    const row = await this.findOwnedReview(user.userId, id);

    const data: Prisma.InstructorReviewUpdateInput = {};
    if (dto.rating !== undefined) {
      data.rating = dto.rating;
    }
    if (dto.comment !== undefined) {
      data.comment = this.normalizeComment(dto.comment);
    }

    const updated = await this.prisma.instructorReview.update({
      where: { id: row.id },
      data,
      select: reviewSelect,
    });

    return this.toReviewDto(updated);
  }

  async remove(user: AuthUser, id: string) {
    this.assertStudentRole(user);
    const row = await this.findOwnedReview(user.userId, id);
    await this.prisma.instructorReview.delete({ where: { id: row.id } });
    return { ok: true };
  }

  async findMineForInstructor(user: AuthUser, instructorId: string) {
    this.assertStudentRole(user);
    await this.assertInstructorIsActive(instructorId);

    const row = await this.prisma.instructorReview.findUnique({
      where: {
        instructorId_studentId: {
          instructorId,
          studentId: user.userId,
        },
      },
      select: reviewSelect,
    });

    if (!row) {
      return null;
    }
    return this.toReviewDto(row);
  }

  async listForInstructorAsOwner(
    instructorId: string,
    options: {
      sort?: 'newest' | 'oldest' | 'highest' | 'lowest';
      page?: number;
      pageSize?: number;
    },
  ) {
    return this.listForInstructor(instructorId, options);
  }

  async listPublic(
    instructorId: string,
    options: {
      sort?: 'newest' | 'oldest' | 'highest' | 'lowest';
      page?: number;
      pageSize?: number;
    },
  ) {
    await this.assertInstructorIsActive(instructorId);
    return this.listForInstructor(instructorId, options);
  }

  async getPublicSummary(instructorId: string) {
    await this.assertInstructorIsActive(instructorId);
    return this.buildSummary(instructorId);
  }

  private async listForInstructor(
    instructorId: string,
    options: {
      sort?: 'newest' | 'oldest' | 'highest' | 'lowest';
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 10));
    const sort = options.sort ?? 'newest';

    const orderBy = this.orderBy(sort);

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.instructorReview.count({ where: { instructorId } }),
      this.prisma.instructorReview.findMany({
        where: { instructorId },
        select: reviewSelect,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const summary = await this.buildSummary(instructorId);

    return {
      items: rows.map((row) => this.toReviewDto(row)),
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      summary,
    };
  }

  private async buildSummary(instructorId: string) {
    const grouped = await this.prisma.instructorReview.groupBy({
      by: ['rating'],
      where: { instructorId },
      _count: { rating: true },
    });

    const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let total = 0;
    let weighted = 0;
    for (const row of grouped) {
      const rating = row.rating as 1 | 2 | 3 | 4 | 5;
      if (rating >= 1 && rating <= 5) {
        breakdown[rating] = row._count.rating;
        total += row._count.rating;
        weighted += rating * row._count.rating;
      }
    }

    const average =
      total === 0 ? null : Math.round((weighted / total) * 100) / 100;

    return {
      count: total,
      average,
      breakdown,
    };
  }

  private orderBy(
    sort: 'newest' | 'oldest' | 'highest' | 'lowest',
  ): Prisma.InstructorReviewOrderByWithRelationInput[] {
    switch (sort) {
      case 'oldest':
        return [{ createdAt: 'asc' }];
      case 'highest':
        return [{ rating: 'desc' }, { createdAt: 'desc' }];
      case 'lowest':
        return [{ rating: 'asc' }, { createdAt: 'desc' }];
      case 'newest':
      default:
        return [{ createdAt: 'desc' }];
    }
  }

  private toReviewDto(row: ReviewRow) {
    return {
      id: row.id,
      instructorId: row.instructorId,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      student: {
        id: row.student.id,
        fullName: row.student.fullName,
        avatarUrl: row.student.profile?.avatarUrl ?? null,
      },
    };
  }

  withOwnFlag<T extends { student: { id: string } }>(
    review: T,
    viewerUserId?: string,
  ): T & { isOwnReview: boolean } {
    return {
      ...review,
      isOwnReview: viewerUserId ? review.student.id === viewerUserId : false,
    };
  }

  private assertStudentRole(user: AuthUser) {
    if (user.role !== 'USER') {
      throw new ForbiddenException('Only students can submit reviews');
    }
  }

  private async assertInstructorIsActive(instructorId: string) {
    const instructor = await this.prisma.user.findFirst({
      where: {
        id: instructorId,
        role: 'INSTRUCTOR',
        accessStatus: 'ACTIVE',
      },
      select: { id: true },
    });
    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }
  }

  private async assertStudentMayReview(studentId: string, instructorId: string) {
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, role: 'USER' },
      select: { linkedInstructorId: true },
    });
    if (!student) {
      throw new ForbiddenException('Student account required');
    }

    if (student.linkedInstructorId === instructorId) {
      return;
    }

    const session = await this.prisma.drivingSession.findFirst({
      where: {
        instructorId,
        studentUserId: studentId,
      },
      select: { id: true },
    });
    if (!session) {
      throw new ForbiddenException(
        'You can only review instructors you learn with',
      );
    }
  }

  private async findOwnedReview(studentId: string, id: string) {
    const row = await this.prisma.instructorReview.findUnique({
      where: { id },
      select: { id: true, studentId: true },
    });
    if (!row) {
      throw new NotFoundException('Review not found');
    }
    if (row.studentId !== studentId) {
      throw new ForbiddenException('You can only edit your own review');
    }
    return row;
  }

  private normalizeComment(value?: string | null) {
    if (value === null || value === undefined) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
