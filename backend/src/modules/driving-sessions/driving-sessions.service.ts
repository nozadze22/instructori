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
      await this.requireStudentUser(dto.studentUserId);
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

  async findForStudent(studentUserId: string) {
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

  private async requireStudentUser(studentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: studentUserId },
      select: { id: true, role: true },
    });
    if (!user) {
      throw new NotFoundException('Student user not found');
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
