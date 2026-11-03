import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MistakeCatalogService } from '../mistake-catalog/mistake-catalog.service';
import {
  CreateDrivingMistakeDto,
  CreateDrivingSessionDto,
  UpdateDrivingMistakeDto,
} from './dto/driving-session.dto';

const mistakeInclude = {
  category: {
    select: { id: true, code: true, label: true, icon: true },
  },
  severity: {
    select: { id: true, code: true, label: true },
  },
} as const;

const sessionInclude = {
  route: {
    select: {
      id: true,
      title: true,
      city: true,
      path: true,
    },
  },
  mistakes: {
    orderBy: { timestamp: 'asc' as const },
    include: mistakeInclude,
  },
} as const;

@Injectable()
export class DrivingSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mistakeCatalog: MistakeCatalogService,
  ) {}

  async create(instructorId: string, role: string, dto: CreateDrivingSessionDto) {
    if (role !== 'INSTRUCTOR' && role !== 'ADMIN') {
      throw new ForbiddenException('Only instructors can start a practice session');
    }
    await this.requireRoute(dto.routeId);
    if (dto.studentUserId) {
      await this.requireStudentUser(dto.studentUserId, instructorId, role);
    }

    return this.prisma.drivingSession.create({
      data: {
        instructorId,
        studentName: dto.studentName.trim(),
        routeId: dto.routeId,
        studentUserId: dto.studentUserId ?? null,
      },
      include: sessionInclude,
    });
  }

  async findForInstructor(
    instructorId: string,
    filters: { studentName?: string; activeOnly?: boolean },
  ) {
    return this.prisma.drivingSession.findMany({
      where: {
        instructorId,
        ...(filters.studentName
          ? {
              studentName: {
                contains: filters.studentName.trim(),
                mode: 'insensitive',
              },
            }
          : {}),
        ...(filters.activeOnly ? { endedAt: null } : {}),
      },
      orderBy: { startedAt: 'desc' },
      include: {
        route: { select: { id: true, title: true, city: true } },
        _count: { select: { mistakes: true } },
      },
    });
  }

  async findForStudent(
    requesterId: string,
    role: string,
    studentUserId: string,
  ) {
    await this.assertCanAccessStudent(requesterId, role, studentUserId);

    return this.prisma.drivingSession.findMany({
      where: {
        studentUserId,
        endedAt: { not: null },
      },
      orderBy: { startedAt: 'desc' },
      include: {
        route: { select: { id: true, title: true, city: true } },
        _count: { select: { mistakes: true } },
      },
    });
  }

  async getPracticeOverview(
    requesterId: string,
    role: string,
    studentUserId: string,
  ) {
    await this.assertCanAccessStudent(requesterId, role, studentUserId);

    const student = await this.prisma.user.findUnique({
      where: { id: studentUserId },
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
      },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const sessions = await this.prisma.drivingSession.findMany({
      where: { studentUserId },
      orderBy: { startedAt: 'desc' },
      include: {
        route: { select: { id: true, title: true, city: true } },
        _count: { select: { mistakes: true } },
        mistakes: {
          orderBy: { timestamp: 'desc' },
          take: 8,
          include: {
            category: {
              select: { id: true, code: true, label: true, icon: true },
            },
            severity: {
              select: { id: true, code: true, label: true },
            },
          },
        },
      },
    });

    const completedSessions = sessions.filter((session) => session.endedAt);
    const recentMistakes = await this.prisma.drivingMistake.findMany({
      where: {
        session: { studentUserId },
      },
      orderBy: { timestamp: 'desc' },
      take: 40,
      include: {
        category: {
          select: { id: true, code: true, label: true, icon: true },
        },
        severity: {
          select: { id: true, code: true, label: true },
        },
        session: {
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
            route: { select: { id: true, title: true, city: true } },
          },
        },
      },
    });

    const categoryGroups = await this.prisma.drivingMistake.groupBy({
      by: ['categoryId'],
      where: {
        session: { studentUserId },
      },
      _count: { _all: true },
    });

    const categories = categoryGroups.length
      ? await this.prisma.mistakeCategory.findMany({
          where: {
            id: { in: categoryGroups.map((row) => row.categoryId) },
          },
          select: { id: true, code: true, label: true, icon: true },
        })
      : [];

    const categoryById = new Map(categories.map((item) => [item.id, item]));
    const categoryStats = categoryGroups
      .map((row) => {
        const meta = categoryById.get(row.categoryId);
        return {
          categoryId: row.categoryId,
          code: meta?.code ?? row.categoryId,
          label: meta?.label ?? row.categoryId,
          icon: meta?.icon ?? '📝',
          count: row._count._all,
        };
      })
      .sort((a, b) => b.count - a.count);

    const totalMistakes = sessions.reduce(
      (sum, session) => sum + session._count.mistakes,
      0,
    );
    const completedCount = completedSessions.length;
    const completedMistakes = completedSessions.reduce(
      (sum, session) => sum + session._count.mistakes,
      0,
    );
    const totalHours = completedSessions.reduce((sum, session) => {
      if (!session.endedAt) return sum;
      const ms =
        new Date(session.endedAt).getTime() -
        new Date(session.startedAt).getTime();
      return sum + Math.max(0, ms) / 3_600_000;
    }, 0);
    const averageMistakes =
      completedCount > 0 ? completedMistakes / completedCount : null;
    const readiness =
      completedCount > 0 && averageMistakes !== null
        ? Math.round(
            Math.min(
              100,
              Math.min(60, completedCount * 10) +
                Math.max(0, 40 - averageMistakes * 10),
            ),
          )
        : null;

    const trend = [...completedSessions]
      .reverse()
      .map((session) => ({
        sessionId: session.id,
        startedAt: session.startedAt,
        routeTitle: session.route.title,
        mistakeCount: session._count.mistakes,
      }));

    return {
      student: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        createdAt: student.createdAt,
        phone: student.profile?.phone ?? null,
        city: student.profile?.city ?? null,
        avatarUrl: student.profile?.avatarUrl ?? null,
      },
      stats: {
        completedCount,
        totalMistakes,
        averageMistakes:
          averageMistakes === null
            ? null
            : Math.round(averageMistakes * 10) / 10,
        readiness,
        totalHours: Math.round(totalHours * 10) / 10,
      },
      categories: categoryStats,
      trend,
      recentMistakes: recentMistakes.map((mistake) => ({
        id: mistake.id,
        sessionId: mistake.sessionId,
        categoryId: mistake.categoryId,
        category: mistake.category,
        severity: mistake.severity,
        note: mistake.note,
        timestamp: mistake.timestamp,
        route: mistake.session.route,
        sessionEndedAt: mistake.session.endedAt,
      })),
      sessions: sessions.map((session) => ({
        id: session.id,
        studentName: student.fullName,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        route: session.route,
        _count: session._count,
        recentMistakes: session.mistakes.map((mistake) => ({
          id: mistake.id,
          category: mistake.category,
          severity: mistake.severity,
          note: mistake.note,
          timestamp: mistake.timestamp,
        })),
      })),
    };
  }

  async findOne(userId: string, role: string, id: string) {
    const session = await this.prisma.drivingSession.findUnique({
      where: { id },
      include: sessionInclude,
    });
    if (!session) {
      throw new NotFoundException('Driving session not found');
    }
    this.assertCanAccessSession(session, userId, role);
    return session;
  }

  async addMistake(
    instructorId: string,
    sessionId: string,
    dto: CreateDrivingMistakeDto,
  ) {
    const session = await this.requireActiveSession(instructorId, sessionId);

    const categoryId = await this.mistakeCatalog.requireActiveCategoryId(
      dto.categoryId,
    );
    const severityId = await this.mistakeCatalog.resolveActiveSeverityId(
      dto.severityId,
    );

    return this.prisma.drivingMistake.create({
      data: {
        sessionId: session.id,
        categoryId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        severityId,
        note: dto.note?.trim() || null,
      },
      include: mistakeInclude,
    });
  }

  async listMistakes(userId: string, role: string, sessionId: string) {
    const session = await this.findOne(userId, role, sessionId);
    return session.mistakes;
  }

  async updateMistake(
    instructorId: string,
    sessionId: string,
    mistakeId: string,
    dto: UpdateDrivingMistakeDto,
  ) {
    await this.requireActiveSession(instructorId, sessionId);
    const mistake = await this.prisma.drivingMistake.findFirst({
      where: { id: mistakeId, sessionId },
    });
    if (!mistake) {
      throw new NotFoundException('Mistake not found');
    }

    let severityId: string | null | undefined;
    if (dto.severityId !== undefined) {
      severityId =
        dto.severityId === null
          ? null
          : await this.mistakeCatalog.resolveActiveSeverityId(dto.severityId);
    }

    return this.prisma.drivingMistake.update({
      where: { id: mistakeId },
      data: {
        ...(severityId !== undefined ? { severityId } : {}),
        ...(dto.note !== undefined ? { note: dto.note.trim() || null } : {}),
      },
      include: mistakeInclude,
    });
  }

  async finish(instructorId: string, sessionId: string) {
    const session = await this.requireActiveSession(instructorId, sessionId);
    return this.prisma.drivingSession.update({
      where: { id: session.id },
      data: { endedAt: new Date() },
      include: sessionInclude,
    });
  }

  private async requireActiveSession(instructorId: string, sessionId: string) {
    const session = await this.prisma.drivingSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Driving session not found');
    }
    if (session.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this session');
    }
    if (session.endedAt) {
      throw new BadRequestException('Session is already finished');
    }
    return session;
  }

  private async requireRoute(routeId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      select: { id: true },
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
  }

  private async requireStudentUser(
    studentUserId: string,
    instructorId: string,
    role: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: studentUserId },
      select: { id: true, role: true, linkedInstructorId: true },
    });
    if (!user || user.role !== 'USER') {
      throw new NotFoundException('Student user not found');
    }
    if (
      role !== 'ADMIN' &&
      user.linkedInstructorId !== instructorId
    ) {
      throw new ForbiddenException('Student is not in your group');
    }
  }

  private async assertCanAccessStudent(
    requesterId: string,
    role: string,
    studentUserId: string,
  ) {
    if (role === 'USER') {
      if (requesterId !== studentUserId) {
        throw new ForbiddenException('You can only view your own practices');
      }
      return;
    }
    if (role === 'INSTRUCTOR') {
      const student = await this.prisma.user.findFirst({
        where: {
          id: studentUserId,
          linkedInstructorId: requesterId,
          role: 'USER',
        },
        select: { id: true },
      });
      if (!student) {
        throw new ForbiddenException('Student is not in your group');
      }
      return;
    }
    if (role !== 'ADMIN') {
      throw new ForbiddenException('You cannot view these practices');
    }
  }

  private assertCanAccessSession(
    session: { instructorId: string; studentUserId: string | null },
    userId: string,
    role: string,
  ) {
    if (session.instructorId === userId) return;
    if (role === 'ADMIN') return;
    if (session.studentUserId === userId) return;
    throw new ForbiddenException('You cannot access this session');
  }
}
